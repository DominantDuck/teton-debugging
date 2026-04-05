import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateFlowchart } from '@/lib/ai/generate-flowchart'
import type { CreateSessionRequest } from '@/types/session'
import type { ApiResponse, CreateSessionResponse } from '@/types/api'

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<CreateSessionResponse>>> {
  try {
    const body: CreateSessionRequest = await request.json()
    const supabase = await createClient()

    // Only MCP sessions are supported
    if (body.source !== 'mcp') {
      return NextResponse.json(
        {
          success: false,
          error: 'Only MCP sessions are supported. Use /teton in Claude Code.',
        },
        { status: 400 }
      )
    }

    const conversationSummary = body.conversation_summary
    const currentError = body.current_error
    const currentFile = body.current_file
    const relevantFiles = body.relevant_files
    const dataModels = body.data_models
    const projectStructure = body.project_structure

    // Build raw context from MCP data
    const recentMessagesText = body.recent_messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n')

    const rawContext = [
      `Conversation Summary:\n${conversationSummary}`,
      currentError ? `Current Error:\n${currentError}` : '',
      currentFile ? `Current File: ${currentFile}` : '',
      relevantFiles?.length
        ? `Relevant Files:\n${relevantFiles.join('\n')}`
        : '',
      projectStructure ? `Project Structure:\n${projectStructure}` : '',
      `Recent Messages:\n${recentMessagesText}`,
    ]
      .filter(Boolean)
      .join('\n\n---\n\n')

    // Generate initial flowchart using Claude
    const { nodes, edges } = await generateFlowchart(rawContext)

    // Insert session into database
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        source: 'mcp',
        raw_context: rawContext,
        conversation_summary: conversationSummary,
        current_error: currentError,
        current_file: currentFile,
        relevant_files: relevantFiles,
        data_models: dataModels,
        project_structure: projectStructure,
        original_nodes: nodes,
        original_edges: edges,
        edited_nodes: nodes,
        edited_edges: edges,
        prompt_ready: false,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      throw error
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://teton-app-alpha.vercel.app'

    return NextResponse.json({
      success: true,
      data: {
        sessionId: data.id,
        url: `${baseUrl}/session/${data.id}`,
      },
    })
  } catch (error) {
    console.error('Failed to create session:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to create session',
      },
      { status: 500 }
    )
  }
}

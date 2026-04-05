import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePrompt } from '@/lib/ai/generate-prompt'
import type { GeneratePromptRequest, Session } from '@/types/session'
import type { ApiResponse, GeneratePromptResponse } from '@/types/api'

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<GeneratePromptResponse>>> {
  try {
    const body: GeneratePromptRequest = await request.json()
    const supabase = await createClient()

    // Load the original session for context
    const { data: session, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', body.session_id)
      .single()

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError)
      throw fetchError
    }

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    // Generate structured prompt from edited flowchart
    const prompt = await generatePrompt(
      body.nodes,
      body.edges,
      session as Session
    )

    // Update session with generated prompt
    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        edited_nodes: body.nodes,
        edited_edges: body.edges,
        generated_prompt: prompt,
        prompt_ready: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.session_id)

    if (updateError) {
      console.error('Supabase update error:', updateError)
      throw updateError
    }

    return NextResponse.json({
      success: true,
      data: { prompt },
    })
  } catch (error) {
    console.error('Failed to generate prompt:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to generate prompt',
      },
      { status: 500 }
    )
  }
}

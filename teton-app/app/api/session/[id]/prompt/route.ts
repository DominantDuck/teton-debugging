import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse, PromptPollResponse } from '@/types/api'

// This endpoint is polled every 2 seconds by the MCP package
// Keep it extremely fast - only read prompt_ready, generated_prompt, cancelled
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<PromptPollResponse>>> {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('sessions')
      .select('prompt_ready, generated_prompt, cancelled')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Supabase fetch error:', error)
      throw error
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ready: data.prompt_ready,
        prompt: data.prompt_ready ? data.generated_prompt : undefined,
        cancelled: data.cancelled || false,
      },
    })
  } catch (error) {
    console.error('Failed to poll prompt:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to poll prompt',
      },
      { status: 500 }
    )
  }
}

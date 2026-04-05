import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Session } from '@/types/session'
import type { ApiResponse } from '@/types/api'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Session>>> {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
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

    return NextResponse.json({ success: true, data: data as Session })
  } catch (error) {
    console.error('Failed to load session:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to load session',
      },
      { status: 500 }
    )
  }
}

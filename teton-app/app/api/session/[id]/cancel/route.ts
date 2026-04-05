import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types/api'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ cancelled: boolean }>>> {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from('sessions')
      .update({ cancelled: true })
      .eq('id', id)

    if (error) {
      console.error('Supabase update error:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      data: { cancelled: true },
    })
  } catch (error) {
    console.error('Failed to cancel session:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel',
      },
      { status: 500 }
    )
  }
}

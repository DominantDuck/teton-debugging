import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import SessionClient from './SessionClient'
import type { Session } from '@/types/session'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SessionPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  return <SessionClient session={data as Session} />
}

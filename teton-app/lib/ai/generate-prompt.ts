import Anthropic from '@anthropic-ai/sdk'
import type { FlowNode, FlowEdge, Session } from '@/types/session'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are a debugging assistant. A user has corrected a flowchart showing how data should flow through their code. Compress their corrected flowchart into a clear, structured prompt they can send back to Claude Code to fix the problem.

You will receive:
1. The original conversation context (what was tried, what broke)
2. The corrected flowchart (what the user says should happen)

Generate a structured prompt that:
- Summarises what has already been tried in 2-3 sentences (so Claude Code does not repeat it)
- Describes the intended data flow step by step in plain English
- Identifies the specific breakdown point
- Asks Claude Code to fix that specific step without breaking what already works

Write it as if the user is speaking directly to Claude Code.
Return plain text only. No JSON. No markdown headers. No bullet points.`

export async function generatePrompt(
  nodes: FlowNode[],
  edges: FlowEdge[],
  session: Session
): Promise<string> {
  const flowDescription = nodes
    .map(
      (n, i) =>
        `${i + 1}. ${n.data.label}${n.data.description ? ` - ${n.data.description}` : ''}`
    )
    .join('\n')

  const originalContext =
    session.raw_context ||
    session.conversation_summary ||
    'No original context provided'

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Original context:\n${originalContext}\n\nCorrected data flow:\n${flowDescription}`,
      },
    ],
  })

  const textContent = response.content.find((c) => c.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in response')
  }

  return textContent.text
}

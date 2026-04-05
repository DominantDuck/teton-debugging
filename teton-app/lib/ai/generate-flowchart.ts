import Anthropic from '@anthropic-ai/sdk'
import type { FlowNode, FlowEdge } from '@/types/session'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are a code debugger. Read conversation context from Claude Code and extract the data flow as a visual diagram.

Given context, identify the steps in the data flow:
- What data or state enters the flow
- What transformations or processes happen
- What the expected output should be
- Where the breakdown is occurring

Return JSON only. No prose. No markdown. Raw JSON object only.

Format:
{
  "nodes": [
    {
      "id": "n1",
      "type": "flowNode",
      "position": { "x": 340, "y": 40 },
      "data": {
        "label": "plain English description of what this step does",
        "description": "optional — additional context about this step"
      }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "n1",
      "target": "n2"
    }
  ]
}

Rules:
- Write every label in plain English, not code
- Maximum 8 nodes
- Space nodes vertically: first node y=40, each subsequent node y += 120
- Center nodes horizontally at x=340 (for single column) or spread at x=180 and x=500 for branches
- Add a description to nodes where the breakdown occurs or where clarification helps`

export async function generateFlowchart(context: string): Promise<{
  nodes: FlowNode[]
  edges: FlowEdge[]
}> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Here is the Claude Code context to analyze:\n\n${context}`,
      },
    ],
  })

  const textContent = response.content.find((c) => c.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in response')
  }

  // Strip markdown fences if present
  const cleaned = textContent.text.replace(/```json|```/g, '').trim()

  try {
    const result = JSON.parse(cleaned)
    return {
      nodes: result.nodes || [],
      edges: result.edges || [],
    }
  } catch {
    // If parsing fails, return a minimal error flowchart
    return {
      nodes: [
        {
          id: 'n1',
          type: 'flowNode',
          position: { x: 340, y: 40 },
          data: {
            label: 'Unable to parse context',
            description: 'The provided context could not be analyzed',
          },
        },
      ],
      edges: [],
    }
  }
}

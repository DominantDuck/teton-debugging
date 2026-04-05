import type { Node, Edge } from '@xyflow/react'

export interface FlowNodeData extends Record<string, unknown> {
  label: string
  description?: string
}

export type FlowNode = Node<FlowNodeData, 'flowNode'>
export type FlowEdge = Edge

export interface Session {
  id: string
  source: 'mcp'
  raw_context: string | null
  conversation_summary: string | null
  current_error: string | null
  current_file: string | null
  relevant_files: string[] | null
  data_models: string[] | null
  project_structure: string | null
  original_nodes: FlowNode[] | null
  original_edges: FlowEdge[] | null
  edited_nodes: FlowNode[] | null
  edited_edges: FlowEdge[] | null
  generated_prompt: string | null
  prompt_ready: boolean
  cancelled: boolean
  created_at: string
  updated_at: string
}

export interface CreateSessionRequest {
  source: 'mcp'
  conversation_summary: string
  current_error: string
  current_file: string
  relevant_files: string[]
  data_models: string[]
  project_structure: string
  recent_messages: Array<{ role: string; content: string }>
}

export interface GeneratePromptRequest {
  session_id: string
  nodes: FlowNode[]
  edges: FlowEdge[]
}

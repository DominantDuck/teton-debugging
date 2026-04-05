'use client'

import { useCallback, useState, useMemo } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  type NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import FlowNodeComponent from './FlowNode'
import CanvasToolbar from './CanvasToolbar'
import type { FlowNode, FlowEdge, Session } from '@/types/session'

interface TetonCanvasProps {
  session: Session
  onGeneratePrompt: (nodes: FlowNode[], edges: FlowEdge[]) => Promise<void>
}

export default function TetonCanvas({
  session,
  onGeneratePrompt,
}: TetonCanvasProps) {
  // Memoize nodeTypes to prevent recreation on every render
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      flowNode: FlowNodeComponent,
    }),
    []
  )

  // Initialize nodes with the flowNode type
  const initialNodes = useMemo(
    () =>
      (session.edited_nodes || session.original_nodes || []).map((n) => ({
        ...n,
        type: 'flowNode' as const,
      })),
    [session.edited_nodes, session.original_nodes]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    session.edited_edges || session.original_edges || []
  )
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [isCancelled, setIsCancelled] = useState(false)

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds))
    },
    [setEdges]
  )

  const handleAddNode = useCallback(() => {
    // Find the lowest y position among existing nodes
    const maxY = nodes.reduce(
      (max, node) => Math.max(max, node.position.y),
      -80
    )

    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      type: 'flowNode',
      position: { x: 340, y: maxY + 120 },
      data: {
        label: 'New step',
      },
    }

    setNodes((nds) => [...nds, newNode])
  }, [nodes, setNodes])

  const handleSend = useCallback(async () => {
    if (isSending || isSent) return

    setIsSending(true)
    try {
      await onGeneratePrompt(nodes as FlowNode[], edges as FlowEdge[])
      setIsSent(true)
    } catch (error) {
      console.error('Failed to send:', error)
      setIsSending(false)
    }
  }, [nodes, edges, onGeneratePrompt, isSending, isSent])

  const handleCancel = useCallback(async () => {
    try {
      await fetch(`/api/session/${session.id}/cancel`, { method: 'POST' })
      setIsCancelled(true)
    } catch (error) {
      console.error('Failed to cancel:', error)
    }
  }, [session.id])

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-[#fafafa]"
        deleteKeyCode={['Backspace', 'Delete']}
        defaultEdgeOptions={{
          type: 'default',
          style: { strokeWidth: 1.5, stroke: '#d1d5db' },
        }}
      >
        <Controls position="bottom-left" showInteractive={false} />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#e5e5e5"
        />
      </ReactFlow>

      <CanvasToolbar
        onSend={handleSend}
        onAddNode={handleAddNode}
        onCancel={handleCancel}
        isSending={isSending}
        isSent={isSent}
      />

      {/* Status indicator */}
      {isCancelled && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-md px-4 py-2 text-sm text-gray-600">
          Cancelled. You can close this tab.
        </div>
      )}
      {isSent && !isCancelled && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-md px-4 py-2 text-sm text-gray-600">
          Waiting for Claude Code to receive the prompt...
        </div>
      )}
    </div>
  )
}

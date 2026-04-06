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

function ShareButton() {
  const [showCopied, setShowCopied] = useState(false)

  const handleShare = useCallback(async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    }
  }, [])

  return (
    <button
      onClick={handleShare}
      className="bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors relative"
      title="Share"
    >
      <svg
        className="w-4 h-4 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
        />
      </svg>
      <span className="text-sm font-medium text-gray-700">Share</span>
      {showCopied && (
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap">
          Link copied!
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
        </div>
      )}
    </button>
  )
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

      {/* Share button - top right */}
      <div className="absolute top-4 right-4 z-10">
        <ShareButton />
      </div>

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

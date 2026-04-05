'use client'

import { memo, useState, useCallback } from 'react'
import { Handle, Position, useReactFlow } from '@xyflow/react'
import type { FlowNodeData } from '@/types/session'

interface FlowNodeComponentProps {
  id: string
  data: FlowNodeData
  selected?: boolean
}

function FlowNodeComponent({ id, data, selected }: FlowNodeComponentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(data.label)
  const { setNodes } = useReactFlow()

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true)
    setEditValue(data.label)
  }, [data.label])

  const handleSave = useCallback(() => {
    setIsEditing(false)
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, label: editValue } } : n
      )
    )
  }, [id, editValue, setNodes])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave()
      }
      if (e.key === 'Escape') {
        setIsEditing(false)
        setEditValue(data.label)
      }
    },
    [data.label, handleSave]
  )

  return (
    <div
      className={`
        flex items-center px-5 py-3
        bg-white rounded-full
        border border-gray-200
        shadow-sm hover:shadow-md
        transition-all duration-200
        min-w-[160px] max-w-[280px]
        ${selected ? 'ring-2 ring-gray-900 ring-offset-2' : ''}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-gray-300 !border-2 !border-white !w-2 !h-2"
      />

      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          className="text-sm font-medium text-gray-800 bg-transparent border-none outline-none w-full"
        />
      ) : (
        <span
          onDoubleClick={handleDoubleClick}
          className="text-sm font-medium text-gray-800 truncate cursor-text"
          title="Double-click to edit"
        >
          {data.label}
        </span>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-gray-300 !border-2 !border-white !w-2 !h-2"
      />
    </div>
  )
}

export default memo(FlowNodeComponent)

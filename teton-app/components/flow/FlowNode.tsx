'use client'

import { memo, useState, useCallback, useMemo } from 'react'
import { Handle, Position, useReactFlow } from '@xyflow/react'
import type { FlowNodeData } from '@/types/session'

interface FlowNodeComponentProps {
  id: string
  data: FlowNodeData
  selected?: boolean
}

// Highlight keywords in the label to make it more engaging
function formatLabel(label: string): React.ReactNode {
  // Patterns to highlight: function calls, quoted strings, arrows, key action words
  const patterns = [
    // Function calls like fetchData(), handleClick()
    { regex: /(\w+)\(\)/g, replacement: '<fn>$1()</fn>' },
    // Quoted strings
    { regex: /"([^"]+)"/g, replacement: '<str>"$1"</str>' },
    { regex: /'([^']+)'/g, replacement: '<str>\'$1\'</str>' },
    // Arrows and flow indicators
    { regex: /(→|->|=>)/g, replacement: '<arrow>$1</arrow>' },
    // Key action words
    { regex: /\b(returns?|sends?|receives?|calls?|fetche?s?|updates?|creates?|deletes?|validates?|checks?|if|then|else|error|success|fail(?:ed|s)?)\b/gi, replacement: '<kw>$1</kw>' },
    // Variables/identifiers in backticks
    { regex: /`([^`]+)`/g, replacement: '<var>$1</var>' },
  ]

  let processed = label
  patterns.forEach(({ regex, replacement }) => {
    processed = processed.replace(regex, replacement)
  })

  // Parse the marked-up string into React elements
  const parts: React.ReactNode[] = []
  let remaining = processed
  let keyIndex = 0

  const tagRegex = /<(fn|str|arrow|kw|var)>([^<]+)<\/\1>/g
  let lastIndex = 0
  let match

  while ((match = tagRegex.exec(processed)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(processed.slice(lastIndex, match.index))
    }

    const [, tag, content] = match
    const key = `${tag}-${keyIndex++}`

    switch (tag) {
      case 'fn':
        parts.push(
          <span key={key} className="font-bold text-blue-600 bg-blue-50 px-1 rounded">
            {content}
          </span>
        )
        break
      case 'str':
        parts.push(
          <span key={key} className="font-semibold text-emerald-600">
            {content}
          </span>
        )
        break
      case 'arrow':
        parts.push(
          <span key={key} className="font-bold text-gray-400 mx-1">
            {content}
          </span>
        )
        break
      case 'kw':
        parts.push(
          <span key={key} className="font-semibold text-purple-600">
            {content}
          </span>
        )
        break
      case 'var':
        parts.push(
          <span key={key} className="font-mono font-semibold text-orange-600 bg-orange-50 px-1 rounded">
            {content}
          </span>
        )
        break
    }

    lastIndex = match.index + match[0].length
  }

  // Add any remaining text
  if (lastIndex < processed.length) {
    parts.push(processed.slice(lastIndex))
  }

  return parts.length > 0 ? parts : label
}

function FlowNodeComponent({ id, data, selected }: FlowNodeComponentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(data.label)
  const { setNodes } = useReactFlow()

  const formattedLabel = useMemo(() => formatLabel(data.label), [data.label])

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
        bg-white rounded-2xl
        border-2 border-gray-100
        shadow-md hover:shadow-lg
        transition-all duration-200
        min-w-[180px] max-w-[400px]
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2 border-blue-200' : 'hover:border-gray-200'}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-400 !border-2 !border-white !w-3 !h-3 !-top-1.5"
      />

      {isEditing ? (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          rows={2}
          className="text-sm font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-lg outline-none w-full p-2 resize-none focus:ring-2 focus:ring-blue-200"
        />
      ) : (
        <div
          onDoubleClick={handleDoubleClick}
          className="text-sm leading-relaxed text-gray-700 cursor-text whitespace-pre-wrap break-words"
          title="Double-click to edit"
        >
          {formattedLabel}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-400 !border-2 !border-white !w-3 !h-3 !-bottom-1.5"
      />
    </div>
  )
}

export default memo(FlowNodeComponent)

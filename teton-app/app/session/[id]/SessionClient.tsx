'use client'

import { useState, useCallback } from 'react'
import TetonCanvas from '@/components/flow/TetonCanvas'
import type { Session, FlowNode, FlowEdge } from '@/types/session'

interface SessionClientProps {
  session: Session
}

export default function SessionClient({ session }: SessionClientProps) {
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGeneratePrompt = useCallback(
    async (nodes: FlowNode[], edges: FlowEdge[]) => {
      setError(null)

      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          nodes,
          edges,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to generate prompt')
        throw new Error(result.error)
      }

      setGeneratedPrompt(result.data.prompt)
    },
    [session.id]
  )

  const handleCopy = useCallback(() => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt)
    }
  }, [generatedPrompt])

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Canvas area */}
      <div className="flex-1 relative">
        <TetonCanvas session={session} onGeneratePrompt={handleGeneratePrompt} />
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border-t border-red-200 px-6 py-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Generated prompt panel */}
      {generatedPrompt && (
        <div className="bg-white border-t shadow-lg">
          <div className="max-h-64 overflow-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Generated Prompt
                </h2>
                <p className="text-xs text-gray-500">
                  This has been sent to Claude Code. You can also copy it
                  manually.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="px-4 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                  Copy
                </button>
                <a
                  href="/"
                  className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  New Session
                </a>
              </div>
            </div>
            <pre className="text-sm whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-lg border text-gray-800">
              {generatedPrompt}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

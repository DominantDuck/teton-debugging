'use client'

interface CanvasToolbarProps {
  onSend: () => Promise<void>
  onAddNode: () => void
  onCancel: () => Promise<void>
  isSending: boolean
  isSent: boolean
}

export default function CanvasToolbar({
  onSend,
  onAddNode,
  onCancel,
  isSending,
  isSent,
}: CanvasToolbarProps) {
  const handleSend = async () => {
    if (isSending || isSent) return
    await onSend()
  }

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-3">
        {/* Add node button */}
        <button
          onClick={onAddNode}
          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          title="Add Step"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200" />

        {/* Cancel button */}
        <button
          onClick={onCancel}
          disabled={isSent}
          className="px-4 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={isSending || isSent}
          className={`
            px-5 py-2 rounded-full font-medium transition-all text-sm
            ${
              isSent
                ? 'bg-green-500 text-white cursor-default'
                : isSending
                  ? 'bg-gray-300 text-gray-500 cursor-wait'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
            }
          `}
        >
          {isSent ? 'Sent' : isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="max-w-md w-full px-6 text-center">
        {/* Logo */}
        <h1 className="font-serif text-5xl font-semibold text-gray-900 mb-3">
          Teton
        </h1>
        <p className="text-gray-500 mb-12">
          Visual debugging for Claude Code
        </p>

        {/* Instructions card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>

          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Open from Claude Code
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Run the command below in Claude Code to start debugging visually
          </p>

          {/* Command */}
          <div className="bg-gray-900 rounded-lg px-4 py-3 font-mono text-sm text-white">
            /teton
          </div>
        </div>

        {/* How it works */}
        <div className="mt-12 text-left">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
            How it works
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                1
              </div>
              <div>
                <p className="text-sm text-gray-700">Run /teton in Claude Code</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Claude generates a flowchart of what it thinks is happening
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                2
              </div>
              <div>
                <p className="text-sm text-gray-700">Edit the flowchart</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Fix the nodes to show what should actually happen
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                3
              </div>
              <div>
                <p className="text-sm text-gray-700">Send it back</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Get a structured prompt that guides Claude to the fix
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Setup */}
        <div className="mt-12 text-left">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
            Setup (one-time)
          </h3>

          <div className="space-y-6">
            {/* Step 1 */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">1. Clone and build</p>
              <div className="bg-gray-900 rounded-lg px-4 py-3 font-mono text-xs text-gray-300 overflow-x-auto">
                <div>git clone https://github.com/DominantDuck/teton-debugging.git</div>
                <div>cd teton-debugging/teton-mcp</div>
                <div>npm install && npm run build</div>
              </div>
            </div>

            {/* Step 2 */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">2. Add to ~/.claude.json</p>
              <div className="bg-gray-900 rounded-lg px-4 py-3 font-mono text-xs text-gray-300 overflow-x-auto">
                <pre>{`{
  "mcpServers": {
    "teton": {
      "command": "node",
      "args": ["<PATH>/teton-mcp/dist/index.js"]
    }
  }
}`}</pre>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Replace &lt;PATH&gt; with your actual path
              </p>
            </div>

            {/* Step 3 */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">3. Restart Claude Code</p>
              <div className="bg-gray-900 rounded-lg px-4 py-3 font-mono text-xs text-gray-300">
                claude
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

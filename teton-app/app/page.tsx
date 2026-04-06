export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="font-bold text-xl tracking-tight">
          <span className="bg-gray-900 text-white px-2 py-1 rounded-lg">Teton</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#setup" className="text-sm text-gray-600 hover:text-gray-900">Setup</a>
          <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900">How it works</a>
          <a
            href="https://github.com/DominantDuck/teton-debugging"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            GitHub
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-32 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-600 mb-8">
          MCP Server for Claude Code
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 mb-6">
          When Claude is stuck,<br />
          <span className="text-gray-400">show it what you mean</span>
        </h1>

        <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto">
          Visual debugging for Claude Code. Edit the data flow, send back a fix.
        </p>

        <a
          href="#setup"
          className="inline-block bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Get started
        </a>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50 px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">
            How it works
          </h2>
          <p className="text-gray-500 text-center mb-16 max-w-lg mx-auto">
            Claude generates a flowchart. You fix it. Claude fixes the code.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: '1.',
                title: 'Open Teton',
                desc: 'Tell Claude to "debug with Teton". It scans your codebase and generates a flowchart of the current data flow.',
                color: 'bg-red-100',
                emoji: '~',
              },
              {
                num: '2.',
                title: 'Edit the flow',
                desc: 'The flowchart shows what Claude thinks is happening. Drag, edit, or add nodes to show what should happen.',
                color: 'bg-blue-100',
                emoji: '^',
              },
              {
                num: '3.',
                title: 'Send it back',
                desc: 'Click Send. A structured prompt is sent back to Claude Code with exactly what to fix.',
                color: 'bg-amber-100',
                emoji: '!',
              },
            ].map((item) => (
              <div
                key={item.num}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <p className="text-2xl font-bold text-gray-300 mb-4">{item.num}</p>
                <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center text-2xl mb-4`}>
                  {item.emoji}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Setup */}
      <section id="setup" className="px-6 py-24">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">
            Setup
          </h2>
          <p className="text-gray-500 text-center mb-12">
            One-time setup, takes about 2 minutes
          </p>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </span>
                <h3 className="font-semibold text-gray-900">Install the MCP server</h3>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm overflow-x-auto">
                <div className="text-gray-300">
                  <span className="text-gray-500">$</span> npm install -g teton-mcp
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </span>
                <h3 className="font-semibold text-gray-900">
                  Add to <code className="bg-gray-200 px-1.5 py-0.5 rounded text-sm">~/.claude.json</code>
                </h3>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-gray-300">{`{
  "mcpServers": {
    "teton": {
      "command": "teton-mcp"
    }
  }
}`}</pre>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </span>
                <h3 className="font-semibold text-gray-900">Restart Claude Code</h3>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm">
                <span className="text-gray-500">$</span>{' '}
                <span className="text-gray-300">claude</span>
              </div>
            </div>
          </div>

          {/* Usage */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 mb-4">Then just ask Claude:</p>
            <div className="inline-block bg-gray-100 rounded-full px-6 py-3 font-mono text-sm text-gray-700">
              "debug with Teton"
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="font-bold text-lg">
            <span className="bg-gray-900 text-white px-2 py-1 rounded-lg text-sm">Teton</span>
          </div>
          <p className="text-sm text-gray-400">
            Built for{' '}
            <a
              href="https://claude.ai/code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Claude Code
            </a>
          </p>
        </div>
      </footer>
    </main>
  )
}

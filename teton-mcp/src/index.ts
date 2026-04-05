#!/usr/bin/env node

/**
 * Teton MCP Server
 *
 * CRITICAL: Never use console.log() in MCP servers - it corrupts stdio JSON-RPC.
 * Use console.error() for all logging (writes to stderr, safe for MCP).
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { spawn, execSync } from 'child_process'
import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

// CRITICAL: Only use console.error() for logging
const log = (...args: unknown[]) => console.error('[teton]', ...args)

const TETON_API_URL = process.env.TETON_API_URL || 'https://teton-app-alpha.vercel.app'
const POLL_INTERVAL = 2000 // 2 seconds
const POLL_TIMEOUT = 10 * 60 * 1000 // 10 minutes

// ============================================================================
// Codebase Scanner
// ============================================================================

interface FileSnapshot {
  path: string
  exports: string[]
  imports: string[]
  functions: string[]
}

interface CodebaseSnapshot {
  projectRoot: string
  files: FileSnapshot[]
  dataModels: string[]
}

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '.cache',
  '__pycache__',
])

const INCLUDE_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.py',
  '.sql',
  '.prisma',
])

function walkDir(dir: string, files: string[] = [], depth = 0): string[] {
  if (depth > 5) return files // Limit depth

  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry)) continue

      const fullPath = join(dir, entry)
      try {
        const stat = statSync(fullPath)
        if (stat.isDirectory()) {
          walkDir(fullPath, files, depth + 1)
        } else if (stat.isFile()) {
          const ext = entry.substring(entry.lastIndexOf('.'))
          if (INCLUDE_EXTENSIONS.has(ext)) {
            files.push(fullPath)
          }
        }
      } catch {
        // Skip unreadable entries
      }
    }
  } catch {
    // Skip unreadable directories
  }

  return files
}

function extractExports(content: string): string[] {
  const matches =
    content.match(
      /export\s+(default\s+)?(function|const|class|async function)\s+(\w+)/g
    ) || []
  return matches
    .map((m) => m.split(/\s+/).pop() || '')
    .filter(Boolean)
    .slice(0, 10)
}

function extractImports(content: string): string[] {
  const matches = content.match(/from\s+['"]([^'"]+)['"]/g) || []
  return matches
    .map((m) => m.replace(/from\s+['"]|['"]/g, '').trim())
    .filter(Boolean)
    .slice(0, 10)
}

function extractFunctions(content: string): string[] {
  const matches =
    content.match(/(export\s+)?(async\s+)?function\s+(\w+)\s*\(/g) || []
  return matches
    .map((m) => {
      const n = m.match(/function\s+(\w+)/)
      return n ? n[1] : ''
    })
    .filter(Boolean)
    .slice(0, 10)
}

function extractModels(content: string): string[] {
  const matches =
    content.match(/model\s+(\w+)\s*\{|CREATE TABLE\s+(\w+)/gi) || []
  return matches
    .map((m) => m.split(/\s+/)[1] || '')
    .filter(Boolean)
    .slice(0, 10)
}

function scanCodebase(rootDir: string): CodebaseSnapshot {
  log('Scanning codebase at:', rootDir)

  const allFiles = walkDir(rootDir)
  const files: FileSnapshot[] = []
  const dataModels: string[] = []

  // Limit to 80 files to keep context reasonable
  for (const filePath of allFiles.slice(0, 80)) {
    try {
      const content = readFileSync(filePath, 'utf-8')
      const relativePath = relative(rootDir, filePath)

      files.push({
        path: relativePath,
        exports: extractExports(content),
        imports: extractImports(content),
        functions: extractFunctions(content),
      })

      if (filePath.endsWith('.sql') || filePath.endsWith('.prisma')) {
        dataModels.push(...extractModels(content))
      }
    } catch {
      // Skip unreadable files
    }
  }

  log(`Scanned ${files.length} files, found ${dataModels.length} data models`)

  return { projectRoot: rootDir, files, dataModels }
}

// ============================================================================
// Context Merger
// ============================================================================

interface MergeInput {
  conversationHistory: Array<{ role: string; content: string }>
  currentError?: string
  currentFile?: string
  codebaseSnapshot: CodebaseSnapshot
}

interface MergedContext {
  conversationSummary: string
  currentError: string
  currentFile: string
  recentMessages: Array<{ role: string; content: string }>
  relevantFiles: string[]
  dataModels: string[]
  projectStructure: string
}

function findRelevantFiles(
  currentFile: string | undefined,
  currentError: string | undefined,
  snapshot: CodebaseSnapshot
): string[] {
  const relevant = new Set<string>()

  if (currentFile) {
    relevant.add(currentFile)
    const name = currentFile.split('/').pop() || ''
    snapshot.files.forEach((f) => {
      if (f.imports.some((i) => i.includes(name))) {
        relevant.add(f.path)
      }
    })
  }

  if (currentError) {
    snapshot.files.forEach((f) => {
      if (currentError.includes(f.path)) {
        relevant.add(f.path)
      }
    })
  }

  return [...relevant].slice(0, 10)
}

function buildStructure(snapshot: CodebaseSnapshot): string {
  const dirs = new Map<string, string[]>()

  snapshot.files.forEach((f) => {
    const parts = f.path.split('/')
    const dir = parts.slice(0, -1).join('/') || 'root'
    if (!dirs.has(dir)) dirs.set(dir, [])
    dirs.get(dir)!.push(parts[parts.length - 1])
  })

  const lines: string[] = []
  dirs.forEach((files, dir) => {
    lines.push(`${dir}/`)
    files.slice(0, 5).forEach((f) => lines.push(`  ${f}`))
    if (files.length > 5) {
      lines.push(`  ... and ${files.length - 5} more`)
    }
  })

  return lines.join('\n')
}

function mergeContext(input: MergeInput): MergedContext {
  const { conversationHistory, currentError, currentFile, codebaseSnapshot } =
    input
  const recentMessages = conversationHistory.slice(-10)

  const conversationSummary = recentMessages
    .map((m) => `${m.role.toUpperCase()}: ${m.content.slice(0, 400)}`)
    .join('\n\n')

  const relevantFiles = findRelevantFiles(
    currentFile,
    currentError,
    codebaseSnapshot
  )
  const projectStructure = buildStructure(codebaseSnapshot)

  return {
    conversationSummary,
    currentError: currentError || 'No specific error provided',
    currentFile: currentFile || 'Unknown',
    recentMessages,
    relevantFiles,
    dataModels: codebaseSnapshot.dataModels,
    projectStructure,
  }
}

// ============================================================================
// API Client
// ============================================================================

interface TetonSession {
  id: string
  url: string
}

async function createSession(context: MergedContext): Promise<TetonSession> {
  log('Creating session...')

  const response = await fetch(`${TETON_API_URL}/api/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: 'mcp',
      conversation_summary: context.conversationSummary,
      current_error: context.currentError,
      current_file: context.currentFile,
      recent_messages: context.recentMessages,
      relevant_files: context.relevantFiles,
      data_models: context.dataModels,
      project_structure: context.projectStructure,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to create session: ${response.status} ${text}`)
  }

  const result = await response.json()
  if (!result.success) {
    throw new Error(result.error || 'Unknown error creating session')
  }

  return {
    id: result.data.sessionId,
    url: `${TETON_API_URL}/session/${result.data.sessionId}`,
  }
}

async function waitForPrompt(sessionId: string): Promise<string> {
  log('Waiting for user to edit canvas and click Send...')
  log('(User can click Cancel in the browser to abort)')

  const startTime = Date.now()

  while (Date.now() - startTime < POLL_TIMEOUT) {
    try {
      const response = await fetch(
        `${TETON_API_URL}/api/session/${sessionId}/prompt`
      )

      if (!response.ok) {
        log(`Poll error: ${response.status}`)
      } else {
        const result = await response.json()

        // Check if user cancelled
        if (result.success && result.data.cancelled) {
          throw new Error('Session cancelled by user')
        }

        if (result.success && result.data.ready && result.data.prompt) {
          return result.data.prompt
        }
      }
    } catch (err) {
      // Re-throw cancellation errors
      if (err instanceof Error && err.message === 'Session cancelled by user') {
        throw err
      }
      log('Poll error:', err)
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL))
  }

  throw new Error('Teton session timed out after 10 minutes')
}

function openBrowser(url: string): void {
  log('Opening browser:', url)

  const platform = process.platform
  let command: string

  if (platform === 'darwin') {
    command = 'open'
  } else if (platform === 'win32') {
    command = 'start'
  } else {
    command = 'xdg-open'
  }

  try {
    spawn(command, [url], { detached: true, stdio: 'ignore' }).unref()
  } catch (err) {
    log('Failed to open browser:', err)
  }
}

// ============================================================================
// MCP Server
// ============================================================================

const server = new Server(
  { name: 'teton', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'teton',
      description:
        'Open Teton debugger to visualize the current data flow and fix the bug. Use when the user types /teton or asks to debug with Teton.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          conversation_history: {
            type: 'array',
            description:
              'Last 20 messages from the current Claude Code conversation',
            items: {
              type: 'object',
              properties: {
                role: { type: 'string' },
                content: { type: 'string' },
              },
            },
          },
          current_error: {
            type: 'string',
            description: 'The most recent error message or problem description',
          },
          current_file: {
            type: 'string',
            description: 'The file currently being edited',
          },
          working_directory: {
            type: 'string',
            description: 'The project root directory',
          },
        },
        required: ['conversation_history'],
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== 'teton') {
    throw new Error(`Unknown tool: ${request.params.name}`)
  }

  const args = request.params.arguments as {
    conversation_history?: Array<{ role: string; content: string }>
    current_error?: string
    current_file?: string
    working_directory?: string
  }

  const conversationHistory = args.conversation_history || []
  const currentError = args.current_error
  const currentFile = args.current_file
  const cwd = args.working_directory || process.cwd()

  try {
    // Scan codebase
    log('Scanning codebase...')
    const codebaseSnapshot = scanCodebase(cwd)

    // Merge context
    log('Merging context...')
    const merged = mergeContext({
      conversationHistory,
      currentError,
      currentFile,
      codebaseSnapshot,
    })

    // Create session
    const session = await createSession(merged)
    log(`Session created: ${session.id}`)

    // Open browser
    openBrowser(session.url)

    // Wait for user to complete editing (polls every 2 seconds)
    const prompt = await waitForPrompt(session.id)
    log('Prompt received!')

    return {
      content: [
        {
          type: 'text',
          text: prompt,
        },
      ],
    }
  } catch (error) {
    log('Error:', error)
    return {
      content: [
        {
          type: 'text',
          text: `Teton error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
})

// Start server
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  log('MCP server running on stdio')
}

main().catch((error) => {
  log('Fatal error:', error)
  process.exit(1)
})

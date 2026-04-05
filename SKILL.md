---
name: teton
preamble-tier: 2
version: 1.0.0
description: |
  Visual debugging for Claude Code. Opens a flowchart editor to visualize data flow and fix bugs.
  Use when asked to "debug with teton", "open teton", "visualize the bug", or "/teton".
  Proactively suggest when the user is stuck in a debugging loop.
allowed-tools:
  - mcp__teton__teton
  - Bash
  - Read
---

# Teton - Visual Debugging for Claude Code

When the user invokes `/teton` or asks to debug visually:

1. Use the `mcp__teton__teton` tool with:
   - `conversation_history`: Last 10-20 messages from this conversation
   - `current_error`: Any error message being debugged
   - `current_file`: The file currently being discussed
   - `working_directory`: The project root directory

2. This will:
   - Scan the codebase for context
   - Open a browser with a flowchart visualization
   - Wait for the user to edit and click "Send" (or "Cancel")
   - Return a structured prompt to fix the issue

## Requirements

The Teton web app must be running at http://localhost:3005 (or configured URL).

To start it:
```bash
cd ~/.claude/skills/teton/teton-app && npm run dev -- -p 3005
```

## Installation

```bash
git clone https://github.com/dominantduck/teton-debugging.git ~/.claude/skills/teton
cd ~/.claude/skills/teton/teton-app && npm install
cd ~/.claude/skills/teton/teton-mcp && npm install && npm run build
claude mcp add teton -- node ~/.claude/skills/teton/teton-mcp/dist/index.js
```

# teton-mcp

Visual debugging for [Claude Code](https://claude.ai/code). When Claude gets stuck, show it what you mean.

## What is Teton?

Teton transforms debugging from text-based back-and-forth into a visual, interactive process:

1. Claude generates a flowchart of what it thinks is happening
2. You edit the flowchart to show what *should* happen
3. Claude receives a structured prompt and fixes the code

## Setup

Add Teton to your Claude Code configuration in `~/.claude.json`:

```json
{
  "mcpServers": {
    "teton": {
      "command": "npx",
      "args": ["teton-mcp"]
    }
  }
}
```

Then restart Claude Code:

```bash
claude
```

No installation needed. npx downloads and runs it automatically.

## Usage

When debugging with Claude Code, just say:

```
debug with Teton
```

Teton will:
1. Scan your codebase
2. Open a visual flowchart editor in your browser
3. Let you edit the data flow to show the correct behavior
4. Send a structured fix back to Claude Code

## Requirements

- Node.js 18+
- Claude Code

## License

MIT

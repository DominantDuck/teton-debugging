# Teton

Visual debugging for Claude Code. Take conversations from 85% to 100%.

When you're stuck in a debugging loop with Claude Code, Teton helps you show Claude what *should* happen instead of trying to explain it in words.

## How it works

1. **Invoke Teton** — Type `/teton` in Claude Code (or paste context on the web)
2. **See the flowchart** — Claude generates a diagram of what it thinks is happening
3. **Edit the flow** — Fix the nodes to show what should actually happen
4. **Send it back** — Get a structured prompt that guides Claude to the fix

## Project structure

```
teton-debugging/
├── teton-app/          # Next.js web application
│   ├── app/            # App Router pages and API routes
│   ├── components/     # React Flow canvas components
│   ├── lib/            # Supabase + AI utilities
│   └── types/          # TypeScript definitions
└── teton-mcp/          # MCP package for Claude Code
    └── src/            # MCP server implementation
```

## Setup

### Prerequisites

- Node.js 20+
- A Supabase project
- An Anthropic API key

### 1. Create the Supabase table

Run this SQL in your Supabase SQL Editor:

```sql
create table sessions (
  id uuid primary key default gen_random_uuid(),
  source text default 'paste' check (source in ('paste', 'mcp')),
  raw_context text,
  conversation_summary text,
  current_error text,
  current_file text,
  relevant_files jsonb,
  data_models jsonb,
  project_structure text,
  original_nodes jsonb,
  original_edges jsonb,
  edited_nodes jsonb,
  edited_edges jsonb,
  generated_prompt text,
  prompt_ready boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index idx_sessions_prompt_ready on sessions(id) where prompt_ready = true;
```

### 2. Configure environment variables

Copy `.env.local.example` to `.env.local` in `teton-app/`:

```bash
cd teton-app
cp .env.local.example .env.local
```

Fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=https://teton-app-alpha.vercel.app
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run the development server

```bash
npm run dev
```

Open [https://teton-app-alpha.vercel.app](https://teton-app-alpha.vercel.app) to see the app.

## Using the MCP integration

### Install the MCP package globally

```bash
cd teton-mcp
npm run build
npm link
```

### Register with Claude Code

```bash
claude mcp add --transport stdio teton -- teton-mcp
```

Or add to your Claude Code settings manually:

```json
{
  "mcpServers": {
    "teton": {
      "command": "npx",
      "args": ["-y", "teton-mcp"],
      "env": {
        "TETON_API_URL": "https://tryteton.app"
      }
    }
  }
}
```

### Restart Claude Code

After adding the MCP server, restart Claude Code for it to take effect.

### Use it

When you're stuck debugging, just type:

```
/teton
```

Teton will:
1. Scan your codebase for context
2. Open a browser with your session
3. Wait for you to edit the flowchart and click Send
4. Return the structured prompt to Claude Code

## Deployment

### Deploy the web app to Vercel

```bash
cd teton-app
vercel
```

Set the environment variables in the Vercel dashboard.

### Publish the MCP package

```bash
cd teton-mcp
npm publish
```

## Tech stack

- **Web app**: Next.js 14, React Flow, Tailwind CSS, Supabase
- **AI**: Anthropic Claude (Sonnet 4.5)
- **MCP**: Model Context Protocol SDK

## License

MIT

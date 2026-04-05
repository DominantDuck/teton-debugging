# /teton

Open Teton visual debugger to fix the current bug.

## Instructions

Use the `mcp__teton__teton` tool to open the Teton debugger. Pass:
- `conversation_history`: The last 10-20 messages from this conversation
- `current_error`: Any error message the user is debugging
- `current_file`: The file currently being discussed
- `working_directory`: The project root directory

This will:
1. Scan the codebase for context
2. Open a browser with a flowchart visualization
3. Wait for the user to edit the flowchart and click Send
4. Return a structured prompt to fix the issue

If the user wants to cancel, they can press Escape or click Cancel in the browser.

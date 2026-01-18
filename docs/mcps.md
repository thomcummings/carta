## MCP Integration

### Available MCPs
<!-- List MCPs configured for this project -->
- `supabase` — Database queries
- `github` — Repository operations
- [more will be added here depending on project needs]

### When to Use MCPs

**Use MCPs for:**
- Fetching current documentation (instead of relying on training data)
- Querying live data from databases or APIs
- Performing actions in external services (GitHub, Slack, etc.)
- Accessing project-specific integrations

**Don't use MCPs when:**
- The information is already in context (uploaded files, CLAUDE.md)
- Static/stable information that won't have changed
- Simple operations that don't need external data

### MCP Patterns

**Documentation lookup:**
"Check Context7 for the latest [library] docs on [topic] before implementing"

**Database queries:**
"Query the database to understand the current schema before suggesting changes"

**Verify before assuming:**
When uncertain about current state of external systems, query via MCP rather than assuming.

### Debugging MCP Issues
- Use `--mcp-debug` flag to troubleshoot connections
- Check if MCP server is running
- Verify credentials/permissions

---

---
name: MCP
order: 6
icon: phosphorPlugDuotone
---

# Model Context Protocol (MCP)

The Angular Primitives MCP Server allows AI assistants to interact with our headless UI primitives. You can browse available components, search for specific ones, and get implementation help using natural language.

For example, you can ask an AI assistant to _"Show me all form primitives"_ or _"Add a dialog component to my Angular app"_ or _"Get the API details for the button primitive"_.

## Configuration

### Automatic Setup

```bash
npx ng g ng-primitives:mcp-setup
```

Select your AI tools and the schematic will create the necessary configuration files.

### Manual Setup

<tab-group>
  <tab-item label="Claude Code">
    Create `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "ngp-mcp": {
      "command": "npx",
      "args": ["-y", "@ng-primitives/mcp"]
    }
  }
}
```

  </tab-item>

  <tab-item label="Cursor">
    Create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "ngp-mcp": {
      "command": "npx",
      "args": ["-y", "@ng-primitives/mcp"]
    }
  }
}
```

  </tab-item>

  <tab-item label="VS Code">
    Create `.vscode/mcp.json` in your project root:

```json
{
  "servers": {
    "ngp-mcp": {
      "command": "npx",
      "args": ["-y", "@ng-primitives/mcp"]
    }
  }
}
```

  </tab-item>

  <tab-item label="Codex">
    Create `.codex/config.toml` in your project root:

```toml
[mcp_servers.ngp-mcp]
command = "npx"
args = ["-y", "@ng-primitives/mcp"]
```

  </tab-item>
</tab-group>

## Example Usage

- _"Show me all form primitives"_
- _"Add a dialog to my Angular app"_
- _"What are the button primitive's inputs?"_
- _"Generate install command for accordion and tabs"_
- _"Show me reusable component implementations"_

## Troubleshooting

**MCP not responding?**

- Restart your AI tool after configuration changes
- Verify your configuration file is valid JSON/TOML

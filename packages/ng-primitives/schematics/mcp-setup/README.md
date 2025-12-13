# MCP Setup Schematic

This schematic automatically configures the Angular Primitives MCP (Model Context Protocol) server for various AI tools and editors with **project-based configurations**.

## Usage

### With Angular CLI

```bash
ng generate ng-primitives:mcp-setup
```

Or using the alias:

```bash
ng generate ng-primitives:mcp
```

### With Nx

```bash
nx generate ng-primitives:mcp-setup
```

### Options

- `--tools` - Array of AI tools/editors to configure. Available options:
  - `claude-code` - Claude Code
  - `cursor` - Cursor
  - `vscode` - VS Code (GitHub Copilot)
  - `codex` - Codex

### Examples

#### Interactive Mode (Recommended)

```bash
ng generate ng-primitives:mcp-setup
```

This will prompt you to select which tools to configure using a multi-select menu.

#### Command Line

Configure specific tools:

```bash
ng generate ng-primitives:mcp-setup --tools=claude-code,cursor
```

Configure all tools:

```bash
ng generate ng-primitives:mcp-setup --tools=claude-code,cursor,vscode,codex
```

## What It Does

The schematic creates **project-local** configuration files for each selected tool:

- **Claude Code**: `.mcp.json` in project root
- **Cursor**: `.cursor/mcp.json` in project root
- **VS Code**: `.vscode/mcp.json` in project root
- **Codex**: `.codex/config.toml` in project root

### Configuration Format

#### Claude Code & Cursor

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

#### VS Code (GitHub Copilot)

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

#### Codex

```toml
[mcp_servers.ngp-mcp]
command = "npx"
args = ["-y", "@ng-primitives/mcp"]
```

## Available MCP Tools

Once configured, the following tools will be available in your AI editor:

- `list_primitives` - List all available Angular Primitives with filtering
- `get_primitive_details` - Get detailed information about a specific primitive
- `get_install_command` - Generate npm install commands
- `list_reusable_components` - List reusable component implementations
- `get_reusable_component` - Get full source code for a component
- `get_setup_guide` - Get setup instructions for Angular Primitives

## After Running

1. **Restart your AI tool/editor** for changes to take effect
2. **Enable the ngp-mcp server** in your tool's settings (if required)
3. The MCP server will automatically start when needed
4. You can verify the server is configured by checking for "ngp-mcp" in your tool's MCP settings

## Project-Based vs Global

This schematic creates **project-based configurations** (not global). This means:

- ✅ Configuration is version-controlled with your project
- ✅ Different projects can have different MCP setups
- ✅ Team members get the same MCP configuration
- ✅ No need to configure MCP globally on each machine

## Updating Existing Configurations

The schematic is smart about existing configurations:

- If a config file already exists, it will be updated (not replaced)
- Other MCP servers in the config are preserved
- Only the `ngp-mcp` server configuration is added/updated

## Troubleshooting

### Configuration Not Working

If the MCP server doesn't appear after restarting:

1. Check that the configuration file was created in your project root
2. Verify your AI tool supports project-based MCP configs
3. Try enabling the server manually in your tool's settings
4. Check that Node.js and npx are available in your PATH

### Server Not Starting

If the MCP server doesn't start:

1. Try running `npx -y @ng-primitives/mcp` manually to test
2. Check your tool's MCP logs for errors
3. Verify you have internet access to download the package
4. Ensure you're using a recent version of Node.js (v18+)

### VS Code Specific

For VS Code with GitHub Copilot:

1. Open `.vscode/mcp.json` in your project
2. Click the "Start" button next to the ngp-mcp server
3. Check the MCP output panel for any errors

## Example Prompts

Try these prompts once configured:

- "Show me all available Angular Primitives"
- "Add the button primitive to my project"
- "Get details about the dialog primitive"
- "Show me the reusable button component implementation"
- "How do I set up Angular Primitives?"

## Learn More

- [Angular Primitives Documentation](https://angularprimitives.com)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [GitHub Repository](https://github.com/ng-primitives/ng-primitives)
- [MCP Documentation](https://modelcontextprotocol.io/docs)

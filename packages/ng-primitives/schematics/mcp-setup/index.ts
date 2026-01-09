import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  addPackageJsonDependency,
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import { McpSetupSchema } from './schema';

// Read version from package.json at compile time

const { version: PACKAGE_VERSION } = require('../../package.json');

interface McpServerConfig {
  command: string;
  args: string[];
}

interface McpConfig {
  mcpServers?: Record<string, McpServerConfig>;
  servers?: Record<string, McpServerConfig>;
}

/**
 * Get the configuration file path for each tool (project-relative)
 */
function getConfigPath(tool: string): string {
  switch (tool) {
    case 'claude-code':
      return '.mcp.json';
    case 'cursor':
      return '.cursor/mcp.json';
    case 'vscode':
      return '.vscode/mcp.json';
    case 'codex':
      return '.codex/config.toml';
    default:
      throw new Error(`Unknown tool: ${tool}`);
  }
}

/**
 * Create MCP server configuration
 */
function createMcpServerConfig(): McpServerConfig {
  return {
    command: 'npx',
    args: ['-y', '@ng-primitives/mcp'],
  };
}

/**
 * Update or create MCP configuration for Codex (TOML format)
 */
function updateCodexConfig(tree: Tree, configPath: string, context: SchematicContext): void {
  let content = '';

  if (tree.exists(configPath)) {
    const existingContent = tree.read(configPath);
    if (existingContent) {
      content = existingContent.toString();
      context.logger.info(`Found existing configuration at ${configPath}`);
    }
  } else {
    context.logger.info(`Creating new configuration at ${configPath}`);
  }

  // Check if ngp-mcp already exists (more robust check)
  if (content.match(/\[mcp_servers\.ngp-mcp\]/)) {
    context.logger.info(`ngp-mcp already configured in ${configPath}`);
    return;
  }

  // Add ngp-mcp configuration
  const mcpConfig = `
[mcp_servers.ngp-mcp]
command = "npx"
args = ["-y", "@ng-primitives/mcp"]
`;

  content += mcpConfig;

  if (tree.exists(configPath)) {
    tree.overwrite(configPath, content);
  } else {
    tree.create(configPath, content);
  }

  context.logger.info(`✓ Configured ngp-mcp for Codex`);
}

/**
 * Update or create MCP configuration for JSON-based tools
 */
function updateJsonConfig(
  tree: Tree,
  tool: string,
  configPath: string,
  context: SchematicContext,
): void {
  let config: McpConfig = {};

  if (tree.exists(configPath)) {
    const content = tree.read(configPath);
    if (content) {
      try {
        config = JSON.parse(content.toString());
        context.logger.info(`Found existing configuration at ${configPath}`);
      } catch {
        context.logger.warn(`Failed to parse existing config at ${configPath}, creating new one`);
      }
    }
  } else {
    context.logger.info(`Creating new configuration at ${configPath}`);
  }

  const serverConfig = createMcpServerConfig();

  // Tool-specific configuration structure
  switch (tool) {
    case 'claude-code':
    case 'cursor':
      // These use mcpServers
      if (!config.mcpServers) {
        config.mcpServers = {};
      }
      if (config.mcpServers['ngp-mcp']) {
        context.logger.info(`ngp-mcp already configured in ${configPath}`);
        return;
      }
      config.mcpServers['ngp-mcp'] = serverConfig;
      break;

    case 'vscode':
      // VS Code uses servers
      if (!config.servers) {
        config.servers = {};
      }
      if (config.servers['ngp-mcp']) {
        context.logger.info(`ngp-mcp already configured in ${configPath}`);
        return;
      }
      config.servers['ngp-mcp'] = serverConfig;
      break;
  }

  // Write the updated configuration
  const configJson = JSON.stringify(config, null, 2);

  if (tree.exists(configPath)) {
    tree.overwrite(configPath, configJson);
  } else {
    tree.create(configPath, configJson);
  }

  context.logger.info(`✓ Configured ngp-mcp for ${tool}`);
}

/**
 * Update or create MCP configuration for a tool
 */
function updateToolConfig(tree: Tree, tool: string, context: SchematicContext): void {
  const configPath = getConfigPath(tool);

  if (tool === 'codex') {
    updateCodexConfig(tree, configPath, context);
  } else {
    updateJsonConfig(tree, tool, configPath, context);
  }
}

export default function mcpSetup(options: McpSetupSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (!options.tools || options.tools.length === 0) {
      context.logger.info('MCP setup skipped.');
      return tree;
    }

    // Filter out 'none' and configure each selected tool
    const toolsToConfig = options.tools.filter(tool => tool !== 'none');

    if (toolsToConfig.length === 0) {
      context.logger.info('MCP setup skipped.');
      return tree;
    }

    context.logger.info('Setting up Angular Primitives MCP server...');

    // Add @ng-primitives/mcp as a dependency
    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: '@ng-primitives/mcp',
      version: `^${PACKAGE_VERSION}`,
      overwrite: false,
    });
    context.logger.info('✓ Added @ng-primitives/mcp to dependencies');

    // Schedule package installation
    context.addTask(new NodePackageInstallTask());

    for (const tool of toolsToConfig) {
      try {
        updateToolConfig(tree, tool, context);
      } catch (error) {
        context.logger.error(`Failed to configure ${tool}: ${error}`);
      }
    }

    context.logger.info('');
    context.logger.info('✓ MCP server setup complete!');
    context.logger.info('');
    context.logger.info('Next steps:');
    context.logger.info('1. Restart your AI tool/editor');
    context.logger.info('2. Enable the ngp-mcp server in your tool settings');
    context.logger.info('3. The server will be available with the following tools:');
    context.logger.info('   • list_primitives - List all available primitives');
    context.logger.info('   • get_primitive_details - Get detailed information about a primitive');
    context.logger.info('   • get_install_command - Generate install commands');
    context.logger.info('   • list_reusable_components - List reusable component implementations');
    context.logger.info('   • get_reusable_component - Get component source code');
    context.logger.info('   • get_setup_guide - Get setup instructions');
    context.logger.info('');
    context.logger.info('Learn more: https://angularprimitives.com');

    return tree;
  };
}

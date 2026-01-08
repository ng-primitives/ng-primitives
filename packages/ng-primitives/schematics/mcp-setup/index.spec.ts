import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { join } from 'path';

const collectionPath = join(__dirname, '../../collection.json');

 
const { version: PACKAGE_VERSION } = require('../../package.json');

describe('mcp-setup schematic', () => {
  let runner: SchematicTestRunner;
  let appTree: UnitTestTree;

  beforeEach(async () => {
    runner = new SchematicTestRunner('schematics', collectionPath);
    appTree = await runner.runExternalSchematic('@schematics/angular', 'workspace', {
      name: 'workspace',
      version: '19.0.0',
      newProjectRoot: 'projects',
    });
  });

  it('should create Claude Code config when selected', async () => {
    const tree = await runner.runSchematic(
      'mcp-setup',
      {
        tools: ['claude-code'],
      },
      appTree,
    );

    expect(tree.files).toContain('/.mcp.json');

    const content = tree.readContent('/.mcp.json');
    const config = JSON.parse(content);

    expect(config.mcpServers).toBeDefined();
    expect(config.mcpServers['ngp-mcp']).toBeDefined();
    expect(config.mcpServers['ngp-mcp'].command).toBe('npx');
    expect(config.mcpServers['ngp-mcp'].args).toEqual(['-y', '@ng-primitives/mcp']);
  });

  it('should create Cursor config when selected', async () => {
    const tree = await runner.runSchematic(
      'mcp-setup',
      {
        tools: ['cursor'],
      },
      appTree,
    );

    expect(tree.files).toContain('/.cursor/mcp.json');

    const content = tree.readContent('/.cursor/mcp.json');
    const config = JSON.parse(content);

    expect(config.mcpServers).toBeDefined();
    expect(config.mcpServers['ngp-mcp']).toBeDefined();
  });

  it('should create VS Code config when selected', async () => {
    const tree = await runner.runSchematic(
      'mcp-setup',
      {
        tools: ['vscode'],
      },
      appTree,
    );

    expect(tree.files).toContain('/.vscode/mcp.json');

    const content = tree.readContent('/.vscode/mcp.json');
    const config = JSON.parse(content);

    expect(config.servers).toBeDefined();
    expect(config.servers['ngp-mcp']).toBeDefined();
  });

  it('should create Codex config when selected', async () => {
    const tree = await runner.runSchematic(
      'mcp-setup',
      {
        tools: ['codex'],
      },
      appTree,
    );

    expect(tree.files).toContain('/.codex/config.toml');

    const content = tree.readContent('/.codex/config.toml');

    expect(content).toContain('[mcp_servers.ngp-mcp]');
    expect(content).toContain('command = "npx"');
    expect(content).toContain('args = ["-y", "@ng-primitives/mcp"]');
  });

  it('should configure multiple tools when selected', async () => {
    const tree = await runner.runSchematic(
      'mcp-setup',
      {
        tools: ['claude-code', 'cursor', 'vscode'],
      },
      appTree,
    );

    expect(tree.files).toContain('/.mcp.json');
    expect(tree.files).toContain('/.cursor/mcp.json');
    expect(tree.files).toContain('/.vscode/mcp.json');
  });

  it('should update existing config without overwriting other servers', async () => {
    const existingConfig = {
      mcpServers: {
        'other-server': {
          command: 'node',
          args: ['other-server.js'],
        },
      },
    };

    appTree.create('/.mcp.json', JSON.stringify(existingConfig, null, 2));

    const tree = await runner.runSchematic(
      'mcp-setup',
      {
        tools: ['claude-code'],
      },
      appTree,
    );

    const content = tree.readContent('/.mcp.json');
    const config = JSON.parse(content);

    // Should have both servers
    expect(config.mcpServers['other-server']).toBeDefined();
    expect(config.mcpServers['ngp-mcp']).toBeDefined();
    expect(config.mcpServers['other-server'].command).toBe('node');
    expect(config.mcpServers['ngp-mcp'].command).toBe('npx');
  });

  it('should handle no tools selected gracefully', async () => {
    const tree = await runner.runSchematic(
      'mcp-setup',
      {
        tools: [],
      },
      appTree,
    );

    // Should not create any config files
    expect(tree.files.filter(f => f.includes('.mcp.json'))).toHaveLength(0);
    expect(tree.files.filter(f => f.includes('.cursor'))).toHaveLength(0);
  });

  it('should preserve existing VS Code servers configuration', async () => {
    const existingConfig = {
      servers: {
        'existing-server': {
          command: 'node',
          args: ['server.js'],
        },
      },
    };

    appTree.create('/.vscode/mcp.json', JSON.stringify(existingConfig, null, 2));

    const tree = await runner.runSchematic(
      'mcp-setup',
      {
        tools: ['vscode'],
      },
      appTree,
    );

    const content = tree.readContent('/.vscode/mcp.json');
    const config = JSON.parse(content);

    expect(config.servers['existing-server']).toBeDefined();
    expect(config.servers['ngp-mcp']).toBeDefined();
  });

  it('should append to existing Codex TOML config', async () => {
    const existingToml = `[mcp_servers.other]
command = "node"
args = ["other.js"]
`;

    appTree.create('/.codex/config.toml', existingToml);

    const tree = await runner.runSchematic(
      'mcp-setup',
      {
        tools: ['codex'],
      },
      appTree,
    );

    const content = tree.readContent('/.codex/config.toml');

    expect(content).toContain('[mcp_servers.other]');
    expect(content).toContain('[mcp_servers.ngp-mcp]');
  });

  it('should skip setup when "none" is selected', async () => {
    const tree = await runner.runSchematic(
      'mcp-setup',
      {
        tools: ['none'],
      },
      appTree,
    );

    // Should not create any config files
    expect(tree.files).not.toContain('/.mcp.json');
    expect(tree.files).not.toContain('/.cursor/mcp.json');
    expect(tree.files).not.toContain('/.vscode/mcp.json');
    expect(tree.files).not.toContain('/.codex/config.toml');
  });

  it('should skip setup when empty array is provided', async () => {
    const tree = await runner.runSchematic(
      'mcp-setup',
      {
        tools: [],
      },
      appTree,
    );

    // Should not create any config files
    expect(tree.files).not.toContain('/.mcp.json');
    expect(tree.files).not.toContain('/.cursor/mcp.json');
    expect(tree.files).not.toContain('/.vscode/mcp.json');
    expect(tree.files).not.toContain('/.codex/config.toml');
  });

  it('should filter out "none" and setup other tools', async () => {
    const tree = await runner.runSchematic(
      'mcp-setup',
      {
        tools: ['none', 'claude-code', 'cursor'],
      },
      appTree,
    );

    // Should create config files for selected tools (excluding none)
    expect(tree.files).toContain('/.mcp.json');
    expect(tree.files).toContain('/.cursor/mcp.json');

    // Should not create configs for unselected tools
    expect(tree.files).not.toContain('/.vscode/mcp.json');
    expect(tree.files).not.toContain('/.codex/config.toml');
  });

  it('should add @ng-primitives/mcp dependency to package.json', async () => {
    const tree = await runner.runSchematic(
      'mcp-setup',
      {
        tools: ['claude-code'],
      },
      appTree,
    );

    const packageJson = JSON.parse(tree.readContent('/package.json'));
    expect(packageJson.dependencies['@ng-primitives/mcp']).toBe(`^${PACKAGE_VERSION}`);
  });

  it('should not add dependency when no tools are selected', async () => {
    const tree = await runner.runSchematic(
      'mcp-setup',
      {
        tools: ['none'],
      },
      appTree,
    );

    const packageJson = JSON.parse(tree.readContent('/package.json'));
    expect(packageJson.dependencies?.['@ng-primitives/mcp']).toBeUndefined();
  });

  it('should not overwrite existing @ng-primitives/mcp dependency', async () => {
    // Add existing dependency
    const packageJson = JSON.parse(appTree.readContent('/package.json'));
    packageJson.dependencies = packageJson.dependencies || {};
    packageJson.dependencies['@ng-primitives/mcp'] = '^0.90.0';
    appTree.overwrite('/package.json', JSON.stringify(packageJson, null, 2));

    const tree = await runner.runSchematic(
      'mcp-setup',
      {
        tools: ['claude-code'],
      },
      appTree,
    );

    const updatedPackageJson = JSON.parse(tree.readContent('/package.json'));
    // Should keep the existing version
    expect(updatedPackageJson.dependencies['@ng-primitives/mcp']).toBe('^0.90.0');
  });

  it('should preserve other dependencies when adding @ng-primitives/mcp', async () => {
    // Add some existing dependencies
    const packageJson = JSON.parse(appTree.readContent('/package.json'));
    packageJson.dependencies = {
      '@angular/core': '^19.0.0',
      rxjs: '^7.0.0',
    };
    appTree.overwrite('/package.json', JSON.stringify(packageJson, null, 2));

    const tree = await runner.runSchematic(
      'mcp-setup',
      {
        tools: ['vscode'],
      },
      appTree,
    );

    const updatedPackageJson = JSON.parse(tree.readContent('/package.json'));
    expect(updatedPackageJson.dependencies['@angular/core']).toBe('^19.0.0');
    expect(updatedPackageJson.dependencies['rxjs']).toBe('^7.0.0');
    expect(updatedPackageJson.dependencies['@ng-primitives/mcp']).toBe(`^${PACKAGE_VERSION}`);
  });
});

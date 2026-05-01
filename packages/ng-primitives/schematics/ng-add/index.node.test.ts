import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Ng Add Schematic', () => {
  const workspaceRoot = resolve(fileURLToPath(new URL('../../../../', import.meta.url)));
  const schematicRunner = new SchematicTestRunner(
    'ng-primitives',
    resolve(workspaceRoot, 'dist/packages/ng-primitives/collection.json'),
  );

  const workspaceOptions: WorkspaceOptions = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '6.0.0',
  };

  const appOptions: ApplicationOptions = {
    name: 'bar',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    skipTests: false,
    skipPackageJson: false,
  };

  let appTree: UnitTestTree;

  beforeEach(async () => {
    appTree = await schematicRunner.runExternalSchematic(
      '@schematics/angular',
      'workspace',
      workspaceOptions,
    );
    appTree = await schematicRunner.runExternalSchematic(
      '@schematics/angular',
      'application',
      appOptions,
      appTree,
    );
  });

  it('should add dependencies to package.json', async () => {
    const tree = await schematicRunner.runSchematic('ng-add', {}, appTree);
    const packageJson = JSON.parse(tree.readContent('/package.json'));

    expect(packageJson.dependencies['@angular/cdk']).toBeDefined();
    expect(packageJson.dependencies['@floating-ui/dom']).toBeDefined();
  });

  it('should not set up MCP when no tools are specified', async () => {
    const tree = await schematicRunner.runSchematic('ng-add', { mcpTools: [] }, appTree);

    expect(tree.exists('/.mcp.json')).toBe(false);
    expect(tree.exists('/.cursor/mcp.json')).toBe(false);
    expect(tree.exists('/.vscode/mcp.json')).toBe(false);
    expect(tree.exists('/.codex/config.toml')).toBe(false);
  });

  it('should not set up MCP when "none" is selected', async () => {
    const tree = await schematicRunner.runSchematic('ng-add', { mcpTools: ['none'] }, appTree);

    expect(tree.exists('/.mcp.json')).toBe(false);
    expect(tree.exists('/.cursor/mcp.json')).toBe(false);
    expect(tree.exists('/.vscode/mcp.json')).toBe(false);
    expect(tree.exists('/.codex/config.toml')).toBe(false);
  });

  it('should set up MCP when tools are specified', async () => {
    const tree = await schematicRunner.runSchematic(
      'ng-add',
      {
        mcpTools: ['claude-code', 'cursor'],
      },
      appTree,
    );

    expect(tree.exists('/.mcp.json')).toBe(true);
    expect(tree.exists('/.cursor/mcp.json')).toBe(true);
    expect(tree.exists('/.vscode/mcp.json')).toBe(false);
    expect(tree.exists('/.codex/config.toml')).toBe(false);

    const claudeConfig = JSON.parse(tree.readContent('/.mcp.json'));
    expect(claudeConfig.mcpServers['ngp-mcp']).toBeDefined();
    expect(claudeConfig.mcpServers['ngp-mcp'].command).toBe('npx');
    expect(claudeConfig.mcpServers['ngp-mcp'].args).toEqual(['-y', '@ng-primitives/mcp']);

    const cursorConfig = JSON.parse(tree.readContent('/.cursor/mcp.json'));
    expect(cursorConfig.mcpServers['ngp-mcp']).toBeDefined();
  });

  it('should filter out "none" and setup other tools', async () => {
    const tree = await schematicRunner.runSchematic(
      'ng-add',
      {
        mcpTools: ['none', 'claude-code'],
      },
      appTree,
    );

    expect(tree.exists('/.mcp.json')).toBe(true);
    expect(tree.exists('/.cursor/mcp.json')).toBe(false);
    expect(tree.exists('/.vscode/mcp.json')).toBe(false);
    expect(tree.exists('/.codex/config.toml')).toBe(false);
  });

  it('should skip MCP setup when mcpTools is undefined', async () => {
    const tree = await schematicRunner.runSchematic('ng-add', {}, appTree);

    expect(tree.exists('/.mcp.json')).toBe(false);
    expect(tree.exists('/.cursor/mcp.json')).toBe(false);
  });
});

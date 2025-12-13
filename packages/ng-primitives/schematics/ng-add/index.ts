import { chain, Rule, schematic, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { VERSION } from '@angular/core';
import {
  addPackageJsonDependency,
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import { Schema } from './schema';

export default function ngAdd(options: Schema): Rule {
  return (tree: Tree, context) => {
    const rules: Rule[] = [];

    // Add dependencies
    const addDependencies: Rule = (tree: Tree) => {
      addPackageJsonDependency(tree, {
        type: NodeDependencyType.Default,
        name: '@angular/cdk',
        version: `^${VERSION.major}.0.0`,
        overwrite: false,
      });

      addPackageJsonDependency(tree, {
        type: NodeDependencyType.Default,
        name: '@floating-ui/dom',
        version: '^1.6.0',
        overwrite: false,
      });

      context.addTask(new NodePackageInstallTask());
      return tree;
    };

    rules.push(addDependencies);

    // Add MCP setup if tools are selected (excluding 'none')
    if (options.mcpTools && options.mcpTools.length > 0) {
      const toolsToSetup = options.mcpTools.filter(tool => tool !== 'none');
      if (toolsToSetup.length > 0) {
        rules.push(
          schematic('mcp-setup', {
            tools: toolsToSetup,
          }),
        );
      }
    }

    return chain(rules);
  };
}

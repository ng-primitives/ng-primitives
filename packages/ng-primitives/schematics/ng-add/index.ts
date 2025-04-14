import { Rule, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  addPackageJsonDependency,
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';

export default function ngAdd(): Rule {
  return (tree: Tree, context) => {
    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: '@angular/cdk',
      version: '^19.0.0',
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
}

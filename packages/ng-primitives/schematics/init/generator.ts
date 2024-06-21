import { Tree, addDependenciesToPackageJson, installPackagesTask } from '@nx/devkit';

export async function initGenerator(tree: Tree) {
  addDependenciesToPackageJson(
    tree,
    {
      '@angular/cdk': '^18.0.0',
      '@floating-ui/dom': '^1.6.0',
    },
    {},
  );

  return () => installPackagesTask(tree);
}

export default initGenerator;

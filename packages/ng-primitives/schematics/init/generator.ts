/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Tree, addDependenciesToPackageJson, installPackagesTask } from '@nx/devkit';

/**
 *
 * @param tree
 */
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

/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Tree, readJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { initGenerator } from './generator';

describe('init generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should add the dependencies to package.json', async () => {
    await initGenerator(tree);
    // it should add dependencies to package.json
    const packageJson = readJson(tree, 'package.json');
    expect(packageJson.dependencies['@angular/cdk']).toBe('^18.0.0');
    expect(packageJson.dependencies['@floating-ui/dom']).toBe('^1.6.0');
  });
});

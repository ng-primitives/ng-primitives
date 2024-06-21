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

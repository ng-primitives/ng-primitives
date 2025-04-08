import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import * as path from 'path';

describe('Ng Add Schematic', () => {
  const schematicRunner = new SchematicTestRunner(
    'ng-primitives',
    path.join(__dirname, '../../collection.json'),
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
});

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import { AngularPrimitivesComponentSchema } from './schema';

describe('Component Schematic', () => {
  const schematicRunner = new SchematicTestRunner(
    'ng-primitives',
    require.resolve('../../collection.json'),
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

  it('should create a primitive with the correct file suffix', async () => {
    const options: AngularPrimitivesComponentSchema = {
      primitive: 'button',
      path: 'projects/bar/src/app/button',
      fileSuffix: 'ng',
    };

    const tree = await schematicRunner.runSchematic('primitive', options, appTree);
    expect(tree.files).toContain('/projects/bar/src/app/button/button.ng.ts');
  });

  it('should allow a primitive to be created with no file suffix', async () => {
    const options: AngularPrimitivesComponentSchema = {
      primitive: 'button',
      path: 'projects/bar/src/app/button',
      fileSuffix: '',
    };

    const tree = await schematicRunner.runSchematic('primitive', options, appTree);
    expect(tree.files).toContain('/projects/bar/src/app/button/button.ts');
  });

  it('should create a primitive with the correct prefix', async () => {
    const options: AngularPrimitivesComponentSchema = {
      primitive: 'button',
      path: 'projects/bar/src/app/button',
      prefix: 'foo',
    };

    const tree = await schematicRunner.runSchematic('primitive', options, appTree);
    expect(tree.files).toContain('/projects/bar/src/app/button/button.component.ts');
    const content = tree.readContent('/projects/bar/src/app/button/button.component.ts');
    expect(content).toContain("selector: 'button[foo-button]'");
  });

  it('should create a primitive with the correct component suffix', async () => {
    const options: AngularPrimitivesComponentSchema = {
      primitive: 'button',
      path: 'projects/bar/src/app/button',
      componentSuffix: '',
    };

    const tree = await schematicRunner.runSchematic('primitive', options, appTree);
    expect(tree.files).toContain('/projects/bar/src/app/button/button.component.ts');
    const content = tree.readContent('/projects/bar/src/app/button/button.component.ts');
    expect(content).toContain('export class Button {');
  });

  it('should create a button primitive', async () => {
    const options: AngularPrimitivesComponentSchema = {
      primitive: 'button',
      path: 'projects/bar/src/app/button',
    };

    const tree = await schematicRunner.runSchematic('primitive', options, appTree);
    expect(tree.files).toContain('/projects/bar/src/app/button/button.component.ts');
    const content = tree.readContent('/projects/bar/src/app/button/button.component.ts');
    expect(content).toMatchSnapshot();
  });

  it('should create an input primitive', async () => {
    const options: AngularPrimitivesComponentSchema = {
      primitive: 'input',
      path: 'projects/bar/src/app/input',
    };

    const tree = await schematicRunner.runSchematic('primitive', options, appTree);
    expect(tree.files).toContain('/projects/bar/src/app/input/input.component.ts');
    const content = tree.readContent('/projects/bar/src/app/input/input.component.ts');
    expect(content).toMatchSnapshot();
  });

  it('should create an accordion primitive', async () => {
    const options: AngularPrimitivesComponentSchema = {
      primitive: 'accordion',
      path: 'projects/bar/src/app/accordion',
    };

    const tree = await schematicRunner.runSchematic('primitive', options, appTree);
    expect(tree.files).toContain('/projects/bar/src/app/accordion/accordion.component.ts');
    const content = tree.readContent('/projects/bar/src/app/accordion/accordion.component.ts');
    expect(content).toMatchSnapshot();
  });

  it('should use OnPush change detection by default', async () => {
    const options: AngularPrimitivesComponentSchema = {
      primitive: 'button',
      path: 'projects/bar/src/app/button',
    };

    const tree = await schematicRunner.runSchematic('primitive', options, appTree);
    const content = tree.readContent('/projects/bar/src/app/button/button.component.ts');
    expect(content).toContain('ChangeDetectionStrategy');
    expect(content).toContain('changeDetection: ChangeDetectionStrategy.OnPush');
  });

  it('should not use OnPush change detection when set to Default', async () => {
    const options: AngularPrimitivesComponentSchema = {
      primitive: 'button',
      path: 'projects/bar/src/app/button',
      changeDetection: 'Default',
    };

    const tree = await schematicRunner.runSchematic('primitive', options, appTree);
    const content = tree.readContent('/projects/bar/src/app/button/button.component.ts');
    expect(content).not.toContain('ChangeDetectionStrategy');
    expect(content).not.toContain('changeDetection');
  });

  it('should respect changeDetection Default from @schematics/angular:component in angular.json', async () => {
    const angularJson = JSON.parse(appTree.readContent('/angular.json'));
    angularJson.schematics = {
      '@schematics/angular:component': {
        changeDetection: 'Default',
      },
    };
    appTree.overwrite('/angular.json', JSON.stringify(angularJson));

    const options: AngularPrimitivesComponentSchema = {
      primitive: 'button',
      path: 'projects/bar/src/app/button',
    };

    const tree = await schematicRunner.runSchematic('primitive', options, appTree);
    const content = tree.readContent('/projects/bar/src/app/button/button.component.ts');
    expect(content).not.toContain('ChangeDetectionStrategy');
    expect(content).not.toContain('changeDetection');
  });
});

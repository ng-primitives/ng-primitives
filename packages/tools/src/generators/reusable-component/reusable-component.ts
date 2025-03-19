import { addRoute } from '@nx/angular/src/utils';
import { formatFiles, generateFiles, names, Tree, updateJson } from '@nx/devkit';
import { query } from '@phenomnomnominal/tsquery';
import * as path from 'path';
import * as ts from 'typescript';
import { ReusableComponentGeneratorSchema } from './schema';

export async function reusableComponentGenerator(
  tree: Tree,
  options: ReusableComponentGeneratorSchema,
) {
  const formattedNames = names(options.name);
  generateFiles(tree, path.join(__dirname, 'files'), 'apps/components/src/app', {
    options,
    ...formattedNames,
  });

  // update the app component to add a link
  const appComponentPath = 'apps/components/src/app/app.ts';

  let content = tree.read(appComponentPath, 'utf-8');

  if (!content) {
    throw new Error(`Could not read file ${appComponentPath}`);
  }

  // convert the name into space separated words
  const words = formattedNames.fileName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // insert the link (<a routerLink="/input">Input</a>) before the closing nav tag
  content = content.replace(
    /<\/nav>/,
    `  <a routerLink="/${formattedNames.fileName}">${words}</a>\n</nav>`,
  );

  tree.write(appComponentPath, content);

  // add route to the app.routes.ts
  addRoute(
    tree,
    'apps/components/src/app/app.routes.ts',
    `{ path: '${formattedNames.fileName}', loadComponent: () => import('./${formattedNames.fileName}/app') }`,
    true,
    'appRoutes',
    `'./${formattedNames.fileName}/app'`,
  );

  // add the primitive to the schema enum
  const schemaPath = 'packages/ng-primitives/schematics/ng-generate/schema.d.ts';

  content = tree.read(schemaPath, 'utf-8');

  if (!content) {
    throw new Error(`Could not read file ${schemaPath}`);
  }

  const property = query<ts.PropertySignature>(
    content,
    'PropertySignature:has([name="primitive"])',
  );

  if (!property) {
    throw new Error(`Could not find the property in ${schemaPath}`);
  }

  const existingPrimitives = property[0].type;

  if (!ts.isUnionTypeNode(existingPrimitives)) {
    throw new Error(`Expected the primitive property to be a union type`);
  }

  const existingPrimitiveNames = existingPrimitives.types.map(type => {
    if (ts.isLiteralTypeNode(type) && ts.isStringLiteral(type.literal)) {
      return type.literal.text;
    }
    throw new Error(`Expected the primitive type to be a string literal`);
  });

  // construct the updated property
  const updatedProperty = ts.factory.createPropertySignature(
    property[0].modifiers,
    property[0].name,
    property[0].questionToken,
    ts.factory.createUnionTypeNode([
      ...existingPrimitiveNames.map(name =>
        ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(name)),
      ),
      ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(formattedNames.fileName)),
    ]),
  );

  const printer = ts.createPrinter();
  const node = printer.printNode(
    ts.EmitHint.Unspecified,
    updatedProperty,
    ts.createSourceFile('', '', ts.ScriptTarget.Latest),
  );

  // replace the existing property with the updated one based on the indexes of the original property
  content = content.slice(0, property[0].getStart()) + node + content.slice(property[0].getEnd());
  tree.write(schemaPath, content);

  // also update the schema.json file
  const schemaJsonPath = 'packages/ng-primitives/schematics/ng-generate/schema.json';

  updateJson(tree, schemaJsonPath, json => {
    json.properties.primitive.enum.push(formattedNames.fileName);
    // sort the enum values
    json.properties.primitive.enum.sort();
    return json;
  });

  await formatFiles(tree);
}

export default reusableComponentGenerator;

import { addRoute } from '@nx/angular/src/utils';
import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';
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

  // insert the link (<a routerLink="/input">Input</a>) before the closing nav tag
  content = content.replace(
    /<\/nav>/,
    `  <a routerLink="/${formattedNames.fileName}">${formattedNames.fileName}</a>\n</nav>`,
  );

  // add route to the app.routes.ts
  addRoute(
    tree,
    'apps/components/src/app/app.routes.ts',
    formattedNames.fileName,
    true,
    'appRoutes',
    `'./${formattedNames.fileName}/app'`,
  );

  await formatFiles(tree);
}

export default reusableComponentGenerator;

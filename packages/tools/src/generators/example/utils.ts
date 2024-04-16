import { Tree } from '@nx/devkit';
import { tsquery } from '@phenomnomnominal/tsquery';

/**
 * Add a new route to a routes definition
 * @param tree Virtual Tree
 * @param routesFile File containing the routes definition
 * @param route Route to add
 */
export function addRoute(tree: Tree, routesFile: string, route: string) {
  if (!tree.exists(routesFile)) {
    throw new Error(
      `Path to parent routing declaration (${routesFile}) does not exist. Please ensure path is correct.`,
    );
  }
  const routesFileContents = tree.read(routesFile, 'utf-8');

  const ast = tsquery.ast(routesFileContents);

  const ROUTES_ARRAY_SELECTOR =
    'VariableDeclaration:has(ArrayType > TypeReference > Identifier[name=Route], Identifier[name=Routes]) > ArrayLiteralExpression';

  const routesArrayNodes = tsquery(ast, ROUTES_ARRAY_SELECTOR);

  const newRoutesFileContents = `${routesFileContents.slice(0, routesArrayNodes[0].getStart() + 1)}
    ${route},${routesFileContents.slice(routesArrayNodes[0].getStart() + 1)}`;

  tree.write(routesFile, newRoutesFileContents);
}

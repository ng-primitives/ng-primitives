import { Tree, getWorkspaceLayout } from '@nx/devkit';

export function getPrimitivePath(tree: Tree, primitive: string): string {
  const { libsDir } = getWorkspaceLayout(tree);
  return `${libsDir}/ng-primitives/${primitive}`;
}

export function getPrimitiveSourceRoot(tree: Tree, primitive: string): string {
  return `${getPrimitivePath(tree, primitive)}/src`;
}

export function getPrimitiveIndex(tree: Tree, primitive: string): string {
  return `${getPrimitiveSourceRoot(tree, primitive)}/index.ts`;
}

export function addExportToIndex(tree: Tree, primitive: string, exportStatement: string) {
  const indexPath = getPrimitiveIndex(tree, primitive);
  const indexBuffer = tree.read(indexPath);
  const indexContent = indexBuffer ? indexBuffer.toString('utf-8') : '';

  // Extract the import path from the export statement to check for duplicates
  const importPathMatch = exportStatement.match(/from '([^']+)'/);
  if (importPathMatch) {
    const importPath = importPathMatch[1];
    // Check if there's already an export from the same path
    if (indexContent.includes(`from '${importPath}'`)) {
      return;
    }
  } else if (indexContent.includes(exportStatement)) {
    return;
  }

  const newContent = `${indexContent.trim()}\n${exportStatement}`;
  tree.write(indexPath, newContent);
}

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

  const newContent = `${indexContent.trim()}\n${exportStatement}`;
  tree.write(indexPath, newContent);
}

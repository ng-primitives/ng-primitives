import { PromiseExecutor } from '@nx/devkit';
import { query } from '@phenomnomnominal/tsquery';
import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import * as ts from 'typescript';
import { TypingsExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<TypingsExecutorSchema> = async () => {
  // traverse all the files in the dist/packages/ng-primitives directory
  // and find all the .d.ts files
  const files = globSync('dist/packages/ng-primitives/**/*.d.ts', {
    absolute: true,
    nodir: true,
    ignore: ['**/node_modules/**'],
  });

  // iterate each of the files and we want to query for dynamic imports and get the path
  for (const file of files) {
    let content = readFileSync(file, 'utf-8');
    const importPaths = query<ts.StringLiteral>(
      content,
      'ImportType > LiteralType > StringLiteral',
    );

    // store the string literal of the import type that we need to replace
    const importPathsToReplace: ts.StringLiteral[] = [];

    for (const importType of importPaths) {
      // get the path of the import
      const path = importType.text;

      // check if the path is importing from 'dist/packages/'
      if (path.startsWith('dist/packages/')) {
        importPathsToReplace.push(importType);
      }
    }

    // iterate through the importTypeStrings in reverse order and replace them with the new path
    for (const pathLiteral of importPathsToReplace.reverse()) {
      // replace based on the exact position of the importTypeString
      const start = pathLiteral.getStart();
      const end = pathLiteral.getEnd();

      // get the text between the start and end of the importTypeString
      let text = content.substring(start, end);
      // replace the text with the new path
      text = text.replace('dist/packages/', '');

      // replace the text with the new path
      content = content.slice(0, start) + text + content.slice(end);
    }

    if (importPathsToReplace.length > 0) {
      // write the content back to the file
      writeFileSync(file, content);
    }
  }

  return {
    success: true,
  };
};

export default runExecutor;

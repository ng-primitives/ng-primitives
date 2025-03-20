import { strings } from '@angular-devkit/core';
import {
  FileEntry,
  Rule,
  apply,
  forEach,
  mergeWith,
  move,
  template,
  url,
} from '@angular-devkit/schematics';
import { query } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';
import { AngularPrimitivesComponentSchema } from './schema';

export default function generatePrimitive(options: AngularPrimitivesComponentSchema): Rule {
  return () => {
    const templateSource = apply(url(`./templates/${options.primitive}`), [
      template({
        ...options,
        ...strings,
        prefix: options.prefix ?? 'app',
        fileSuffix: options.fileSuffix ?? 'component',
      }),
      forEach((fileEntry: FileEntry) => {
        if (fileEntry.path.endsWith('.template')) {
          let newPath = fileEntry.path.replace('.template', '');

          // if the file has two consecutive periods, replace them with a single period - this can happen if the fileSuffix is empty
          if (newPath.includes('..')) {
            newPath = newPath.replace('..', '.');
          }

          return {
            path: newPath,
            content: processStyles(fileEntry.content, options),
          } as FileEntry;
        }
        return fileEntry;
      }),
      move(options.path),
    ]);

    return mergeWith(templateSource);
  };
}
function processStyles(content: Buffer, options: AngularPrimitivesComponentSchema): Buffer {
  if (options.exampleStyles) {
    return content;
  }

  const contentStr = content.toString();

  const styles = query<ts.NoSubstitutionTemplateLiteral>(
    contentStr,
    'ClassDeclaration > Decorator > CallExpression:has(Identifier[name="Component"]) ObjectLiteralExpression PropertyAssignment:has(Identifier[name="styles"]) NoSubstitutionTemplateLiteral',
  );

  if (styles.length === 0) {
    return content;
  }

  const stylesNode = styles[0];
  const stylesText = stylesNode.getText();
  const stylesValue = stylesText.slice(1, stylesText.length - 1);

  // we want to preserve all the selectors, we just want to remove all the rules inside the selectors
  const stylesWithoutRules = stylesValue.replace(/(?<=\{)[^}]+(?=\})/g, '');

  // replace the styles value with the new value
  const contentStrWithoutRules = contentStr.replace(stylesValue, stylesWithoutRules);

  // convert back to a buffer
  return Buffer.from(contentStrWithoutRules);
}

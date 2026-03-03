import { strings } from '@angular-devkit/core';
import {
  FileEntry,
  Rule,
  Tree,
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
  return (tree: Tree) => {
    // Resolve changeDetection: explicit param wins, then workspace config, then schema default (OnPush)
    if (!options.changeDetection) {
      options.changeDetection = getWorkspaceChangeDetection(tree) ?? 'OnPush';
    }

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
            content: processChangeDetection(processStyles(fileEntry.content, options), options),
          } as FileEntry;
        }
        return fileEntry;
      }),
      move(options.path),
    ]);

    return mergeWith(templateSource);
  };
}

/**
 * Read the changeDetection setting from the workspace configuration.
 * Checks @schematics/angular:component defaults in angular.json and nx.json.
 */
function getWorkspaceChangeDetection(tree: Tree): 'Default' | 'OnPush' | undefined {
  // Try angular.json
  const angularJson = tree.read('angular.json');
  if (angularJson) {
    try {
      const workspace = JSON.parse(angularJson.toString());
      const changeDetection =
        workspace.schematics?.['@schematics/angular:component']?.changeDetection;
      if (changeDetection === 'OnPush' || changeDetection === 'Default') {
        return changeDetection;
      }
    } catch {
      // ignore parse errors
    }
  }

  // Try nx.json
  const nxJson = tree.read('nx.json');
  if (nxJson) {
    try {
      const nx = JSON.parse(nxJson.toString());
      const changeDetection = nx.generators?.['@schematics/angular:component']?.changeDetection;
      if (changeDetection === 'OnPush' || changeDetection === 'Default') {
        return changeDetection;
      }
    } catch {
      // ignore parse errors
    }
  }

  return undefined;
}

/**
 * Post-process generated files to add ChangeDetectionStrategy.OnPush
 * to the @Component decorator when changeDetection is set to 'OnPush'.
 */
function processChangeDetection(
  content: Buffer,
  options: AngularPrimitivesComponentSchema,
): Buffer {
  if (options.changeDetection !== 'OnPush') {
    return content;
  }

  let contentStr = content.toString();

  // Only process TypeScript files that contain `@Component`
  if (!contentStr.includes('@Component')) {
    return content;
  }

  // Add ChangeDetectionStrategy to the `@angular/core` import
  const importRegex = /import\s*\{([^}]*)\}\s*from\s*['"]@angular\/core['"];/;
  if (importRegex.test(contentStr) && !contentStr.includes('ChangeDetectionStrategy')) {
    contentStr = contentStr.replace(importRegex, (_, imports) => {
      const trimmed = imports.trim();
      return `import { ${trimmed}, ChangeDetectionStrategy } from '@angular/core';`;
    });
  }

  // Add changeDetection to the `@Component` decorator
  contentStr = contentStr.replace(
    /@Component\(\{/,
    '@Component({\n  changeDetection: ChangeDetectionStrategy.OnPush,',
  );

  return Buffer.from(contentStr);
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

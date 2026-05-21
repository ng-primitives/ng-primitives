import {
  createCompilerHost,
  DirectiveEntry,
  DocEntry,
  EntryType,
  MemberEntry,
  MemberTags,
  NgtscProgram,
  performCompilation,
  PropertyEntry,
  readConfiguration,
  TypeAliasEntry,
} from '@angular/compiler-cli';
import { logger, PromiseExecutor } from '@nx/devkit';
import { writeFileSync } from 'fs';
import { ensureDirSync } from 'fs-extra';
import * as path from 'path';
import * as ts from 'typescript';
import { ApiExtractionExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<ApiExtractionExecutorSchema> = async (options, context) => {
  const outputPath = options.outputPath || 'apps/documentation/src/app/api/documentation.json';
  // Resolve output path relative to workspace root
  const workspaceRoot = context?.root || process.cwd();
  const resolvedOutputPath = path.resolve(workspaceRoot, outputPath);
  const tsConfigPath = ts.findConfigFile(
    'packages/ng-primitives',
    ts.sys.fileExists,
    'tsconfig.lib.json',
  );
  const { options: compilerOptions, rootNames } = readConfiguration(tsConfigPath);

  const host = createCompilerHost({ options: compilerOptions });
  const compilation = performCompilation({ options: compilerOptions, rootNames, host });
  const program = compilation.program as NgtscProgram;

  // Build a map of input alias → default value by parsing the AST
  const defaultsMap = buildDefaultsMap(rootNames);

  const directives: Record<string, DirectiveDefinition> = {};
  const configs: Record<string, ConfigDefinition> = {};
  const typeAliases: Record<string, string> = {};

  for (const entrypoint of rootNames) {
    try {
      const api = program.getApiDocumentation(entrypoint, new Set<string>());

      for (const entry of api.entries) {
        if (isTypeAlias(entry)) {
          typeAliases[entry.name] = entry.type;
        }
      }
    } catch (e) {
      continue;
    }
  }

  for (const entrypoint of rootNames) {
    try {
      const api = program.getApiDocumentation(entrypoint, new Set<string>());

      for (const directive of api.entries) {
        if (!isDirective(directive)) {
          continue;
        }

        directives[directive.name] = {
          name: directive.name,
          description: directive.description,
          selector: directive.selector,
          exportAs: directive.exportAs,
          inputs: directive.members
            .filter(isInput)
            .map(entry => mapToInputDefinition(entry, typeAliases, defaultsMap)),
          outputs: directive.members?.filter(isOutput).map(mapToOutputDefinition),
        };
      }
    } catch (e) {
      logger.error(`Error processing entrypoint ${entrypoint}: ${e}`);
      continue;
    }
  }

  // Extract config interfaces
  const configDefaults = buildConfigDefaultsMap(rootNames);
  extractConfigInterfaces(rootNames, typeAliases, configDefaults, configs);

  // Ensure the output directory exists
  const outputDir = resolvedOutputPath.substring(0, resolvedOutputPath.lastIndexOf(path.sep));
  ensureDirSync(outputDir);

  writeFileSync(resolvedOutputPath, JSON.stringify({ ...directives, ...configs }, null, 2));

  logger.info(`API data written to: ${resolvedOutputPath}`);

  logger.info('API extraction completed successfully.');

  return { success: true };
};

export default runExecutor;

interface DirectiveDefinition {
  name: string;
  selector: string;
  description?: string;
  exportAs: string[];
  inputs?: InputDefinition[];
  outputs?: OutputDefinition[];
}

interface InputDefinition {
  name: string;
  type: string;
  description: string;
  isRequired: boolean;
  defaultValue?: string;
}

interface OutputDefinition {
  name: string;
  type: string;
  description: string;
}

interface ConfigDefinition {
  name: string;
  properties: ConfigPropertyDefinition[];
}

interface ConfigPropertyDefinition {
  name: string;
  type: string;
  description: string;
  default?: string;
}

/**
 * Extract config interfaces (Ngp*Config) from source files and populate the configs record.
 */
function extractConfigInterfaces(
  rootNames: readonly string[],
  typeAliases: Record<string, string>,
  configDefaults: Map<string, string>,
  configs: Record<string, ConfigDefinition>,
): void {
  for (const fileName of rootNames) {
    const fileContent = ts.sys.readFile(fileName);
    if (!fileContent) continue;

    const sourceFile = ts.createSourceFile(fileName, fileContent, ts.ScriptTarget.Latest, true);

    ts.forEachChild(sourceFile, function visit(node) {
      if (
        ts.isInterfaceDeclaration(node) &&
        node.name.text.startsWith('Ngp') &&
        node.name.text.endsWith('Config') &&
        node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)
      ) {
        const interfaceName = node.name.text;
        // NgpAccordionConfig → defaultAccordionConfig
        const defaultConfigName = `default${interfaceName.slice(3)}`;

        const properties: ConfigPropertyDefinition[] = [];

        for (const member of node.members) {
          if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
            const propName = member.name.text;

            // Extract JSDoc comment
            const jsDocComment = extractJsDocComment(member, sourceFile);

            // Extract type
            let type = member.type ? member.type.getText(sourceFile) : 'unknown';
            type = resolveType(type, typeAliases);

            // Get default value from config defaults map or JSDoc @default tag
            const jsDocDefault = extractJsDocDefault(member);
            const defaultValue =
              jsDocDefault ?? configDefaults.get(`${defaultConfigName}:${propName}`);

            properties.push({
              name: propName,
              type,
              description: jsDocComment,
              ...(defaultValue !== undefined ? { default: defaultValue } : {}),
            });
          }
        }

        if (properties.length > 0) {
          configs[interfaceName] = { name: interfaceName, properties };
        }
      }
      ts.forEachChild(node, visit);
    });
  }
}

/**
 * Extract the leading JSDoc comment text from a node.
 */
function extractJsDocComment(node: ts.Node, sourceFile: ts.SourceFile): string {
  const fullText = sourceFile.getFullText();
  const commentRanges = ts.getLeadingCommentRanges(fullText, node.getFullStart());
  if (!commentRanges) return '';

  for (const range of commentRanges) {
    const comment = fullText.slice(range.pos, range.end);
    if (comment.startsWith('/**')) {
      // Parse JSDoc comment - extract description (exclude @tags)
      const lines = comment
        .replace(/^\/\*\*\s*/, '')
        .replace(/\s*\*\/\s*$/, '')
        .split('\n')
        .map(line => line.replace(/^\s*\*\s?/, '').trim())
        .filter(line => !line.startsWith('@'));
      return lines.join(' ').trim();
    }
  }
  return '';
}

/**
 * Extract @default value from JSDoc comments.
 */
function extractJsDocDefault(node: ts.Node): string | undefined {
  const jsDocs = (node as any).jsDoc as ts.JSDoc[] | undefined;
  if (jsDocs) {
    for (const jsDoc of jsDocs) {
      if (jsDoc.tags) {
        for (const tag of jsDoc.tags) {
          if (tag.tagName.text === 'default' && tag.comment) {
            return typeof tag.comment === 'string' ? tag.comment : undefined;
          }
        }
      }
    }
  }
  return undefined;
}

function isDirective(entry: DocEntry): entry is DirectiveEntry {
  return entry.entryType === EntryType.Directive;
}

function isTypeAlias(entry: DocEntry): entry is TypeAliasEntry {
  return entry.entryType === EntryType.TypeAlias;
}

/**
 * Check if a resolved type is a simple union of literals (string literals,
 * number literals, booleans, null, undefined). These are safe to inline
 * in the docs as they provide immediate value to the reader.
 */
function isSimpleLiteralUnion(resolvedType: string): boolean {
  const parts = resolvedType
    .split('|')
    .map(p => p.trim())
    .filter(p => p.length > 0);
  return (
    parts.length > 0 &&
    parts.every(part => /^('[^']*'|"[^"]*"|\d+|true|false|null|undefined)$/.test(part))
  );
}

/**
 * Normalize a multiline type string into a single-line representation.
 */
function normalizeTypeString(type: string): string {
  return type
    .split('\n')
    .map(line => line.trim())
    .join(' ')
    .replace(/^\|\s*/, '');
}

/**
 * Resolve a type name against collected type aliases. Only resolves
 * simple literal unions to avoid displaying complex object types inline.
 */
function resolveType(typeName: string, typeAliases: Record<string, string>): string {
  // Handle array types like NgpMenuTriggerType[]
  const arrayMatch = typeName.match(/^(.+)\[\]$/);
  if (arrayMatch) {
    const inner = resolveType(arrayMatch[1], typeAliases);
    if (inner !== arrayMatch[1]) {
      return `(${inner})[]`;
    }
    return typeName;
  }

  const resolved = typeAliases[typeName];
  if (resolved) {
    const normalized = normalizeTypeString(resolved);
    if (isSimpleLiteralUnion(normalized)) {
      return normalized;
    }
  }
  return typeName;
}

function isProperty(entry: MemberEntry): entry is PropertyEntry {
  return entry.memberType === 'property';
}

function isInput(entry: MemberEntry): entry is PropertyEntry {
  // the following inputs we want to skip as they are just HTML attributes
  const inputsToSkip = ['id'];

  return (
    isProperty(entry) &&
    entry.memberTags.includes(MemberTags.Input) &&
    !inputsToSkip.includes(entry.inputAlias)
  );
}

function isOutput(entry: MemberEntry): entry is PropertyEntry {
  return isProperty(entry) && entry.memberTags.includes(MemberTags.Output);
}

/**
 * Extract a simple literal value from a TypeScript AST node.
 * Returns undefined for complex expressions (function calls, property accesses, etc.).
 */
function extractLiteralValue(node: ts.Node): string | undefined {
  if (ts.isStringLiteral(node)) return `'${node.text}'`;
  if (ts.isNumericLiteral(node)) return node.text;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return 'true';
  if (node.kind === ts.SyntaxKind.FalseKeyword) return 'false';
  if (node.kind === ts.SyntaxKind.NullKeyword) return 'null';
  if (node.kind === ts.SyntaxKind.UndefinedKeyword) return 'undefined';
  if (ts.isPrefixUnaryExpression(node) && ts.isNumericLiteral(node.operand)) {
    return node.operator === ts.SyntaxKind.MinusToken ? `-${node.operand.text}` : node.operand.text;
  }
  if (ts.isArrayLiteralExpression(node) && node.elements.length === 0) return '[]';
  return undefined;
}

/**
 * Extract the input alias from the options object in an input() call.
 * Looks for the `alias` property in the second argument (options object).
 */
function extractInputAlias(
  callExpr: ts.CallExpression,
  sourceFile: ts.SourceFile,
): string | undefined {
  // The options object is the last argument (2nd for input(), 1st for input.required())
  for (const arg of callExpr.arguments) {
    if (ts.isObjectLiteralExpression(arg)) {
      for (const prop of arg.properties) {
        if (
          ts.isPropertyAssignment(prop) &&
          prop.name.getText(sourceFile) === 'alias' &&
          ts.isStringLiteral(prop.initializer)
        ) {
          return prop.initializer.text;
        }
      }
    }
  }
  return undefined;
}

/**
 * Build a map of config variable name + property → default value by walking source files
 * for `export const default*Config = { ... }` object literals.
 */
function buildConfigDefaultsMap(rootNames: readonly string[]): Map<string, string> {
  const configDefaults = new Map<string, string>();

  for (const fileName of rootNames) {
    const fileContent = ts.sys.readFile(fileName);
    if (!fileContent) continue;

    const sourceFile = ts.createSourceFile(fileName, fileContent, ts.ScriptTarget.Latest, true);

    ts.forEachChild(sourceFile, function visit(node) {
      // Look for: export const default*Config = { ... }
      if (
        ts.isVariableStatement(node) &&
        node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)
      ) {
        for (const decl of node.declarationList.declarations) {
          const name = decl.name.getText(sourceFile);
          if (
            name.startsWith('default') &&
            name.endsWith('Config') &&
            decl.initializer &&
            ts.isObjectLiteralExpression(decl.initializer)
          ) {
            for (const prop of decl.initializer.properties) {
              if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                const value = extractLiteralValue(prop.initializer);
                if (value !== undefined) {
                  configDefaults.set(`${name}:${prop.name.text}`, value);
                }
              }
            }
          }
        }
      }
      ts.forEachChild(node, visit);
    });
  }

  return configDefaults;
}

/**
 * For a class, find any member initialized with `inject*Config()` and return a map
 * of member name → default config variable name (e.g., "config" → "defaultAccordionConfig").
 */
function findConfigMembers(
  classNode: ts.ClassDeclaration,
  sourceFile: ts.SourceFile,
): Map<string, string> {
  const configMembers = new Map<string, string>();

  for (const member of classNode.members) {
    if (
      ts.isPropertyDeclaration(member) &&
      member.name &&
      ts.isIdentifier(member.name) &&
      member.initializer &&
      ts.isCallExpression(member.initializer)
    ) {
      const callText = member.initializer.expression.getText(sourceFile);
      // Match inject*Config() calls
      const match = callText.match(/^inject(\w+Config)$/);
      if (match) {
        // injectAccordionConfig → defaultAccordionConfig
        const defaultConfigName = `default${match[1]}`;
        configMembers.set(member.name.text, defaultConfigName);
      }
    }
  }

  return configMembers;
}

/**
 * Build a map of input alias → default value by walking source file ASTs.
 * Extracts simple literal defaults from `input(defaultValue, { alias: '...' })` calls,
 * and resolves `this.config.X` expressions via config default objects.
 */
function buildDefaultsMap(rootNames: readonly string[]): Map<string, string> {
  const defaults = new Map<string, string>();
  const configDefaults = buildConfigDefaultsMap(rootNames);

  for (const fileName of rootNames) {
    const fileContent = ts.sys.readFile(fileName);
    if (!fileContent) continue;

    const sourceFile = ts.createSourceFile(fileName, fileContent, ts.ScriptTarget.Latest, true);

    ts.forEachChild(sourceFile, function visit(node) {
      if (ts.isClassDeclaration(node)) {
        const configMembers = findConfigMembers(node, sourceFile);

        for (const member of node.members) {
          if (
            ts.isPropertyDeclaration(member) &&
            member.initializer &&
            ts.isCallExpression(member.initializer)
          ) {
            const callExpr = member.initializer;
            const exprText = callExpr.expression.getText(sourceFile);

            // Only handle input(...), skip input.required(...)
            if (exprText === 'input' && callExpr.arguments.length > 0) {
              const firstArg = callExpr.arguments[0];
              let defaultStr = extractLiteralValue(firstArg);

              // If not a simple literal, try resolving this.<configMember>.<prop>
              if (
                defaultStr === undefined &&
                ts.isPropertyAccessExpression(firstArg) &&
                ts.isPropertyAccessExpression(firstArg.expression) &&
                firstArg.expression.expression.kind === ts.SyntaxKind.ThisKeyword
              ) {
                const memberName = firstArg.expression.name.text; // e.g., "config"
                const propName = firstArg.name.text; // e.g., "type"
                const defaultConfigName = configMembers.get(memberName);
                if (defaultConfigName) {
                  defaultStr = configDefaults.get(`${defaultConfigName}:${propName}`);
                }
              }

              if (defaultStr !== undefined) {
                const alias = extractInputAlias(callExpr, sourceFile);
                if (alias) {
                  defaults.set(alias, defaultStr);
                }
              }
            }
          }
        }
      }
      ts.forEachChild(node, visit);
    });
  }

  return defaults;
}

function mapToInputDefinition(
  entry: PropertyEntry,
  typeAliases: Record<string, string>,
  defaultsMap: Map<string, string>,
): InputDefinition {
  return {
    name: entry.inputAlias,
    // Extract the type parameter, handling nested generics and function types with commas
    type: (() => {
      const match = entry.type.match(/^(InputSignal|InputSignalWithTransform|ModelSignal)<(.+)>$/);
      if (!match) return entry.type;
      const typeParam = match[2];
      // For InputSignalWithTransform<T, U>, only extract T (but avoid splitting inside parens)
      // Find the first comma not inside parentheses
      let depth = 0;
      for (let i = 0; i < typeParam.length; i++) {
        if (typeParam[i] === '(') depth++;
        else if (typeParam[i] === ')') depth--;
        else if (typeParam[i] === ',' && depth === 0) {
          return resolveType(typeParam.slice(0, i).trim(), typeAliases);
        }
      }
      return resolveType(typeParam.trim(), typeAliases);
    })(),
    description: entry.description,
    isRequired: entry.isRequiredInput || entry.jsdocTags.some(tag => tag.name === 'required'),
    defaultValue:
      entry.jsdocTags.find(tag => tag.name === 'default')?.comment ??
      defaultsMap.get(entry.inputAlias),
  };
}

function mapToOutputDefinition(entry: PropertyEntry): OutputDefinition {
  return {
    name: entry.type.includes('ModelSignal') ? `${entry.outputAlias}Change` : entry.outputAlias,
    // the type will be OutputEmitterRef<T> or ModelSignal<T>, we want to extract the T
    type: entry.type.replace(/^(OutputEmitterRef|ModelSignal)<(.*)>$/, '$2'),
    description: entry.description,
  };
}

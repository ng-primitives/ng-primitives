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

  const directives: Record<string, DirectiveDefinition> = {};
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
            .map(entry => mapToInputDefinition(entry, typeAliases)),
          outputs: directive.members?.filter(isOutput).map(mapToOutputDefinition),
        };
      }
    } catch (e) {
      logger.error(`Error processing entrypoint ${entrypoint}: ${e}`);
      continue;
    }
  }

  // Ensure the output directory exists
  const outputDir = resolvedOutputPath.substring(0, resolvedOutputPath.lastIndexOf(path.sep));
  ensureDirSync(outputDir);

  writeFileSync(resolvedOutputPath, JSON.stringify(directives, null, 2));

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

function mapToInputDefinition(
  entry: PropertyEntry,
  typeAliases: Record<string, string>,
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
    defaultValue: entry.jsdocTags.find(tag => tag.name === 'default')?.comment,
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

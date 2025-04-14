import {
  createCompilerHost,
  DirectiveEntry,
  DocEntry,
  MemberEntry,
  MemberTags,
  NgtscProgram,
  performCompilation,
  PropertyEntry,
  readConfiguration,
} from '@angular/compiler-cli';
import { PromiseExecutor } from '@nx/devkit';
import { writeFileSync } from 'fs';
import * as ts from 'typescript';
import { ApiExtractionExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<ApiExtractionExecutorSchema> = async () => {
  const tsConfigPath = ts.findConfigFile(
    'packages/ng-primitives',
    ts.sys.fileExists,
    'tsconfig.lib.json',
  );
  const { options, rootNames } = readConfiguration(tsConfigPath);

  const host = createCompilerHost({ options });
  const compilation = performCompilation({ options, rootNames, host });
  const program = compilation.program as NgtscProgram;

  const directives: Record<string, DirectiveDefinition> = {};

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
          inputs: directive.members.filter(isInput).map(mapToInputDefinition),
          outputs: directive.members?.filter(isOutput).map(mapToOutputDefinition),
        };
      }
    } catch (e) {
      console.error(`Error processing entrypoint ${entrypoint}:`, e);
      continue;
    }
  }

  writeFileSync(
    'apps/documentation/src/app/api/documentation.json',
    JSON.stringify(directives, null, 2),
  );

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
  return entry.entryType === 'directive';
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

function mapToInputDefinition(entry: PropertyEntry): InputDefinition {
  return {
    name: entry.inputAlias,
    // the type will be InputSignal<T>, InputSignalWithTransform<T> or ModelSignal<T>, we want to extract the T
    // in the case of InputSignalWithTransform<T, U>, we only want the T
    type: entry.type
      .replace(/^(InputSignal|InputSignalWithTransform|ModelSignal)<(.*)>$/, '$2')
      .split(',')[0],
    description: entry.description,
    isRequired: entry.isRequiredInput,
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

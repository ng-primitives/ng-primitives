import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';
import { addExportToIndex, getPrimitiveSourceRoot } from '../../utils';
import { analyzeDirective, DirectiveMetadata } from './directive-analyzer';
import { StateGeneratorSchema } from './schema';

export async function stateGenerator(tree: Tree, options: StateGeneratorSchema) {
  // normalize the directive name - for example someone might pass in NgpAvatarDirective, but we want to use avatar
  // so we need to remove the Ngp and the Directive
  options.directive = options.directive.replace('Directive', '').replace('Ngp', '').toLowerCase();

  const sourceRoot = getPrimitiveSourceRoot(tree, options.primitive);

  // Analyze the existing directive to extract metadata (if it exists)
  // Look for the main primitive directive first, then fall back to the specific directive name
  const mainDirectiveFilePath = path.join(sourceRoot, options.primitive, `${options.primitive}.ts`);
  const specificDirectiveFilePath = path.join(
    sourceRoot,
    options.directive,
    `${options.directive}.ts`,
  );

  let directiveFilePath = mainDirectiveFilePath;
  if (!tree.exists(mainDirectiveFilePath) && tree.exists(specificDirectiveFilePath)) {
    directiveFilePath = specificDirectiveFilePath;
  }

  const directiveMetadata = analyzeDirective(tree, directiveFilePath);

  // Generate props interface based on directive inputs, outputs, and models
  const propsInterface = generatePropsInterface(directiveMetadata);
  const stateInterface = generateStateInterface(directiveMetadata);

  generateFiles(tree, path.join(__dirname, 'files'), sourceRoot, {
    ...options,
    ...names(options.directive),
    propsInterface,
    stateInterface,
    directiveMetadata,
  });

  addExportToIndex(
    tree,
    options.primitive,
    `export { Ngp${names(options.directive).className}StateToken, ngp${names(options.directive).className}, inject${names(options.directive).className}State, provide${names(options.directive).className}State, type Ngp${names(options.directive).className}State, type Ngp${names(options.directive).className}Props } from './${options.directive}/${options.directive}-state';`,
  );

  await formatFiles(tree);
}

function generatePropsInterface(metadata: DirectiveMetadata | null): string {
  if (!metadata) {
    return '';
  }

  const props: string[] = [];

  // Handle inputs
  if (metadata.inputs && metadata.inputs.length > 0) {
    metadata.inputs.forEach(input => {
      const optional = input.required ? '' : '?';
      const readonly = 'readonly ';

      // Convert input type to Signal type
      let type = input.type;
      if (!type.includes('Signal')) {
        // Handle generic types and transform functions
        if (input.transform && input.transform.includes('booleanAttribute')) {
          // For booleanAttribute transforms, use BooleanInput from @angular/cdk/coercion
          type = `Signal<boolean | string>`;
        } else if (input.transform) {
          // For other transforms, use the base type
          type = `Signal<${type}>`;
        } else {
          type = `Signal<${type}>`;
        }
      }

      const description = input.description || input.alias || input.name;
      props.push(
        `  /**\n   * ${description}\n   */\n  ${readonly}${input.name}${optional}: ${type};`,
      );
    });
  }

  // Handle outputs - convert to callback functions with 'on' prefix
  if (metadata.outputs && metadata.outputs.length > 0) {
    metadata.outputs.forEach(output => {
      // Convert outputName to onOutputName
      const callbackName = `on${output.name.charAt(0).toUpperCase() + output.name.slice(1)}`;

      // Extract the generic type from OutputEmitterRef<T> or similar
      let callbackType = output.type;
      const match = callbackType.match(/OutputEmitterRef<(.+)>|output<(.+)>/);
      if (match) {
        const emitType = match[1] || match[2];
        callbackType = `(value: ${emitType}) => void`;
      } else {
        callbackType = `(value: ${callbackType}) => void`;
      }

      const description = `Callback fired when ${output.name} is emitted.`;
      props.push(
        `  /**\n   * ${description}\n   */\n  readonly ${callbackName}?: ${callbackType};`,
      );
    });
  }

  // Handle models - convert to value signal + callback
  if (metadata.models && metadata.models.length > 0) {
    metadata.models.forEach(model => {
      // Extract the type from ModelSignal<T> or similar
      let modelType = model.type;
      const match = modelType.match(/ModelSignal<(.+)>|model<(.+)>/);
      if (match) {
        modelType = match[1] || match[2];
      }

      // Add value signal
      const valueDescription = `The ${model.name} value.`;
      props.push(
        `  /**\n   * ${valueDescription}\n   */\n  readonly ${model.name}?: Signal<${modelType}>;`,
      );

      // Add callback for value changes
      const callbackName = `on${model.name.charAt(0).toUpperCase() + model.name.slice(1)}Change`;
      const callbackDescription = `Callback fired when ${model.name} value changes.`;
      props.push(
        `  /**\n   * ${callbackDescription}\n   */\n  readonly ${callbackName}?: (value: ${modelType}) => void;`,
      );
    });
  }

  return props.join('\n\n');
}

function generateStateInterface(metadata: DirectiveMetadata | null): string {
  if (!metadata) {
    return '';
  }

  const stateProps: string[] = [];

  // Add state properties based on inputs (these are typically WritableSignals)
  if (metadata.inputs && metadata.inputs.length > 0) {
    metadata.inputs.forEach(input => {
      let type = input.type;
      if (!type.includes('Signal')) {
        type = `WritableSignal<${type}>`;
      } else {
        // Convert Signal to WritableSignal
        type = type.replace('Signal<', 'WritableSignal<');
      }
      stateProps.push(`  readonly ${input.name}: ${type};`);
    });
  }

  // Add state properties based on models (WritableSignals)
  if (metadata.models && metadata.models.length > 0) {
    metadata.models.forEach(model => {
      let modelType = model.type;
      const match = modelType.match(/ModelSignal<(.+)>|model<(.+)>/);
      if (match) {
        modelType = match[1] || match[2];
      }
      stateProps.push(`  readonly ${model.name}: WritableSignal<${modelType}>;`);
    });
  }

  // Add setter methods for all inputs and models
  if (metadata.inputs && metadata.inputs.length > 0) {
    metadata.inputs.forEach(input => {
      const baseType = input.type.replace(/Signal<(.+)>/, '$1');
      stateProps.push(
        `  set${input.name.charAt(0).toUpperCase() + input.name.slice(1)}(value: ${baseType}): void;`,
      );
    });
  }

  if (metadata.models && metadata.models.length > 0) {
    metadata.models.forEach(model => {
      let modelType = model.type;
      const match = modelType.match(/ModelSignal<(.+)>|model<(.+)>/);
      if (match) {
        modelType = match[1] || match[2];
      }
      stateProps.push(
        `  set${model.name.charAt(0).toUpperCase() + model.name.slice(1)}(value: ${modelType}): void;`,
      );
    });
  }

  // Add public methods from the directive
  if (metadata.methods && metadata.methods.length > 0) {
    metadata.methods
      .filter(method => method.isPublic)
      .forEach(method => {
        const params = method.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
        stateProps.push(`  ${method.name}(${params}): ${method.returnType};`);
      });
  }

  return stateProps.join('\n');
}

export default stateGenerator;

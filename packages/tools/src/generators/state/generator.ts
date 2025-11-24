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

  // Generate props interface based on directive inputs
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
  if (!metadata || !metadata.inputs || metadata.inputs.length === 0) {
    return '';
  }

  const props = metadata.inputs
    .map(input => {
      const optional = input.required ? '' : '?';
      const readonly = 'readonly ';

      // Convert input type to Signal type
      let type = input.type;
      if (!type.includes('Signal')) {
        // Handle generic types and transform functions
        if (input.transform) {
          // For transformed inputs, the signal type is typically the base type
          type = `Signal<${type}>`;
        } else {
          type = `Signal<${type}>`;
        }
      }

      const description = input.description || input.alias || input.name;
      return `  /**\n   * ${description}\n   */\n  ${readonly}${input.name}${optional}: ${type};`;
    })
    .join('\n\n');

  return props;
}

function generateStateInterface(metadata: DirectiveMetadata | null): string {
  if (!metadata || !metadata.inputs) {
    return '';
  }

  // Generate common state properties based on patterns observed
  const stateProps: string[] = [];

  // Add state properties based on inputs (these are typically readonly signals)
  metadata.inputs.forEach(input => {
    let type = input.type;
    if (!type.includes('Signal')) {
      type = `Signal<${type}>`;
    }
    stateProps.push(`  readonly ${input.name}: ${type};`);
  });

  // Add setter methods for inputs that aren't readonly
  metadata.inputs.forEach(input => {
    if (!input.name.startsWith('readonly')) {
      const baseType = input.type.replace(/Signal<(.+)>/, '$1');
      stateProps.push(
        `  set${input.name.charAt(0).toUpperCase() + input.name.slice(1)}(value: ${baseType}): void;`,
      );
    }
  });

  return stateProps.join('\n');
}

export default stateGenerator;

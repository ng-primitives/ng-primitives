import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import { tsquery } from '@phenomnomnominal/tsquery';
import * as path from 'path';
import * as ts from 'typescript';
import { addExportToIndex, getPrimitiveSourceRoot } from '../../utils';
import { PatternGeneratorSchema } from './schema';

interface DirectiveInput {
  name: string;
  type: string;
  alias?: string;
  transform?: string;
  defaultValue?: string;
}

interface DirectiveOutput {
  name: string;
  type: string;
  alias?: string;
}

interface HostBinding {
  key: string;
  value: string;
  type: 'attribute' | 'property' | 'class' | 'style' | 'listener';
}

interface DirectiveMethod {
  name: string;
  parameters: Array<{ name: string; type: string; defaultValue?: string }>;
  returnType: string;
  body: string;
  isPublic: boolean;
  isAsync: boolean;
}

interface DirectiveDependency {
  name: string;
  type: string;
  injectionCall: string;
  isPrivate: boolean;
}

interface DirectiveSignal {
  name: string;
  type: string;
  initializer: string;
  isPrivate: boolean;
}

interface DirectiveConstructor {
  body: string;
}

function cleanupThisReferences(code: string): string {
  // First, remove this.state references (e.g., this.state.disabled() becomes disabled())
  let cleaned = code.replace(/this\.state\.(\w+)/g, '$1');

  // Then remove remaining this references (e.g., this.disabled() becomes disabled())
  cleaned = cleaned.replace(/this\.(\w+)/g, '$1');

  return cleaned;
}

function parseDirectiveInputs(sourceCode: string): DirectiveInput[] {
  const ast = tsquery.ast(sourceCode);
  const inputs: DirectiveInput[] = [];

  // Find all readonly properties that call input() function
  const properties = tsquery(ast, 'PropertyDeclaration:has(ReadonlyKeyword)');

  properties.forEach(property => {
    const prop = property as ts.PropertyDeclaration;
    if (!prop.name || !prop.initializer) return;

    const propertyName = (prop.name as ts.Identifier).text;

    // Check if initializer is a call to input()
    if (
      ts.isCallExpression(prop.initializer) &&
      ts.isIdentifier(prop.initializer.expression) &&
      prop.initializer.expression.text === 'input'
    ) {
      const callExpr = prop.initializer;

      // Get type from the property declaration or input() generic
      let type = 'any';
      if (prop.type) {
        const fullType = prop.type.getText();
        // Extract the main type from generics like "number, NumberInput" -> "number"
        const match = fullType.match(/^([^,<]+)/);
        type = match ? match[1].trim() : fullType;
      } else if (callExpr.typeArguments && callExpr.typeArguments.length > 0) {
        // Extract type from input<Type>() generic argument
        type = callExpr.typeArguments[0].getText();
      }

      let defaultValue: string | undefined;
      let alias: string | undefined;
      let transform: string | undefined;

      // First argument is default value
      if (callExpr.arguments.length > 0) {
        defaultValue = callExpr.arguments[0].getText();
      }

      // Second argument is options object
      if (callExpr.arguments.length > 1) {
        const optionsArg = callExpr.arguments[1];
        if (ts.isObjectLiteralExpression(optionsArg)) {
          optionsArg.properties.forEach(optionProp => {
            if (ts.isPropertyAssignment(optionProp) && ts.isIdentifier(optionProp.name)) {
              const propName = optionProp.name.text;
              if (propName === 'alias') {
                alias = optionProp.initializer.getText().replace(/['"]/g, '');
              } else if (propName === 'transform') {
                transform = optionProp.initializer.getText();
              }
            }
          });
        }
      }

      inputs.push({
        name: propertyName,
        type,
        alias,
        transform,
        defaultValue,
      });
    }
  });

  return inputs;
}

function parseDirectiveOutputs(sourceCode: string): DirectiveOutput[] {
  const ast = tsquery.ast(sourceCode);
  const outputs: DirectiveOutput[] = [];

  // Find all readonly properties that call output() function
  const properties = tsquery(ast, 'PropertyDeclaration:has(ReadonlyKeyword)');

  properties.forEach(property => {
    const prop = property as ts.PropertyDeclaration;
    if (!prop.name || !prop.initializer) return;

    const propertyName = (prop.name as ts.Identifier).text;

    // Check if initializer is a call to output()
    if (
      ts.isCallExpression(prop.initializer) &&
      ts.isIdentifier(prop.initializer.expression) &&
      prop.initializer.expression.text === 'output'
    ) {
      const callExpr = prop.initializer;

      // Get type from the property declaration or output() generic
      let type = 'any';
      if (prop.type) {
        const fullType = prop.type.getText();
        // Extract the main type from generics like "number, NumberInput" -> "number"
        const match = fullType.match(/^([^,<]+)/);
        type = match ? match[1].trim() : fullType;
      } else if (callExpr.typeArguments && callExpr.typeArguments.length > 0) {
        // Extract type from output<Type>() generic argument
        type = `OutputEmitter<${callExpr.typeArguments[0].getText()}>`;
      }

      let alias: string | undefined;

      if (callExpr.arguments.length > 0) {
        const optionsArg = callExpr.arguments[0];
        if (ts.isObjectLiteralExpression(optionsArg)) {
          optionsArg.properties.forEach(optionProp => {
            if (ts.isPropertyAssignment(optionProp) && ts.isIdentifier(optionProp.name)) {
              const propName = optionProp.name.text;
              if (propName === 'alias') {
                alias = optionProp.initializer.getText().replace(/['"]/g, '');
              }
            }
          });
        }
      }

      outputs.push({
        name: propertyName,
        type,
        alias,
      });
    }
  });

  return outputs;
}

function parseHostBindings(sourceCode: string): HostBinding[] {
  const ast = tsquery.ast(sourceCode);
  const hostBindings: HostBinding[] = [];

  // Find the @Directive decorator with host property
  const decorators = tsquery(ast, 'Decorator:has(Identifier[name=Directive])');

  decorators.forEach(decorator => {
    // Find the host property in the decorator
    const hostProperty = tsquery(decorator, 'PropertyAssignment:has(Identifier[name=host])');

    if (hostProperty.length > 0) {
      const hostAssignment = hostProperty[0] as ts.PropertyAssignment;
      if (ts.isObjectLiteralExpression(hostAssignment.initializer)) {
        const hostObject = hostAssignment.initializer;

        hostObject.properties.forEach(prop => {
          if (ts.isPropertyAssignment(prop)) {
            let key: string;

            if (ts.isIdentifier(prop.name)) {
              key = prop.name.text;
            } else if (ts.isStringLiteral(prop.name)) {
              key = prop.name.text;
            } else {
              return;
            }

            const value = prop.initializer.getText().replace(/['"]/g, '');

            let type: HostBinding['type'] = 'attribute';

            // Determine binding type based on key pattern
            if (key.startsWith('[attr.')) {
              type = 'attribute';
            } else if (key.startsWith('[class.')) {
              type = 'class';
            } else if (key.startsWith('[style.')) {
              type = 'style';
            } else if (key.startsWith('[') && key.endsWith(']')) {
              type = 'property';
            } else if (key.startsWith('(') && key.endsWith(')')) {
              type = 'listener';
            } else {
              // Static attributes
              type = 'attribute';
            }

            hostBindings.push({
              key,
              value,
              type,
            });
          }
        });
      }
    }
  });

  // Also parse @HostListener decorators on methods
  const classDeclarations = tsquery(ast, 'ClassDeclaration');

  classDeclarations.forEach(classDeclaration => {
    if (ts.isClassDeclaration(classDeclaration)) {
      classDeclaration.members.forEach(member => {
        if (ts.isMethodDeclaration(member) && member.modifiers) {
          const decorators = member.modifiers.filter(modifier => ts.isDecorator(modifier));
          decorators.forEach(decorator => {
            if (
              ts.isDecorator(decorator) &&
              ts.isCallExpression(decorator.expression) &&
              ts.isIdentifier(decorator.expression.expression) &&
              decorator.expression.expression.text === 'HostListener'
            ) {
              // Get the event name from the first argument
              const args = decorator.expression.arguments;
              if (args.length > 0 && ts.isStringLiteral(args[0])) {
                const eventName = args[0].text;
                const methodName =
                  member.name && ts.isIdentifier(member.name) ? member.name.text : '';

                // Create a listener binding
                hostBindings.push({
                  key: `(${eventName})`,
                  value: `${methodName}($event)`,
                  type: 'listener',
                });
              }
            }
          });
        }
      });
    }
  });

  return hostBindings;
}

function parseDirectiveMethods(sourceCode: string, className: string): DirectiveMethod[] {
  const ast = tsquery.ast(sourceCode);
  const methods: DirectiveMethod[] = [];

  // Find the directive class
  const classDeclarations = tsquery(ast, `ClassDeclaration:has(Identifier[name=${className}])`);

  if (classDeclarations.length > 0) {
    const classDeclaration = classDeclarations[0] as ts.ClassDeclaration;

    classDeclaration.members.forEach(member => {
      if (ts.isMethodDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
        const methodName = member.name.text;

        // Skip internal methods, getters, setters, and lifecycle hooks
        if (
          methodName.startsWith('_') ||
          methodName.startsWith('ng') ||
          methodName.includes('Listener') ||
          ts.isGetAccessorDeclaration(member) ||
          ts.isSetAccessorDeclaration(member)
        ) {
          return;
        }

        // Determine if method is public (no private/protected modifiers)
        const isPublic = !member.modifiers?.some(
          mod =>
            mod.kind === ts.SyntaxKind.PrivateKeyword ||
            mod.kind === ts.SyntaxKind.ProtectedKeyword,
        );

        // Check if method is async
        const isAsync =
          member.modifiers?.some(mod => mod.kind === ts.SyntaxKind.AsyncKeyword) || false;

        // Parse parameters
        const parameters: Array<{ name: string; type: string; defaultValue?: string }> = [];
        member.parameters.forEach(param => {
          if (ts.isIdentifier(param.name)) {
            const paramName = param.name.text;
            const paramType = param.type ? param.type.getText() : 'any';
            const defaultValue = param.initializer ? param.initializer.getText() : undefined;

            parameters.push({
              name: paramName,
              type: paramType,
              defaultValue,
            });
          }
        });

        // Get return type
        const returnType = member.type ? member.type.getText() : 'void';

        // Get method body and clean up this references
        const rawBody = member.body ? member.body.getText() : '{}';
        const body = cleanupThisReferences(rawBody);

        methods.push({
          name: methodName,
          parameters,
          returnType,
          body,
          isPublic,
          isAsync,
        });
      }
    });
  }

  return methods;
}

function parseDirectiveDependencies(sourceCode: string, className: string): DirectiveDependency[] {
  const ast = tsquery.ast(sourceCode);
  const dependencies: DirectiveDependency[] = [];

  // Find the directive class
  const classDeclarations = tsquery(ast, `ClassDeclaration:has(Identifier[name=${className}])`);

  if (classDeclarations.length > 0) {
    const classDeclaration = classDeclarations[0] as ts.ClassDeclaration;

    classDeclaration.members.forEach(member => {
      if (ts.isPropertyDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
        const propertyName = member.name.text;

        // Skip if it's an input, output, or other non-dependency property
        if (
          member.initializer &&
          ts.isCallExpression(member.initializer) &&
          ts.isIdentifier(member.initializer.expression)
        ) {
          const callExpressionName = member.initializer.expression.text;

          // Check if it's an inject() call or inject* function
          if (callExpressionName === 'inject' || callExpressionName.startsWith('inject')) {
            // Skip input() and output() calls
            if (callExpressionName === 'input' || callExpressionName === 'output') {
              return;
            }

            // Determine if property is private/protected
            const isPrivate =
              member.modifiers?.some(
                mod =>
                  mod.kind === ts.SyntaxKind.PrivateKeyword ||
                  mod.kind === ts.SyntaxKind.ProtectedKeyword,
              ) || false;

            // Get property type
            let type = 'any';
            if (member.type) {
              type = member.type.getText();
            }

            // Get the full injection call and clean up this references
            const rawInjectionCall = member.initializer.getText();
            const injectionCall = cleanupThisReferences(rawInjectionCall);

            dependencies.push({
              name: propertyName,
              type,
              injectionCall,
              isPrivate,
            });
          }
        }
      }
    });
  }

  return dependencies;
}

function parseDirectiveSignals(sourceCode: string, className: string): DirectiveSignal[] {
  const ast = tsquery.ast(sourceCode);
  const signals: DirectiveSignal[] = [];

  // Find the directive class
  const classDeclarations = tsquery(ast, `ClassDeclaration:has(Identifier[name=${className}])`);
  if (classDeclarations.length > 0) {
    const classDeclaration = classDeclarations[0] as ts.ClassDeclaration;

    classDeclaration.members.forEach(member => {
      if (ts.isPropertyDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
        const propertyName = member.name.text;

        // Look for signal() or computed() calls
        if (
          member.initializer &&
          ts.isCallExpression(member.initializer) &&
          ts.isIdentifier(member.initializer.expression)
        ) {
          const callExpressionName = member.initializer.expression.text;

          if (callExpressionName === 'signal' || callExpressionName === 'computed') {
            // Determine if property is private/protected
            const isPrivate =
              member.modifiers?.some(
                mod =>
                  mod.kind === ts.SyntaxKind.PrivateKeyword ||
                  mod.kind === ts.SyntaxKind.ProtectedKeyword,
              ) || false;

            // Get property type
            let type = 'any';
            if (member.type) {
              type = member.type.getText();
            }

            // Get the full initializer and clean up this references
            const rawInitializer = member.initializer.getText();
            const initializer = cleanupThisReferences(rawInitializer);

            signals.push({
              name: propertyName,
              type,
              initializer,
              isPrivate,
            });
          }
        }
      }
    });
  }

  return signals;
}

function parseDirectiveConstructor(
  sourceCode: string,
  className: string,
): DirectiveConstructor | null {
  const ast = tsquery.ast(sourceCode);

  // Find the directive class
  const classDeclarations = tsquery(ast, `ClassDeclaration:has(Identifier[name=${className}])`);
  if (classDeclarations.length > 0) {
    const classDeclaration = classDeclarations[0] as ts.ClassDeclaration;

    // Find constructor
    const constructor = classDeclaration.members.find(member =>
      ts.isConstructorDeclaration(member),
    ) as ts.ConstructorDeclaration | undefined;

    if (constructor && constructor.body) {
      // Get constructor body and clean up this references
      const rawBody = constructor.body.getText();
      const body = cleanupThisReferences(rawBody);

      return { body };
    }
  }

  return null;
}

export async function patternGenerator(tree: Tree, options: PatternGeneratorSchema) {
  // normalize the directive name - for example someone might pass in NgpAvatar, but we want to use avatar
  options.directive = options.directive.replace('Ngp', '').toLowerCase();

  const sourceRoot = getPrimitiveSourceRoot(tree, options.primitive);
  const directiveNames = names(options.directive);

  // Parse the existing directive to extract inputs, outputs, host bindings, methods, and dependencies
  const directivePath = `${sourceRoot}/${options.directive}/${options.directive}.ts`;
  let inputs: DirectiveInput[] = [];
  let outputs: DirectiveOutput[] = [];
  let hostBindings: HostBinding[] = [];
  let methods: DirectiveMethod[] = [];
  let dependencies: DirectiveDependency[] = [];
  let signals: DirectiveSignal[] = [];
  let constructor: DirectiveConstructor | null = null;

  if (tree.exists(directivePath)) {
    const directiveContent = tree.read(directivePath, 'utf-8');
    inputs = parseDirectiveInputs(directiveContent);
    outputs = parseDirectiveOutputs(directiveContent);
    hostBindings = parseHostBindings(directiveContent);
    methods = parseDirectiveMethods(directiveContent, `Ngp${directiveNames.className}`);
    dependencies = parseDirectiveDependencies(directiveContent, `Ngp${directiveNames.className}`);
    signals = parseDirectiveSignals(directiveContent, `Ngp${directiveNames.className}`);
    constructor = parseDirectiveConstructor(directiveContent, `Ngp${directiveNames.className}`);
  }

  // Generate pattern file with parsed inputs, outputs, host bindings, methods, dependencies, signals, and constructor
  generateFiles(tree, path.join(__dirname, 'files'), sourceRoot, {
    ...options,
    ...directiveNames,
    inputs,
    outputs,
    hostBindings,
    methods,
    dependencies,
    signals,
    constructor,
  });

  // Update the existing directive file to add the pattern provider
  if (tree.exists(directivePath)) {
    let directiveContent = tree.read(directivePath, 'utf-8');
    const ast = tsquery.ast(directiveContent);

    // Add import for pattern
    if (!directiveContent.includes(`from './${options.directive}-pattern'`)) {
      // Find the last import statement
      const importDeclarations = tsquery(ast, 'ImportDeclaration');

      if (importDeclarations.length > 0) {
        const lastImport = importDeclarations[importDeclarations.length - 1];
        const importToAdd = `\nimport { ngp${directiveNames.className}Pattern, provide${directiveNames.className}Pattern } from './${options.directive}-pattern';`;
        directiveContent =
          directiveContent.slice(0, lastImport.getEnd()) +
          importToAdd +
          directiveContent.slice(lastImport.getEnd());
      }
    }

    // Update the AST with new content
    const updatedAst = tsquery.ast(directiveContent);

    // Add provider to providers array in @Directive decorator
    const decorators = tsquery(updatedAst, 'Decorator:has(Identifier[name=Directive])');

    if (decorators.length > 0) {
      const decorator = decorators[0];
      const decoratorText = decorator.getText();

      // Check if provider is already in the decorator
      if (!decoratorText.includes(`provide${directiveNames.className}Pattern`)) {
        // Check if providers array exists
        const providersProperty = tsquery(
          decorator,
          'PropertyAssignment:has(Identifier[name=providers])',
        );

        if (providersProperty.length > 0) {
          // Add to existing providers array
          const providersArray = tsquery(
            providersProperty[0],
            'ArrayLiteralExpression',
          )[0] as ts.ArrayLiteralExpression;
          const providerToAdd = `provide${directiveNames.className}Pattern(Ngp${directiveNames.className}, instance => instance.pattern)`;

          // Insert at the beginning of the array
          const insertPosition = providersArray.getStart() + 1;
          directiveContent =
            directiveContent.slice(0, insertPosition) +
            providerToAdd +
            (providersArray.elements.length > 0 ? ', ' : '') +
            directiveContent.slice(insertPosition);
        } else {
          // Add providers array to decorator
          const objectLiteral = tsquery(
            decorator,
            'ObjectLiteralExpression',
          )[0] as ts.ObjectLiteralExpression;

          if (objectLiteral) {
            const providerToAdd = `\n  providers: [provide${directiveNames.className}Pattern(Ngp${directiveNames.className}, instance => instance.pattern)]`;

            // Find the position to insert (before the closing brace)
            const properties = objectLiteral.properties;
            if (properties.length > 0) {
              // Insert after the last property
              const lastProperty = properties[properties.length - 1];
              const insertPosition = lastProperty.getEnd();
              directiveContent =
                directiveContent.slice(0, insertPosition) +
                ',' +
                providerToAdd +
                directiveContent.slice(insertPosition);
            } else {
              // Empty object, insert after opening brace
              const insertPosition = objectLiteral.getStart() + 1;
              directiveContent =
                directiveContent.slice(0, insertPosition) +
                providerToAdd +
                '\n' +
                directiveContent.slice(insertPosition);
            }
          }
        }
      }
    }

    // Add pattern property to class if it doesn't exist
    if (!directiveContent.includes('readonly pattern =')) {
      const updatedAst2 = tsquery.ast(directiveContent);
      const classDeclarations = tsquery(
        updatedAst2,
        `ClassDeclaration:has(Identifier[name=Ngp${directiveNames.className}])`,
      );

      if (classDeclarations.length > 0) {
        const classDeclaration = classDeclarations[0] as ts.ClassDeclaration;

        // Find the class body and insert after the last input/output property
        if (classDeclaration.members) {
          // Find the last input() or output() property declaration
          let insertPosition = classDeclaration.members.pos;

          for (const member of classDeclaration.members) {
            if (
              ts.isPropertyDeclaration(member) &&
              member.initializer &&
              ts.isCallExpression(member.initializer) &&
              ts.isIdentifier(member.initializer.expression) &&
              (member.initializer.expression.text === 'input' ||
                member.initializer.expression.text === 'output')
            ) {
              insertPosition = member.getEnd();
            }
          }

          // Generate the pattern arguments based on parsed inputs and outputs
          const patternArgs: string[] = [];

          // Add inputs to pattern
          inputs.forEach(input => {
            patternArgs.push(`${input.name}: this.${input.name}`);
          });

          // Add output callbacks
          outputs.forEach(output => {
            const callbackName = `on${output.name.charAt(0).toUpperCase() + output.name.slice(1)}`;
            // Extract the type from OutputEmitter<T> to get T
            const typeMatch = output.type.match(/OutputEmitter<(.+)>/);
            const emitType = typeMatch ? typeMatch[1] : 'any';
            patternArgs.push(
              `${callbackName}: (value: ${emitType}) => this.${output.name}.emit(value)`,
            );
          });

          const argsString =
            patternArgs.length > 0 ? `{\n    ${patternArgs.join(',\n    ')}\n  }` : '{}';

          const patternProperty = `\n\n  /**\n   * The pattern instance.\n   */\n  protected readonly pattern = ngp${directiveNames.className}Pattern(${argsString});\n`;
          directiveContent =
            directiveContent.slice(0, insertPosition) +
            patternProperty +
            directiveContent.slice(insertPosition);
        }
      }
    }

    tree.write(directivePath, directiveContent);
  }

  // Add pattern exports to index.ts
  addExportToIndex(
    tree,
    options.primitive,
    `export {\n  ngp${directiveNames.className}Pattern,\n  provide${directiveNames.className}Pattern,\n  inject${directiveNames.className}Pattern,\n  type Ngp${directiveNames.className}State,\n  type Ngp${directiveNames.className}Props,\n} from './${options.directive}/${options.directive}-pattern';`,
  );

  await formatFiles(tree);
}

export default patternGenerator;

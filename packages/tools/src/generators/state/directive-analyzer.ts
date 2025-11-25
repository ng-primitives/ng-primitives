import { Tree } from '@nx/devkit';
import * as ts from 'typescript';

export interface DirectiveInput {
  name: string;
  type: string;
  defaultValue?: string;
  alias?: string;
  transform?: string;
  required: boolean;
  description?: string;
}

export interface DirectiveOutput {
  name: string;
  type: string;
  alias?: string;
}

export interface DirectiveModel {
  name: string;
  type: string;
  alias?: string;
}

export interface DirectiveDependency {
  name: string;
  type: string;
  initializerCode: string;
  isPrivate: boolean;
}

export interface DirectiveMethod {
  name: string;
  parameters: { name: string; type: string }[];
  returnType: string;
  body: string;
  isPublic: boolean;
  jsDoc?: string;
}

export interface DirectiveHostBinding {
  attribute: string;
  expression: string;
  type: 'attr' | 'data' | 'style' | 'class';
}

export interface DirectiveHostListener {
  event: string;
  method: string;
  parameters: string[];
}

export interface DirectiveMetadata {
  inputs: DirectiveInput[];
  outputs: DirectiveOutput[];
  models: DirectiveModel[];
  dependencies: DirectiveDependency[];
  methods: DirectiveMethod[];
  hostBindings: DirectiveHostBinding[];
  hostListeners: DirectiveHostListener[];
  className: string;
  genericParameters: string[];
}

export function analyzeDirective(tree: Tree, filePath: string): DirectiveMetadata | null {
  if (!tree.exists(filePath)) {
    return null;
  }

  const content = tree.read(filePath, 'utf-8');
  if (!content) {
    return null;
  }

  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  const metadata: DirectiveMetadata = {
    inputs: [],
    outputs: [],
    models: [],
    dependencies: [],
    methods: [],
    hostBindings: [],
    hostListeners: [],
    className: '',
    genericParameters: [],
  };

  function visit(node: ts.Node) {
    // Find the class with @Directive decorator
    if (ts.isClassDeclaration(node)) {
      const decorators = ts.canHaveDecorators(node) ? ts.getDecorators(node) : undefined;
      const directiveDecorator = decorators?.find((decorator: ts.Decorator) => {
        if (
          ts.isCallExpression(decorator.expression) &&
          ts.isIdentifier(decorator.expression.expression)
        ) {
          return decorator.expression.expression.text === 'Directive';
        }
        return false;
      });

      if (directiveDecorator && node.name) {
        metadata.className = node.name.text;

        // Extract generic parameters
        if (node.typeParameters) {
          metadata.genericParameters = node.typeParameters.map(param => param.name.text);
        }

        // Extract host bindings from @Directive decorator
        if (ts.isCallExpression(directiveDecorator.expression)) {
          analyzeDirectiveHostBindings(directiveDecorator.expression, metadata);
        }

        // Analyze class members for inputs, outputs, dependencies, and methods
        node.members.forEach(member => {
          if (ts.isPropertyDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
            analyzeProperty(member, metadata);
          } else if (ts.isMethodDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
            analyzeMethod(member, metadata);
          }
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return metadata.className ? metadata : null;
}

function analyzeProperty(property: ts.PropertyDeclaration, metadata: DirectiveMetadata) {
  const propertyName = (property.name as ts.Identifier).text;

  // Check if it's an input
  const inputCall = findCallExpression(property, 'input');
  if (inputCall) {
    const input = analyzeInput(propertyName, inputCall, property);
    metadata.inputs.push(input);
    return;
  }

  // Check if it's an output
  const outputCall = findCallExpression(property, 'output');
  if (outputCall) {
    const output = analyzeOutput(propertyName, outputCall, property);
    metadata.outputs.push(output);
    return;
  }

  // Check if it's a model
  const modelCall = findCallExpression(property, 'model');
  if (modelCall) {
    const model = analyzeModel(propertyName, modelCall, property);
    metadata.models.push(model);
    return;
  }

  // Check if it's a dependency (inject call or other initializer)
  if (property.initializer && !inputCall && !outputCall && !modelCall) {
    const dependency = analyzeDependency(propertyName, property);
    if (dependency) {
      metadata.dependencies.push(dependency);
      return;
    }
  }
}

function findCallExpression(
  property: ts.PropertyDeclaration,
  functionName: string,
): ts.CallExpression | null {
  if (property.initializer && ts.isCallExpression(property.initializer)) {
    const expression = property.initializer.expression;
    if (ts.isIdentifier(expression) && expression.text === functionName) {
      return property.initializer;
    }
  }
  return null;
}

function analyzeInput(
  propertyName: string,
  inputCall: ts.CallExpression,
  property: ts.PropertyDeclaration,
): DirectiveInput {
  const input: DirectiveInput = {
    name: propertyName,
    type: extractType(property),
    required: false,
    description: extractJSDocComment(property),
  };

  // Analyze input arguments
  const args = inputCall.arguments;

  // First argument is default value (if present)
  if (args.length > 0) {
    input.defaultValue = getArgumentText(args[0]);
  }

  // Second argument is options object
  if (args.length > 1 && ts.isObjectLiteralExpression(args[1])) {
    const options = args[1];
    options.properties.forEach(prop => {
      if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
        const propName = prop.name.text;
        const value = prop.initializer;

        switch (propName) {
          case 'alias':
            if (ts.isStringLiteral(value)) {
              input.alias = value.text;
            }
            break;
          case 'transform':
            input.transform = getArgumentText(value);
            break;
        }
      }
    });
  }

  // Check if required (no default value)
  input.required = input.defaultValue === undefined;

  return input;
}

function analyzeOutput(
  propertyName: string,
  outputCall: ts.CallExpression,
  property: ts.PropertyDeclaration,
): DirectiveOutput {
  const output: DirectiveOutput = {
    name: propertyName,
    type: extractType(property),
  };

  // Analyze output arguments (options object)
  if (outputCall.arguments.length > 0 && ts.isObjectLiteralExpression(outputCall.arguments[0])) {
    const options = outputCall.arguments[0];
    options.properties.forEach(prop => {
      if (
        ts.isPropertyAssignment(prop) &&
        ts.isIdentifier(prop.name) &&
        prop.name.text === 'alias'
      ) {
        if (ts.isStringLiteral(prop.initializer)) {
          output.alias = prop.initializer.text;
        }
      }
    });
  }

  return output;
}

function analyzeModel(
  propertyName: string,
  modelCall: ts.CallExpression,
  property: ts.PropertyDeclaration,
): DirectiveModel {
  const model: DirectiveModel = {
    name: propertyName,
    type: extractType(property),
  };

  // Analyze model arguments (options object)
  if (modelCall.arguments.length > 0 && ts.isObjectLiteralExpression(modelCall.arguments[0])) {
    const options = modelCall.arguments[0];
    options.properties.forEach(prop => {
      if (
        ts.isPropertyAssignment(prop) &&
        ts.isIdentifier(prop.name) &&
        prop.name.text === 'alias'
      ) {
        if (ts.isStringLiteral(prop.initializer)) {
          model.alias = prop.initializer.text;
        }
      }
    });
  }

  return model;
}

function analyzeDependency(
  propertyName: string,
  property: ts.PropertyDeclaration,
): DirectiveDependency | null {
  if (!property.initializer) {
    return null;
  }

  // Skip the 'state' property as it's the state instantiation itself
  if (propertyName === 'state') {
    return null;
  }

  // Get the full initializer code
  const initializerCode = unescapeHtml(property.initializer.getText());

  // Extract type from property declaration or try to infer
  let type = 'unknown';
  if (property.type) {
    type = unescapeHtml(property.type.getText());
  } else {
    // Try to infer type from initializer
    if (ts.isCallExpression(property.initializer)) {
      const expression = property.initializer.expression;
      if (ts.isIdentifier(expression)) {
        // For inject calls, try to extract the type from the call
        const functionName = expression.text;
        if (functionName.startsWith('inject') && property.initializer.typeArguments) {
          type = unescapeHtml(property.initializer.typeArguments[0].getText());
        } else {
          // Use the function name as a hint for the type
          type = `ReturnType<typeof ${functionName}>`;
        }
      }
    }
  }

  // Determine if it's private
  const isPrivate = property.modifiers?.some(mod => mod.kind === ts.SyntaxKind.PrivateKeyword) ?? false;

  return {
    name: propertyName,
    type,
    initializerCode,
    isPrivate,
  };
}

function analyzeMethod(method: ts.MethodDeclaration, metadata: DirectiveMetadata): void {
  if (!method.name || !ts.isIdentifier(method.name)) {
    return;
  }

  const methodName = method.name.text;

  // Check for @HostListener decorator
  const decorators = ts.canHaveDecorators(method) ? ts.getDecorators(method) : undefined;
  const hostListenerDecorator = decorators?.find(decorator => {
    if (
      ts.isCallExpression(decorator.expression) &&
      ts.isIdentifier(decorator.expression.expression)
    ) {
      return decorator.expression.expression.text === 'HostListener';
    }
    return false;
  });

  if (hostListenerDecorator && ts.isCallExpression(hostListenerDecorator.expression)) {
    const hostListener = analyzeHostListener(methodName, hostListenerDecorator.expression);
    if (hostListener) {
      metadata.hostListeners.push(hostListener);
    }
  }

  // Skip constructor and lifecycle methods
  if (methodName === 'constructor' || methodName.startsWith('ng')) {
    return;
  }

  // Extract parameters
  const parameters = method.parameters.map(param => ({
    name: (param.name as ts.Identifier).text,
    type: param.type ? unescapeHtml(param.type.getText()) : 'any',
  }));

  // Extract return type
  let returnType = 'void';
  if (method.type) {
    returnType = unescapeHtml(method.type.getText());
  }

  // Extract method body
  let body = '';
  if (method.body) {
    body = unescapeHtml(method.body.getText());
  }

  // Determine if it's public
  const isPublic = method.modifiers
    ? !method.modifiers.some(mod =>
        mod.kind === ts.SyntaxKind.PrivateKeyword ||
        mod.kind === ts.SyntaxKind.ProtectedKeyword
      )
    : true;

  // Extract JSDoc comment
  const jsDoc = extractJSDocComment(method);

  metadata.methods.push({
    name: methodName,
    parameters,
    returnType,
    body,
    isPublic,
    jsDoc,
  });
}

function analyzeDirectiveHostBindings(
  directiveCall: ts.CallExpression,
  metadata: DirectiveMetadata,
): void {
  // Look for the first argument which is the options object
  if (directiveCall.arguments.length === 0) {
    return;
  }

  const optionsArg = directiveCall.arguments[0];
  if (!ts.isObjectLiteralExpression(optionsArg)) {
    return;
  }

  // Find the 'host' property
  const hostProperty = optionsArg.properties.find(prop => {
    if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
      return prop.name.text === 'host';
    }
    return false;
  });

  if (!hostProperty || !ts.isPropertyAssignment(hostProperty)) {
    return;
  }

  if (!ts.isObjectLiteralExpression(hostProperty.initializer)) {
    return;
  }

  // Parse each host binding
  hostProperty.initializer.properties.forEach(prop => {
    if (ts.isPropertyAssignment(prop)) {
      let attributeName = '';

      if (ts.isStringLiteral(prop.name)) {
        attributeName = prop.name.text;
      } else if (ts.isComputedPropertyName(prop.name)) {
        attributeName = unescapeHtml(prop.name.expression.getText());
      } else if (ts.isIdentifier(prop.name)) {
        attributeName = prop.name.text;
      }

      let expression = unescapeHtml(prop.initializer.getText());

      // Remove outer quotes if they exist (TypeScript includes quotes for string literals)
      if ((expression.startsWith("'") && expression.endsWith("'")) ||
          (expression.startsWith('"') && expression.endsWith('"'))) {
        expression = expression.slice(1, -1);
      }

      // Determine binding type based on attribute name
      let type: 'attr' | 'data' | 'style' | 'class' = 'attr';

      if (attributeName.startsWith('[attr.')) {
        type = 'attr';
        attributeName = attributeName.replace('[attr.', '').replace(']', '');
      } else if (attributeName.startsWith('[attr.data-') || attributeName.includes('data-')) {
        type = 'data';
        attributeName = attributeName.replace('[attr.', '').replace(']', '');
      } else if (attributeName.startsWith('[style.')) {
        type = 'style';
        attributeName = attributeName.replace('[style.', '').replace(']', '');
      } else if (attributeName.startsWith('[class.')) {
        type = 'class';
        attributeName = attributeName.replace('[class.', '').replace(']', '');
      }

      metadata.hostBindings.push({
        attribute: attributeName,
        expression,
        type,
      });
    }
  });
}

function analyzeHostListener(
  methodName: string,
  hostListenerCall: ts.CallExpression,
): DirectiveHostListener | null {
  const args = hostListenerCall.arguments;
  if (args.length === 0) {
    return null;
  }

  // First argument is the event name
  let event = '';
  if (ts.isStringLiteral(args[0])) {
    event = args[0].text;
  }

  // Second argument is optional parameters array
  let parameters: string[] = [];
  if (args.length > 1 && ts.isArrayLiteralExpression(args[1])) {
    parameters = args[1].elements.map(element => {
      if (ts.isStringLiteral(element)) {
        return element.text;
      }
      return unescapeHtml(element.getText());
    });
  }

  return {
    event,
    method: methodName,
    parameters,
  };
}

function extractType(property: ts.PropertyDeclaration): string {
  if (property.type) {
    return unescapeHtml(property.type.getText());
  }

  // Try to infer from initializer
  if (property.initializer && ts.isCallExpression(property.initializer)) {
    const typeArgs = property.initializer.typeArguments;
    if (typeArgs && typeArgs.length > 0) {
      return unescapeHtml(typeArgs[0].getText());
    }
  }

  return 'any';
}

function getArgumentText(arg: ts.Expression): string {
  return unescapeHtml(arg.getText());
}

function unescapeHtml(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractJSDocComment(node: ts.Node): string | undefined {
  const sourceFile = node.getSourceFile();
  const fullText = sourceFile.getFullText();

  // Get the leading trivia (comments) for this node
  const ranges = ts.getLeadingCommentRanges(fullText, node.getFullStart());

  if (!ranges || ranges.length === 0) {
    return undefined;
  }

  // Get the last comment (closest to the node)
  const lastComment = ranges[ranges.length - 1];
  const commentText = fullText.substring(lastComment.pos, lastComment.end);

  // Check if it's a JSDoc comment (starts with /**)
  if (lastComment.kind === ts.SyntaxKind.MultiLineCommentTrivia && commentText.startsWith('/**')) {
    // Extract the actual comment content
    const lines = commentText
      .split('\n')
      .map(line => line.trim())
      .slice(1, -1) // Remove /** and */
      .map(line => line.replace(/^\*\s?/, '')) // Remove leading * and space
      .filter(line => line.length > 0); // Remove empty lines

    return lines.join(' ').trim();
  }

  return undefined;
}

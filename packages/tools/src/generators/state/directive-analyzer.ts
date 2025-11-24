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

export interface DirectiveMetadata {
  inputs: DirectiveInput[];
  outputs: DirectiveOutput[];
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

  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const metadata: DirectiveMetadata = {
    inputs: [],
    outputs: [],
    className: '',
    genericParameters: [],
  };

  function visit(node: ts.Node) {
    // Find the class with @Directive decorator
    if (ts.isClassDeclaration(node)) {
      const decorators = ts.canHaveDecorators(node) ? ts.getDecorators(node) : undefined;
      const hasDirectiveDecorator = decorators?.some((decorator: ts.Decorator) => {
        if (ts.isCallExpression(decorator.expression) && ts.isIdentifier(decorator.expression.expression)) {
          return decorator.expression.expression.text === 'Directive';
        }
        return false;
      }) || false;

      if (hasDirectiveDecorator && node.name) {
        metadata.className = node.name.text;

        // Analyze class properties for inputs and outputs
        node.members.forEach(member => {
          if (ts.isPropertyDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
            analyzeProperty(member, metadata);
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
}

function findCallExpression(property: ts.PropertyDeclaration, functionName: string): ts.CallExpression | null {
  if (property.initializer && ts.isCallExpression(property.initializer)) {
    const expression = property.initializer.expression;
    if (ts.isIdentifier(expression) && expression.text === functionName) {
      return property.initializer;
    }
  }
  return null;
}

function analyzeInput(propertyName: string, inputCall: ts.CallExpression, property: ts.PropertyDeclaration): DirectiveInput {
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

function analyzeOutput(propertyName: string, outputCall: ts.CallExpression, property: ts.PropertyDeclaration): DirectiveOutput {
  const output: DirectiveOutput = {
    name: propertyName,
    type: extractType(property),
  };

  // Analyze output arguments (options object)
  if (outputCall.arguments.length > 0 && ts.isObjectLiteralExpression(outputCall.arguments[0])) {
    const options = outputCall.arguments[0];
    options.properties.forEach(prop => {
      if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === 'alias') {
        if (ts.isStringLiteral(prop.initializer)) {
          output.alias = prop.initializer.text;
        }
      }
    });
  }

  return output;
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
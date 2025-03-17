export interface DocumentationGeneratorSchema {
  name: string;
  description: string;
  primitive: string;
  section: 'Getting Started' | 'Primitives' | 'Interactions' | 'Utilities';
  example?: boolean;
  globalConfig?: boolean;
  reusableComponent?: boolean;
}

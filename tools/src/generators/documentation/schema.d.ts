export interface DocumentationGeneratorSchema {
  name: string;
  description: string;
  primitive: string;
  section: 'Getting Started' | 'Primitives' | 'Interactions';
  example?: boolean;
  globalConfig?: boolean;
}

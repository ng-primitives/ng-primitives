export interface DirectiveGeneratorSchema {
  name: string;
  primitive: string;
  addToken: boolean;
  addConfig: boolean;
  documentation?: 'Getting Started' | 'Primitives' | 'Interactions' | 'Utilities';
  addExample: boolean;
  reusableComponent?: boolean;
}

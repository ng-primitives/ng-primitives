export interface DirectiveGeneratorSchema {
  name: string;
  primitive: string;
  addState: boolean;
  addToken: boolean;
  addConfig: boolean;
  documentation?: 'Getting Started' | 'Primitives' | 'Interactions' | 'Utilities';
  addExample: boolean;
  reusableComponent?: boolean;
}

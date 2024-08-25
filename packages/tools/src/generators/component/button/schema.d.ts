export interface ButtonGeneratorSchema {
  name: string;
  prefix: 'css' | 'scss';
  directory: string;
  style: string;
  inlineStyle: boolean;
  inlineTemplate: boolean;
}

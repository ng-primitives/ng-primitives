export interface ButtonGeneratorSchema {
  name: string;
  prefix: string;
  directory: string;
  style: 'css' | 'scss';
  inlineStyle: boolean;
  inlineTemplate: boolean;
}

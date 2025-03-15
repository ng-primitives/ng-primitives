export interface AngularPrimitivesComponentSchema {
  /** The name of the primitive to generate. */
  primitive: 'accordion' | 'button' | 'input';

  /**
   * The path where the component files should be created, relative to the current workspace.
   */
  path: string;

  /**
   * A prefix to be added to the component's selector.
   * For example, if the prefix is `app` and the component name is `button`,
   * the selector will be `app-button`.
   */
  prefix?: string;

  /**
   * Append the specified suffix to the component name.
   * If the component name is `Button` and the suffix is `Component`,
   * the generated component will be named `ButtonComponent`.
   *
   * @default "Component"
   */
  componentSuffix?: string;

  /**
   * Generate component template files with an '.ng.html' file extension instead of '.html'.
   * The '.ng.html' file extension is recommended by the Angular style guide.
   *
   * @default "ng"
   */
  fileSuffix?: string;
}

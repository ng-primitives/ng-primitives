export interface AngularPrimitivesComponentSchema {
  /** The name of the primitive to generate. */
  primitive:
    | 'accordion'
    | 'avatar'
    | 'button'
    | 'checkbox'
    | 'date-picker'
    | 'form-field'
    | 'input'
    | 'slider'
    | 'pagination'
    | 'progress'
    | 'radio'
    | 'switch'
    | 'toggle'
    | 'toggle-group'
    | 'tabs'
    | 'listbox'
    | 'separator'
    | 'textarea'
    | 'dialog'
    | 'file-upload'
    | 'search'
    | 'toast'
    | 'toolbar'
    | 'tooltip'
    | 'meter'
    | 'menu'
    | 'popover'
    | 'combobox'
    | 'select'
    | 'native-select'
    | 'input-otp';

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
   * Generate component file with specified suffix.
   * If the component name is `Button` and the suffix is `component`,
   * the generated component file will be named `button.component.ts`.
   */
  fileSuffix?: string;

  /**
   * Whether example styles should be included.
   */
  exampleStyles?: boolean;
}

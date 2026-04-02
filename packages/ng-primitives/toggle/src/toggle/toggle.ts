import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { ngpToggle, provideToggleState } from './toggle-state';

/**
 * Apply the `ngpToggle` directive to an element to manage the toggle state. This must be applied to a `button` element.
 */
@Directive({
  selector: '[ngpToggle]',
  exportAs: 'ngpToggle',
  providers: [provideToggleState({ inherit: false })],
})
export class NgpToggle {
  /**
   * Whether the toggle is selected.
   */
  readonly selected = input<boolean | undefined, BooleanInput>(undefined, {
    alias: 'ngpToggleSelected',
    transform: booleanAttribute,
  });

  /**
   * The default selected state for uncontrolled usage.
   * @default false
   */
  readonly defaultSelected = input<boolean, BooleanInput>(false, {
    alias: 'ngpToggleDefaultSelected',
    transform: booleanAttribute,
  });

  /**
   * Emits when the selected state changes.
   */
  readonly selectedChange = output<boolean>({
    alias: 'ngpToggleSelectedChange',
  });

  /**
   * Whether the toggle is disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpToggleDisabled',
    transform: booleanAttribute,
  });

  /**
   * The state for the toggle primitive.
   * @internal
   */
  protected readonly state = ngpToggle({
    selected: this.selected,
    defaultSelected: this.defaultSelected,
    disabled: this.disabled,
    onSelectedChange: value => this.selectedChange.emit(value),
  });

  /**
   * Toggle the selected state.
   */
  toggle(): void {
    this.state.toggle();
  }

  /**
   * Set the selected state.
   */
  setSelected(value: boolean): void {
    this.state.setSelected(value);
  }

  /*
   * Set the disabled state.
   */
  setDisabled(value: boolean): void {
    this.state.setDisabled(value);
  }
}

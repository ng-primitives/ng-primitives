import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { provideToggleState, ngpToggle } from './toggle-state';

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
   * @default false
   */
  readonly selected = input<boolean, BooleanInput>(false, {
    alias: 'ngpToggleSelected',
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
    disabled: this.disabled,
    onSelectedChange: value => this.selectedChange.emit(value),
  });

  /**
   * Toggle the selected state.
   */
  toggle(): void {
    this.state.toggle();
  }
}

import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, output } from '@angular/core';
import { ngpTogglePattern, provideTogglePattern } from './toggle-pattern';

/**
 * Apply the `ngpToggle` directive to an element to manage the toggle state. This must be applied to a `button` element.
 */
@Directive({
  selector: '[ngpToggle]',
  exportAs: 'ngpToggle',
  providers: [provideTogglePattern(NgpToggle, instance => instance.pattern)],
})
export class NgpToggle {
  /**
   * An optional id for the toggle.
   */
  readonly id = input<string>('', { alias: 'ngpToggleId' });

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
   * The pattern for the toggle primitive.
   * @internal
   */
  protected readonly pattern = ngpTogglePattern({
    id: this.id,
    selected: this.selected,
    disabled: this.disabled,
    selectedChange: this.selectedChange,
  });
}

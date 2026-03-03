import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, OnDestroy, output } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { injectSelectState } from '../select/select-state';
import { ngpSelectOption } from './select-option-state';

@Directive({
  selector: '[ngpSelectOption]',
  exportAs: 'ngpSelectOption',
})
export class NgpSelectOption implements OnDestroy {
  /** Access the select state. */
  protected readonly selectState = injectSelectState();

  /** The id of the option. */
  readonly id = input<string>(uniqueId('ngp-select-option'));

  /** @required The value of the option. */
  readonly value = input<any>(undefined, {
    alias: 'ngpSelectOptionValue',
  });

  /** The disabled state of the option. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpSelectOptionDisabled',
    transform: booleanAttribute,
  });

  /** The index of the option in the list. */
  readonly index = input<number | undefined>(undefined, {
    alias: 'ngpSelectOptionIndex',
  });

  /**
   * Event emitted when the option is activated via click or keyboard.
   * This is useful for options without values that need custom behavior.
   */
  readonly activated = output<void>({
    alias: 'ngpSelectOptionActivated',
  });

  /** Access the option state. */
  protected readonly optionState = ngpSelectOption({
    id: this.id,
    value: this.value,
    disabled: this.disabled,
    index: this.index,
    onActivated: () => this.activated.emit(),
  });

  constructor() {
    this.selectState().registerOption(this);
  }

  ngOnDestroy(): void {
    this.selectState().unregisterOption(this);
  }

  /**
   * Select the option.
   * @internal
   */
  select(): void {
    this.optionState.select();
  }

  /**
   * Scroll the option into view.
   * @internal
   */
  scrollIntoView(): void {
    this.optionState.scrollIntoView();
  }

  /**
   * Whether this option is the active descendant.
   * @internal
   */
  get active() {
    return this.optionState.active;
  }

  /**
   * Whether this option is selected.
   * @internal
   */
  get selected() {
    return this.optionState.selected;
  }

  /**
   * Get the element reference.
   * @internal
   */
  get elementRef() {
    return this.optionState.elementRef;
  }
}

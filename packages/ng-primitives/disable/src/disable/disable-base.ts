import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, numberAttribute } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { NgpDisableState } from './disable-state';

/**
 * Base class providing disabled state management with optional focusable-when-disabled support.
 *
 * @usageNotes
 * Extend this class to add disabled behavior to any directive:
 * ```ts
 * export class MyDirective extends NgpDisableBase<MyState> {
 *   protected state = inject(MyStateToken);
 * }
 * ```
 */
@Directive()
export abstract class NgpDisableBase<TState extends NgpDisableState> {
  protected readonly elementRef = injectElementRef();

  /**
   * Whether the element is disabled. Applies native `disabled` on buttons/inputs,
   * `aria-disabled` on other elements, and blocks click/keyboard events.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * Keep the element focusable when disabled. Useful for loading states where
   * users should discover and tab away from a disabled control.
   */
  readonly focusableWhenDisabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
    alias: 'focusableWhenDisabled',
  });

  /**
   * Tab index of the element. Adjusted automatically when disabled based on
   * `focusableWhenDisabled` setting.
   */
  readonly tabIndex = input<number, NumberInput>(this.elementRef.nativeElement.tabIndex, {
    transform: value => numberAttribute(value, 0),
  });

  /**
   * Aria-disabled value. Forced to `true` when disabled on non-native elements.
   */
  readonly ariaDisabled = input<boolean, BooleanInput>(
    booleanAttribute(this.elementRef.nativeElement.ariaDisabled),
    { transform: booleanAttribute },
  );

  protected abstract state: TState;

  /** Programmatically set the disabled state. */
  setDisabled(value: boolean): void {
    this.state.setDisabled(value);
  }

  /** Programmatically set whether the element is focusable when disabled. */
  setFocusableWhenDisabled(value: boolean): void {
    this.state.setFocusableWhenDisabled(value);
  }

  /** Programmatically set the tab index. */
  setTabIndex(value: number): void {
    this.state.setTabIndex(value);
  }

  /** Programmatically set the aria-disabled value. */
  setAriaDisabled(value: boolean): void {
    this.state.setAriaDisabled(value);
  }
}

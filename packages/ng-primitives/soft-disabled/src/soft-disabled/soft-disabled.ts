import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, numberAttribute } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { ngpSoftDisabled, provideSoftDisabledState } from './soft-disabled-state';

/**
 * This implementation is inspired by MUI Base UI's useFocusableWhenDisabled hook:
 * https://github.com/mui/base-ui/blob/master/packages/react/src/utils/useFocusableWhenDisabled.ts
 */

/**
 * The `NgpSoftDisabled` directive creates a synthetic disabled state that allows elements
 * to remain focusable while appearing and behaving as disabled. This is particularly useful
 * for accessibility scenarios where disabled elements need to maintain keyboard focus, such as
 * loading states on buttons.
 *
 * Unlike the native `disabled` attribute which removes elements from the tab order and prevents
 * all interaction, soft disabled elements:
 * - Remain in the tab order (when `softDisabledFocusable` is true)
 * - Block click, keydown (except Tab), pointerdown, and mousedown events
 * - Communicate disabled state to assistive technologies via `aria-disabled`
 * - Support styling via `data-soft-disabled` and `data-soft-disabled-focusable` attributes
 *
 * **Important:** Do not use soft disabled and native disabled simultaneously on the same
 * element, as this is not the intended use case and can create undefined behavior.
 */
@Directive({
  selector: '[ngpSoftDisabled]',
  exportAs: 'ngpSoftDisabled',
  providers: [provideSoftDisabledState({ inherit: false })],
})
export class NgpSoftDisabled {
  /**
   * Whether the element is soft disabled. When `true`, the element appears disabled
   * and blocks most interactions while optionally remaining focusable.
   * @default false
   */
  readonly softDisabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * Whether the element should remain focusable when soft disabled.
   * When `true`, the element stays in the tab order but blocks other interactions
   * (clicks, keypresses except Tab). This is useful for loading states where users
   * should be able to tab away but not activate the element.
   * @default true
   */
  readonly focusable = input<boolean, BooleanInput>(true, {
    transform: booleanAttribute,
    alias: 'softDisabledFocusable',
  });

  /**
   * The tab index of the element. Initializes from the element's current `tabIndex` property,
   * which reflects any static `tabindex` attribute or the browser's default for the element type.
   *
   * When soft disabled:
   * - If `focusable` is `true`: negative values are adjusted to `0` to ensure focusability
   * - If `focusable` is `false`: positive values are adjusted to `-1` to remove from tab order
   *
   * The initial value is preserved and restored when the soft disabled state changes,
   * allowing the element to revert to its original tabindex.
   *
   * @default The element's current `tabIndex` property
   */
  readonly tabIndex = input<number, NumberInput>(injectElementRef().nativeElement.tabIndex, {
    transform: value => numberAttribute(value, 0),
  });

  /**
   * The aria-disabled attribute value. Initializes from the element's current
   * `ariaDisabled` property, which reflects any static `aria-disabled` attribute.
   *
   * This value is automatically overridden based on state:
   * - When soft disabled: forced to `true` (sets `aria-disabled="true"`)
   * - When natively disabled: forced to `false` (removes attribute)
   * - Otherwise: uses the provided value (`true` sets attribute, `false` removes it)
   *
   * Note: Following ARIA best practices, `aria-disabled="false"` is never explicitly
   * set; instead, the attribute is removed when the value is `false`.
   *
   * @default The element's current `ariaDisabled` property, or `false` if not set
   */
  readonly ariaDisabled = input<boolean, BooleanInput>(
    booleanAttribute(injectElementRef().nativeElement.ariaDisabled),
    { transform: booleanAttribute },
  );

  /**
   * The internal state manager for soft disabled behavior.
   * @internal
   */
  protected readonly state = ngpSoftDisabled({
    softDisabled: this.softDisabled,
    focusable: this.focusable,
    tabIndex: this.tabIndex,
    ariaDisabled: this.ariaDisabled,
  });

  /**
   * Programmatically set the soft disabled state. This overrides the input binding
   * and persists until changed again or the input is updated.
   * @param value Whether the element should be soft disabled.
   */
  setSoftDisabled(value: boolean): void {
    this.state.setSoftDisabled(value);
  }

  /**
   * Programmatically set whether the element should remain focusable when soft disabled.
   * This overrides the input binding and persists until changed again.
   * @param value Whether the element should be focusable.
   */
  setFocusable(value: boolean): void {
    this.state.setFocusable(value);
  }

  /**
   * Programmatically set the tab index. This overrides both the input binding and
   * the initial attribute value, and persists until changed again.
   * @param value The tab index value.
   */
  setTabIndex(value: number): void {
    this.state.setTabIndex(value);
  }

  /**
   * Programmatically set the aria-disabled value. This overrides both the input
   * binding and the initial attribute value. Note that `true` sets `aria-disabled="true"`,
   * while `false` removes the attribute entirely.
   * @param value The aria-disabled value.
   */
  setAriaDisabled(value: boolean): void {
    this.state.setAriaDisabled(value);
  }
}

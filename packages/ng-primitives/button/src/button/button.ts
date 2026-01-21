import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { ngpButton, provideButtonState } from './button-state';

/**
 * The `NgpButton` directive provides accessible button behavior for any element.
 * It handles disabled states, keyboard interactions, and ARIA roles to ensure
 * buttons work correctly for all users, including those using assistive technologies.
 *
 * Features:
 * - Automatic `role="button"` for non-native elements (divs, spans, etc.)
 * - Keyboard support (Enter/Space) for non-native elements
 * - Proper disabled state handling for both native and non-native elements
 * - Interaction states via `data-hover`, `data-press`, and `data-focus-visible` attributes
 * - Click prevention when disabled
 */
@Directive({
  selector: '[ngpButton]',
  exportAs: 'ngpButton',
  providers: [provideButtonState({ inherit: false })],
})
export class NgpButton {
  /**
   * Whether the button is disabled. When `true`:
   * - Native buttons (`<button>`, `<input type="button">`) get the `disabled` attribute
   * - All elements get `data-disabled` for styling
   * - Click events are blocked
   * - Interaction states (hover, press, focus-visible) are suppressed
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * The ARIA role of the button.
   * If not provided, initializes from the element's current `role` property.
   *
   * Automatic role assignment:
   * - Native buttons (`<button>`, `<input type="button">`): no explicit role (uses implicit)
   * - Anchors with `href`: no explicit role (preserves native link role)
   * - Other elements (`<div>`, `<span>`, etc.): `role="button"`
   *
   * You can override this behavior:
   * - Set to a string (e.g., `"menuitem"`, `"tab"`) to use a custom role
   * - Set to `null` to explicitly remove the role
   * - Set to `undefined` to use automatic role assignment
   *
   * @default Value from the element's current `role` property, or `undefined` for automatic assignment
   */
  readonly role = input<string | null | undefined>(
    injectElementRef().nativeElement.role ?? undefined,
  );

  /**
   * The internal button state manager.
   * @internal
   */
  protected readonly state = ngpButton({
    disabled: this.disabled,
    role: this.role,
  });

  /**
   * Programmatically set the disabled state. This overrides the input binding
   * and persists until changed again or the input is updated.
   * @param value Whether the button should be disabled.
   */
  setDisabled(value: boolean): void {
    this.state.setDisabled(value);
  }

  /**
   * Programmatically set the role. This overrides the input binding and
   * the initial attribute value.
   * @param value The role value. Set to `null` to remove the role attribute,
   * or to `undefined` to use automatic role assignment.
   */
  setRole(value: string | null | undefined): void {
    this.state.setRole(value);
  }
}

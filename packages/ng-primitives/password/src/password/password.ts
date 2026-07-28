import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, input, output, Signal } from '@angular/core';
import { SetterOptions } from 'ng-primitives/state';
import { coerceBooleanOrUndefined } from 'ng-primitives/utils';
import { ngpPassword, providePasswordState } from './password-state';

/**
 * The `NgpPassword` directive is a container for a password field and its visibility toggle.
 */
@Directive({
  selector: '[ngpPassword]',
  exportAs: 'ngpPassword',
  providers: [providePasswordState()],
})
export class NgpPassword {
  /**
   * Whether the password is visible.
   */
  readonly visible = input<boolean | undefined, BooleanInput>(undefined, {
    alias: 'ngpPasswordVisible',
    transform: coerceBooleanOrUndefined,
  });

  /**
   * The default visibility state for uncontrolled usage.
   * @default false
   */
  readonly defaultVisible = input<boolean, BooleanInput>(false, {
    alias: 'ngpPasswordDefaultVisible',
    transform: booleanAttribute,
  });

  /**
   * Emits when the visibility state changes.
   */
  readonly visibleChange = output<boolean>({
    alias: 'ngpPasswordVisibleChange',
  });

  /**
   * The state for the password primitive.
   */
  protected readonly state = ngpPassword({
    visible: this.visible,
    defaultVisible: this.defaultVisible,
    onVisibleChange: value => this.visibleChange.emit(value),
  });

  /**
   * Whether the password is currently visible.
   */
  readonly isVisible: Signal<boolean> = computed(() => this.state.visible());

  /**
   * Toggle the visibility of the password.
   */
  toggle(): void {
    this.state.toggle();
  }

  /**
   * Set the visibility of the password.
   */
  setVisible(value: boolean, options?: SetterOptions): void {
    this.state.setVisible(value, options);
  }
}

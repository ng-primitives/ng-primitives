import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { coerceOffset, NgpOffset, NgpOffsetInput, NgpOverlayContent } from 'ng-primitives/portal';
import { NgpMenuPlacement } from '../menu-trigger/menu-trigger';
import { ngpSubmenuTrigger, provideSubmenuTriggerState } from './submenu-trigger-state';

@Directive({
  selector: '[ngpSubmenuTrigger]',
  exportAs: 'ngpSubmenuTrigger',
  providers: [provideSubmenuTriggerState()],
})
export class NgpSubmenuTrigger<T = unknown> {
  /**
   * Access the submenu template ref.
   */
  readonly menu = input<NgpOverlayContent<T>>(undefined, {
    alias: 'ngpSubmenuTrigger',
  });

  /**
   * Define if the trigger should be disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpSubmenuTriggerDisabled',
    transform: booleanAttribute,
  });

  /**
   * Define the placement of the menu relative to the trigger.
   * @default 'right-start'
   */
  readonly placement = input<NgpMenuPlacement>('right-start', {
    alias: 'ngpSubmenuTriggerPlacement',
  });

  /**
   * Define the offset of the menu relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 0
   */
  readonly offset = input<NgpOffset, NgpOffsetInput>(0, {
    alias: 'ngpSubmenuTriggerOffset',
    transform: coerceOffset,
  });

  /**
   * Define whether the menu should flip when there is not enough space for the menu.
   * @default true
   */
  readonly flip = input<boolean, BooleanInput>(true, {
    alias: 'ngpSubmenuTriggerFlip',
    transform: booleanAttribute,
  });

  /**
   * Access the menu trigger state.
   */
  private readonly state = ngpSubmenuTrigger<T>({
    disabled: this.disabled,
    menu: this.menu,
    placement: this.placement,
    offset: this.offset,
    flip: this.flip,
  });

  /**
   * Show the menu.
   */
  show(): void {
    this.state.show();
  }

  /**
   * Hide the menu.
   */
  hide(origin: FocusOrigin = 'program'): void {
    this.state.hide(origin);
  }

  /**
   * Toggle the menu.
   * @param event - The mouse event
   */
  toggle(event: MouseEvent): void {
    this.state.toggle(event);
  }
}

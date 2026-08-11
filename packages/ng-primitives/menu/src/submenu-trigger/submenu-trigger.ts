import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import {
  coerceFlip,
  coerceOffset,
  NgpFlip,
  NgpFlipInput,
  NgpOffset,
  NgpOffsetInput,
  NgpOverlayContent,
  NgpPlacement,
} from 'ng-primitives/portal';
import { NgpMenuTriggerStateToken } from '../menu-trigger/menu-trigger-state';
import {
  NgpSubmenuTriggerStateToken,
  ngpSubmenuTrigger,
  provideSubmenuTriggerState,
} from './submenu-trigger-state';

@Directive({
  selector: '[ngpSubmenuTrigger]',
  exportAs: 'ngpSubmenuTrigger',
  providers: [
    // inherit: false - a nested submenu trigger lives inside the DI scope of its
    // parent submenu trigger (via the overlay's injector). Inheriting would reuse
    // the parent trigger's state signal and overwrite it with this trigger's
    // state, so the parent's menu would start talking to the wrong trigger.
    provideSubmenuTriggerState({ inherit: false }),
    // Also provide as NgpMenuTriggerStateToken so the submenu's menu-state
    // can find this trigger's openOrigin for :focus-visible styling
    { provide: NgpMenuTriggerStateToken, useExisting: NgpSubmenuTriggerStateToken },
  ],
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
  readonly placement = input<NgpPlacement>('right-start', {
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
   * Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options.
   * @default true
   */
  readonly flip = input<NgpFlip, NgpFlipInput>(true, {
    alias: 'ngpSubmenuTriggerFlip',
    transform: coerceFlip,
  });

  /**
   * Define the container in which the menu should be attached.
   * @default document.body
   */
  readonly container = input<HTMLElement | string | null>(null, {
    alias: 'ngpSubmenuTriggerContainer',
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
    container: this.container,
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

  /**
   * Focus the trigger element.
   * @param origin - The focus origin
   */
  focus(origin: FocusOrigin = 'program'): void {
    this.state.focus(origin);
  }
}

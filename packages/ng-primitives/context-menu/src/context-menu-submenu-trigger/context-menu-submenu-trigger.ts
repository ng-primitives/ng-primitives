import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import {
  NgpMenuTriggerStateToken,
  NgpSubmenuTrigger,
  NgpSubmenuTriggerStateToken,
  ngpSubmenuTrigger,
  provideSubmenuTriggerState,
  type NgpMenuPlacement,
} from 'ng-primitives/menu';
import {
  coerceFlip,
  coerceOffset,
  NgpFlip,
  NgpFlipInput,
  NgpOffset,
  NgpOffsetInput,
  NgpOverlayContent,
} from 'ng-primitives/portal';

/**
 * The `NgpContextMenuSubmenuTrigger` directive turns a context menu item into a submenu trigger.
 */
@Directive({
  selector: '[ngpContextMenuSubmenuTrigger]',
  exportAs: 'ngpContextMenuSubmenuTrigger',
  providers: [
    provideSubmenuTriggerState(),
    { provide: NgpMenuTriggerStateToken, useExisting: NgpSubmenuTriggerStateToken },
    // Provide as NgpSubmenuTrigger so ngpMenuItem can detect this is a submenu trigger
    { provide: NgpSubmenuTrigger, useExisting: NgpContextMenuSubmenuTrigger },
  ],
})
export class NgpContextMenuSubmenuTrigger<T = unknown> {
  /**
   * Access the submenu template ref.
   */
  readonly menu = input<NgpOverlayContent<T>>(undefined, {
    alias: 'ngpContextMenuSubmenuTrigger',
  });

  /**
   * Define if the trigger should be disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpContextMenuSubmenuTriggerDisabled',
    transform: booleanAttribute,
  });

  /**
   * Define the placement of the submenu relative to the trigger.
   * @default 'right-start'
   */
  readonly placement = input<NgpMenuPlacement>('right-start', {
    alias: 'ngpContextMenuSubmenuTriggerPlacement',
  });

  /**
   * Define the offset of the submenu relative to the trigger.
   * @default 0
   */
  readonly offset = input<NgpOffset, NgpOffsetInput>(0, {
    alias: 'ngpContextMenuSubmenuTriggerOffset',
    transform: coerceOffset,
  });

  /**
   * Define whether the submenu should flip when there is not enough space.
   * @default true
   */
  readonly flip = input<NgpFlip, NgpFlipInput>(true, {
    alias: 'ngpContextMenuSubmenuTriggerFlip',
    transform: coerceFlip,
  });

  private readonly state = ngpSubmenuTrigger<T>({
    disabled: this.disabled,
    menu: this.menu,
    placement: this.placement,
    offset: this.offset,
    flip: this.flip,
  });

  show(): void {
    this.state.show();
  }

  hide(origin: FocusOrigin = 'program'): void {
    this.state.hide(origin);
  }

  toggle(event: MouseEvent): void {
    this.state.toggle(event);
  }

  focus(origin: FocusOrigin = 'program'): void {
    this.state.focus(origin);
  }
}

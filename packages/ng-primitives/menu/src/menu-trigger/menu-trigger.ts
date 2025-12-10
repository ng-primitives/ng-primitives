import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { coerceOffset, NgpOffset, NgpOffsetInput, NgpOverlayContent } from 'ng-primitives/portal';
import { injectMenuConfig } from '../config/menu-config';
import { ngpMenuTrigger, provideMenuTriggerState } from './menu-trigger-state';

/**
 * The `NgpMenuTrigger` directive allows you to turn an element into a menu trigger.
 */
@Directive({
  selector: '[ngpMenuTrigger]',
  exportAs: 'ngpMenuTrigger',
  providers: [provideMenuTriggerState()],
})
export class NgpMenuTrigger<T = unknown> {
  /**
   * Access the global menu configuration.
   */
  private readonly config = injectMenuConfig();

  /**
   * Access the menu template ref or ComponentType.
   */
  readonly menu = input<NgpOverlayContent<T>>(undefined, {
    alias: 'ngpMenuTrigger',
  });

  /**
   * Define if the trigger should be disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpMenuTriggerDisabled',
    transform: booleanAttribute,
  });

  /**
   * Define the placement of the menu relative to the trigger.
   * @default 'bottom-start'
   */
  readonly placement = input<NgpMenuPlacement>(this.config.placement, {
    alias: 'ngpMenuTriggerPlacement',
  });

  /**
   * Define the offset of the menu relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 4
   */
  readonly offset = input<NgpOffset, NgpOffsetInput>(this.config.offset, {
    alias: 'ngpMenuTriggerOffset',
    transform: coerceOffset,
  });

  /**
   * Define whether the menu should flip when there is not enough space for the menu.
   * @default true
   */
  readonly flip = input<boolean, BooleanInput>(this.config.flip, {
    alias: 'ngpMenuTriggerFlip',
    transform: booleanAttribute,
  });

  /**
   * Define the container in which the menu should be attached.
   * @default document.body
   */
  readonly container = input<HTMLElement | string | null>(this.config.container, {
    alias: 'ngpMenuTriggerContainer',
  });

  /**
   * Defines how the menu behaves when the window is scrolled.
   * @default 'block'
   */
  readonly scrollBehavior = input<'reposition' | 'block'>(this.config.scrollBehavior, {
    alias: 'ngpMenuTriggerScrollBehavior',
  });

  /**
   * Provide context to the menu. This can be used to pass data to the menu content.
   */
  readonly context = input<T>(undefined, {
    alias: 'ngpMenuTriggerContext',
  });

  /**
   * The menu trigger state.
   */
  private readonly state = ngpMenuTrigger<T>({
    disabled: this.disabled,
    menu: this.menu,
    placement: this.placement,
    offset: this.offset,
    flip: this.flip,
    container: this.container,
    scrollBehavior: this.scrollBehavior,
    context: this.context,
  });

  /**
   * Show the menu.
   */
  show(): void {
    this.state.show();
  }

  /**
   * Hide the menu.
   * @param origin - The focus origin
   * @internal
   */
  hide(origin?: FocusOrigin): void {
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

export type NgpMenuPlacement =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'top-start'
  | 'top-end'
  | 'right-start'
  | 'right-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'left-start'
  | 'left-end';

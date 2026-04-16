import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, Signal } from '@angular/core';
import { provideMenuTriggerState } from 'ng-primitives/menu';
import {
  coerceFlip,
  coerceOffset,
  coerceShift,
  NgpFlip,
  NgpFlipInput,
  NgpOffset,
  NgpOffsetInput,
  NgpOverlayContent,
  NgpShift,
  NgpShiftInput,
} from 'ng-primitives/portal';
import { injectContextMenuConfig } from '../config/context-menu-config';
import {
  ngpContextMenuTrigger,
  provideContextMenuTriggerState,
} from './context-menu-trigger-state';

/**
 * The `NgpContextMenuTrigger` directive allows you to turn an element into a context menu trigger.
 * Right-clicking or long-pressing the element will open the specified menu at the cursor position.
 */
@Directive({
  selector: '[ngpContextMenuTrigger]',
  exportAs: 'ngpContextMenuTrigger',
  providers: [provideContextMenuTriggerState(), provideMenuTriggerState()],
})
export class NgpContextMenuTrigger<T = unknown> {
  /**
   * Access the global context menu configuration.
   */
  private readonly config = injectContextMenuConfig();

  /**
   * The menu template ref or ComponentType to display.
   */
  readonly menu = input<NgpOverlayContent<T>>(undefined, {
    alias: 'ngpContextMenuTrigger',
  });

  /**
   * Define if the trigger should be disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpContextMenuTriggerDisabled',
    transform: booleanAttribute,
  });

  /**
   * Define the offset of the context menu relative to the cursor position.
   * @default 2
   */
  readonly offset = input<NgpOffset, NgpOffsetInput>(this.config.offset, {
    alias: 'ngpContextMenuTriggerOffset',
    transform: coerceOffset,
  });

  /**
   * Define whether the context menu should flip when there is not enough space.
   * @default true
   */
  readonly flip = input<NgpFlip, NgpFlipInput>(this.config.flip, {
    alias: 'ngpContextMenuTriggerFlip',
    transform: coerceFlip,
  });

  /**
   * Configure shift behavior to keep the context menu in view.
   * @default undefined
   */
  readonly shift = input<NgpShift, NgpShiftInput>(this.config.shift, {
    alias: 'ngpContextMenuTriggerShift',
    transform: coerceShift,
  });

  /**
   * Define the container in which the context menu should be attached.
   * @default document.body
   */
  readonly container = input<HTMLElement | string | null>(this.config.container, {
    alias: 'ngpContextMenuTriggerContainer',
  });

  /**
   * Defines how the context menu behaves when the window is scrolled.
   * @default 'close'
   */
  readonly scrollBehavior = input<'reposition' | 'block' | 'close'>(this.config.scrollBehavior, {
    alias: 'ngpContextMenuTriggerScrollBehavior',
  });

  /**
   * Provide context to the menu. This can be used to pass data to the menu content.
   */
  readonly context = input<T>(undefined, {
    alias: 'ngpContextMenuTriggerContext',
  });

  /**
   * The context menu trigger state.
   */
  private readonly state = ngpContextMenuTrigger<T>({
    disabled: this.disabled,
    menu: this.menu,
    offset: this.offset,
    flip: this.flip,
    shift: this.shift(),
    container: this.container,
    scrollBehavior: this.scrollBehavior,
    context: this.context as Signal<T>,
  });
}

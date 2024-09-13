/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, ElementRef, OnInit, computed, inject, isDevMode } from '@angular/core';
import { NgpFocusTrap } from 'ng-primitives/focus-trap';
import { injectPopoverTrigger } from '../popover-trigger/popover-trigger.token';
import { NgpPopoverToken } from './popover.token';

@Directive({
  standalone: true,
  selector: '[ngpPopover]',
  exportAs: 'ngpPopover',
  hostDirectives: [NgpFocusTrap],
  providers: [{ provide: NgpPopoverToken, useExisting: NgpPopover }],
  host: {
    role: 'menu',
    '[style.left.px]': 'x()',
    '[style.top.px]': 'y()',
  },
})
export class NgpPopover implements OnInit {
  /**
   * Access the popover element.
   */
  private readonly popover = inject(ElementRef<HTMLElement>);

  /**
   * Access the trigger instance.
   */
  private readonly trigger = injectPopoverTrigger();

  /**
   * Compute the x position of the popover.
   */
  protected readonly x = computed(() => this.trigger.position().x);

  /**
   * Compute the y position of the popover.
   */
  protected readonly y = computed(() => this.trigger.position().y);

  ngOnInit(): void {
    // if the element does not have a fixed position then throw a warning in dev mode
    if (isDevMode()) {
      const { position } = getComputedStyle(this.popover.nativeElement);

      if (position !== 'absolute') {
        console.warn(
          `The popover element must have an absolute position. The current position is ${position}.`,
        );
      }
    }
  }
}

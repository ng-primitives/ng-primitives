/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InteractivityChecker } from '@angular/cdk/a11y';
import { afterNextRender, computed, Directive, inject, Injector, OnInit } from '@angular/core';
import { NgpFocusTrap } from 'ng-primitives/focus-trap';
import { injectElementRef } from 'ng-primitives/internal';
import { injectPopoverTrigger } from '../popover-trigger/popover-trigger-token';
import { getTransformOrigin } from '../utils/transform-origin';
import { NgpPopoverToken } from './popover-token';

@Directive({
  selector: '[ngpPopover]',
  exportAs: 'ngpPopover',
  hostDirectives: [NgpFocusTrap],
  providers: [{ provide: NgpPopoverToken, useExisting: NgpPopover }],
  host: {
    role: 'menu',
    '[style.left.px]': 'x()',
    '[style.top.px]': 'y()',
    '[style.--ngp-popover-trigger-width.px]': 'trigger.width()',
    '[style.--ngp-popover-transform-origin]': 'transformOrigin()',
    '(keydown.escape)': 'trigger.handleEscapeKey()',
  },
})
export class NgpPopover implements OnInit {
  /**
   * Access the popover element.
   */
  private readonly popover = injectElementRef();

  /**
   * Access the interactivity checker.
   */
  private readonly interactivity = inject(InteractivityChecker);

  /**
   * Access the injector.
   */
  private readonly injector = inject(Injector);

  /**
   * Access the trigger instance.
   */
  protected readonly trigger = injectPopoverTrigger();

  /**
   * Compute the x position of the popover.
   */
  protected readonly x = computed(() => this.trigger.position().x);

  /**
   * Compute the y position of the popover.
   */
  protected readonly y = computed(() => this.trigger.position().y);

  /**
   * Derive the transform origin of the popover.
   */
  protected readonly transformOrigin = computed(() => getTransformOrigin(this.trigger.placement()));

  ngOnInit(): void {
    // once the popover has rendered focus the element
    afterNextRender(
      {
        write: () => {
          // if the popover element is interactive then focus
          if (this.interactivity.isFocusable(this.popover.nativeElement)) {
            this.popover.nativeElement.focus();
          }
        },
      },
      { injector: this.injector },
    );
  }
}

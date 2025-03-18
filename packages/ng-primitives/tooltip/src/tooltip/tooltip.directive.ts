/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  isDevMode,
} from '@angular/core';
import { injectTooltipTrigger } from '../tooltip-trigger/tooltip-trigger.token';
import { NgpTooltipToken } from './tooltip.token';

@Directive({
  selector: '[ngpTooltip]',
  exportAs: 'ngpTooltip',
  providers: [{ provide: NgpTooltipToken, useExisting: NgpTooltip }],
  host: {
    role: 'tooltip',
    '[style.left.px]': 'x()',
    '[style.top.px]': 'y()',
  },
})
export class NgpTooltip implements OnInit {
  /**
   * Access the tooltip element.
   */
  private readonly tooltip = inject(ElementRef<HTMLElement>);

  /**
   * Access the platform.
   */
  private readonly platform = inject(PLATFORM_ID);

  /**
   * Access the trigger instance.
   */
  private readonly trigger = injectTooltipTrigger();

  /**
   * Compute the x position of the tooltip.
   */
  protected readonly x = computed(() => this.trigger.position().x);

  /**
   * Compute the y position of the tooltip.
   */
  protected readonly y = computed(() => this.trigger.position().y);

  ngOnInit(): void {
    // if the element does not have a fixed position then throw a warning in dev mode
    if (isDevMode() && isPlatformBrowser(this.platform)) {
      const { position } = getComputedStyle(this.tooltip.nativeElement);

      if (position !== 'absolute') {
        console.warn(
          `The tooltip element must have an absolute position. The current position is ${position}.`,
        );
      }
    }
  }
}

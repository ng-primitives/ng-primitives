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
import { NgpExitAnimation } from 'ng-primitives/internal';
import { getTransformOrigin } from 'ng-primitives/popover';
import { injectTooltipTriggerState } from '../tooltip-trigger/tooltip-trigger-state';

/**
 * Apply the `ngpTooltip` directive to an element that represents the tooltip. This typically would be a `div` inside an `ng-template`.
 */
@Directive({
  selector: '[ngpTooltip]',
  exportAs: 'ngpTooltip',
  hostDirectives: [NgpExitAnimation],
  host: {
    role: 'tooltip',
    '[style.left.px]': 'x()',
    '[style.top.px]': 'y()',
    '[style.--ngp-tooltip-trigger-width.px]': 'trigger().width()',
    '[style.--ngp-tooltip-transform-origin]': 'transformOrigin()',
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
  private readonly trigger = injectTooltipTriggerState();

  /**
   * Compute the x position of the tooltip.
   */
  protected readonly x = computed(() => this.trigger().position().x);

  /**
   * Compute the y position of the tooltip.
   */
  protected readonly y = computed(() => this.trigger().position().y);

  /**
   * Derive the transform origin of the popover.
   */
  protected readonly transformOrigin = computed(() =>
    getTransformOrigin(this.trigger().placement()),
  );

  ngOnInit(): void {
    // if the element does not have a fixed position then throw a warning in dev mode
    if (isDevMode() && isPlatformBrowser(this.platform)) {
      const { position } = getComputedStyle(this.tooltip.nativeElement);

      if (position !== 'absolute' && position !== 'fixed') {
        console.warn(
          `The tooltip element must have an absolute or fixed position. The current position is ${position}.`,
        );
      }
    }
  }
}

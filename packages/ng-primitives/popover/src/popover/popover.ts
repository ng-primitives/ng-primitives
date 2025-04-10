import { FocusMonitor, FocusOrigin, InteractivityChecker } from '@angular/cdk/a11y';
import { computed, Directive, inject } from '@angular/core';
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
export class NgpPopover {
  /**
   * Access the popover element.
   */
  private readonly popover = injectElementRef();

  /**
   * Access the interactivity checker.
   */
  private readonly interactivity = inject(InteractivityChecker);

  /**
   * Access the focus monitor.
   */
  private readonly focusMonitor = inject(FocusMonitor);

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

  constructor() {
    this.trigger.setPopover(this);
  }

  /**
   * Focus the first tabbable element inside the popover.
   * If no tabbable element is found, focus the popover itself.
   * @internal
   */
  setInitialFocus(origin: FocusOrigin): void {
    // use a tree walker to find the first tabbable child
    const treeWalker = document.createTreeWalker(
      this.popover.nativeElement,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: node =>
          node instanceof HTMLElement && this.interactivity.isTabbable(node)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP,
      },
    );

    const tabbableNode = treeWalker.nextNode() as HTMLElement | null;

    if (tabbableNode) {
      this.focusMonitor.focusVia(tabbableNode, origin);
    } else {
      // if no tabbable child is found, focus the popover element itself
      this.popover.nativeElement.focus();
    }
  }
}

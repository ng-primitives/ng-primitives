import { FocusMonitor, FocusOrigin, InteractivityChecker } from '@angular/cdk/a11y';
import { computed, Directive, inject } from '@angular/core';
import { injectFocusTrapState, NgpFocusTrap } from 'ng-primitives/focus-trap';
import { injectElementRef, NgpExitAnimation } from 'ng-primitives/internal';
import { injectOverlayPosition, injectOverlayTriggerWidth } from 'ng-primitives/portal';
import { injectPopoverTriggerState } from '../popover-trigger/popover-trigger-state';
import { getTransformOrigin } from '../utils/transform-origin';

/**
 * Apply the `ngpPopover` directive to an element that represents the popover. This typically would be a `div` inside an `ng-template`.
 */
@Directive({
  selector: '[ngpPopover]',
  exportAs: 'ngpPopover',
  hostDirectives: [NgpFocusTrap, NgpExitAnimation],
  host: {
    role: 'dialog',
    '[style.left.px]': 'position().x',
    '[style.top.px]': 'position().y',
    '[style.--ngp-popover-trigger-width.px]': 'triggerWidth()',
    '[style.--ngp-popover-transform-origin]': 'transformOrigin()',
    '(keydown.escape)': 'trigger().handleEscapeKey()',
  },
})
export class NgpPopover {
  /**
   * Access the popover element.
   */
  private readonly popover = injectElementRef();

  /**
   * Access the focus trap.
   */
  private readonly focusTrap = injectFocusTrapState();

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
  protected readonly trigger = injectPopoverTriggerState();

  /**
   * Compute the position of the popover.
   */
  protected readonly position = injectOverlayPosition();

  /**
   * Access the trigger width.
   */
  protected readonly triggerWidth = injectOverlayTriggerWidth();

  /**
   * Derive the transform origin of the popover.
   */
  protected readonly transformOrigin = computed(() =>
    getTransformOrigin(this.trigger().placement()),
  );

  constructor() {
    this.trigger().setPopover(this);
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

  /**
   * Disable the focus trap.
   * @internal
   */
  disableFocusTrap(): void {
    this.focusTrap().disabled.set(true);
  }
}

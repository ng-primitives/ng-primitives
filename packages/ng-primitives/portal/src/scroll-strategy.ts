import { getOverflowAncestors } from '@floating-ui/dom';

export interface ScrollStrategy {
  enable(): void;
  disable(): void;
}

/** Saved inline styles for a single element that had its scroll blocked. */
interface BlockedElementState {
  element: Element;
  overflow: string;
  overflowX: string;
  overflowY: string;
  scrollbarGutter: string;
}

/**
 * Blocks scroll on the document and all scrollable ancestor containers of the
 * trigger element. Uses `overflow: hidden` + `scrollbar-gutter: stable` to
 * prevent layout shift when scrollbars disappear.
 */
export class BlockScrollStrategy implements ScrollStrategy {
  private blockedElements: BlockedElementState[] = [];
  private isEnabled = false;

  constructor(
    private readonly document: Document,
    private readonly triggerElement?: HTMLElement,
  ) {}

  enable(): void {
    if (this.isEnabled) {
      return;
    }

    this.isEnabled = true;

    // Always block the document-level scroll (html element)
    const root = this.document.documentElement;
    if (root) {
      this.blockElement(root);
    }

    // Block all scrollable ancestor containers of the trigger
    if (this.triggerElement) {
      const ancestors = getOverflowAncestors(this.triggerElement);
      for (const ancestor of ancestors) {
        // getOverflowAncestors returns Element | Window | VisualViewport
        // We only need to block Element nodes (Window/document scroll is handled by the root block above)
        if (ancestor instanceof Element && ancestor !== root) {
          this.blockElement(ancestor);
        }
      }
    }
  }

  disable(): void {
    if (!this.isEnabled) {
      return;
    }

    this.isEnabled = false;

    // Restore original inline styles for all blocked elements
    for (const state of this.blockedElements) {
      const style = (state.element as HTMLElement).style;
      style.overflow = state.overflow;
      style.overflowX = state.overflowX;
      style.overflowY = state.overflowY;
      style.scrollbarGutter = state.scrollbarGutter;
      state.element.removeAttribute('data-scrollblock');
    }

    this.blockedElements = [];
  }

  private blockElement(element: Element): void {
    const style = (element as HTMLElement).style;

    // Save current inline styles
    this.blockedElements.push({
      element,
      overflow: style.overflow,
      overflowX: style.overflowX,
      overflowY: style.overflowY,
      scrollbarGutter: style.scrollbarGutter,
    });

    // Block scroll and reserve scrollbar space to prevent layout shift
    style.overflow = 'hidden';
    style.scrollbarGutter = 'stable';
    element.setAttribute('data-scrollblock', '');
  }
}

export class CloseScrollStrategy implements ScrollStrategy {
  private cleanups: (() => void)[] = [];

  constructor(
    private readonly triggerElement: HTMLElement,
    private readonly onClose: () => void,
    private readonly overlayElements: () => HTMLElement[],
  ) {}

  enable(): void {
    // Guard against double-enable: remove any existing listeners first
    this.disable();

    const ancestors = getOverflowAncestors(this.triggerElement);

    const handler = (event: Event) => {
      const target = event.target;

      // Don't close if the scroll happened inside the overlay
      if (target instanceof Node) {
        const elements = this.overlayElements();
        if (elements.some(el => el.contains(target))) {
          return;
        }
      }

      // Stop listening immediately to prevent redundant close calls from rapid scroll events
      this.disable();
      this.onClose();
    };

    for (const ancestor of ancestors) {
      ancestor.addEventListener('scroll', handler, { passive: true });
      this.cleanups.push(() => ancestor.removeEventListener('scroll', handler));
    }
  }

  disable(): void {
    for (const cleanup of this.cleanups) {
      cleanup();
    }
    this.cleanups = [];
  }
}

export class NoopScrollStrategy implements ScrollStrategy {
  enable(): void {
    // No operation for enabling
  }

  disable(): void {
    // No operation for disabling
  }
}

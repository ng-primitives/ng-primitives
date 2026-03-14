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

/** Saved state for the document root's position:fixed scroll block (iOS Safari workaround). */
interface RootBlockState {
  top: string;
  left: string;
  position: string;
  overflowY: string;
  width: string;
  scrollTop: number;
  scrollLeft: number;
}

/**
 * Blocks scroll on the document and all scrollable ancestor containers of the
 * trigger element.
 *
 * For the document root (`<html>`), uses `position: fixed` + scroll-position
 * restoration — this is required because `overflow: hidden` on the document
 * root does not block viewport scrolling on iOS Safari.
 *
 * For intermediate ancestor containers, uses `overflow: hidden` +
 * `scrollbar-gutter: stable` to prevent layout shift.
 */
export class BlockScrollStrategy implements ScrollStrategy {
  private blockedElements: BlockedElementState[] = [];
  private rootState: RootBlockState | null = null;
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

    // Block the document-level scroll using position:fixed (iOS Safari workaround)
    // Only block if the page actually has scrollable overflow — otherwise we'd
    // introduce a visible scrollbar on pages that don't need one.
    const root = this.document.documentElement;
    if (root && this.hasScrollableOverflow(root)) {
      this.blockRoot(root);
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

    // Restore the document root
    if (this.rootState) {
      this.unblockRoot();
    }

    // Restore original inline styles for all blocked ancestor elements
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

  /**
   * Block scroll on the document root using position:fixed.
   * This is the standard workaround for iOS Safari where overflow:hidden
   * on the document root does not prevent viewport scrolling.
   */
  private blockRoot(root: HTMLElement): void {
    const style = root.style;
    const scrollTop = window.scrollY || this.document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || this.document.documentElement.scrollLeft;

    // Cache the previous inline styles
    this.rootState = {
      top: style.top || '',
      left: style.left || '',
      position: style.position || '',
      overflowY: style.overflowY || '',
      width: style.width || '',
      scrollTop,
      scrollLeft,
    };

    // Apply position:fixed to block scrolling
    style.position = 'fixed';
    style.width = '100%';
    style.overflowY = 'scroll';
    style.top = `${-scrollTop}px`;
    style.left = `${-scrollLeft}px`;
    root.setAttribute('data-scrollblock', '');
  }

  /**
   * Restore the document root to its original state and restore scroll position.
   */
  private unblockRoot(): void {
    const root = this.document.documentElement;
    const state = this.rootState!;
    const style = root.style;

    style.position = state.position;
    style.top = state.top;
    style.left = state.left;
    style.overflowY = state.overflowY;
    style.width = state.width;
    root.removeAttribute('data-scrollblock');

    // Restore scroll position
    window.scroll(state.scrollLeft, state.scrollTop);

    this.rootState = null;
  }

  /**
   * Check whether an element has scrollable overflow (content exceeds visible area).
   */
  private hasScrollableOverflow(element: Element): boolean {
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
  }

  /**
   * Block scroll on an intermediate ancestor container using overflow:hidden.
   */
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

    // Block scroll
    style.overflow = 'hidden';

    // Only reserve scrollbar gutter space if the element actually has scrollable overflow,
    // to avoid introducing a visible layout shift on platforms with classic scrollbars.
    if (this.hasScrollableOverflow(element)) {
      style.scrollbarGutter = 'stable';
    }

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

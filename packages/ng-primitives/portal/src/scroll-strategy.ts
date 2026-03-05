/**
 * Scroll blocking inspired by react-aria's usePreventScroll.
 * Uses `overflow: hidden` + `scrollbar-gutter: stable` instead of the CDK's
 * `position: fixed` approach, avoiding the need to save/restore scroll position.
 *
 * @see https://github.com/adobe/react-spectrum/blob/main/packages/@react-aria/overlays/src/usePreventScroll.ts
 */
import { getOverflowAncestors } from '@floating-ui/dom';

export interface ScrollStrategy {
  enable(): void;
  disable(): void;
}

interface SavedOverflowState {
  element: HTMLElement;
  overflow: string;
  overflowX: string;
  overflowY: string;
  scrollbarGutter: string;
}

export class BlockScrollStrategy implements ScrollStrategy {
  private isEnabled = false;
  private didBlockDocument = false;
  private previousOverflow = '';
  private previousScrollbarGutter = '';
  private readonly savedAncestorStates: SavedOverflowState[] = [];

  constructor(
    private readonly document: Document,
    private readonly triggerElement?: HTMLElement,
  ) {}

  /** Blocks page-level scroll while the attached overlay is open. */
  enable() {
    const root = this.document.documentElement!;

    // Don't enable if already enabled or if another strategy (ours or CDK's) has blocked scrolling.
    if (
      this.isEnabled ||
      root.hasAttribute('data-scrollblock') ||
      root.classList.contains('cdk-global-scrollblock')
    ) {
      return;
    }

    // Block scrollable ancestors of the trigger element regardless of document scrollability.
    if (this.triggerElement) {
      this.blockScrollableAncestors(this.triggerElement);
    }

    // Block document scroll if the document itself is scrollable.
    if (root.scrollHeight > root.clientHeight || root.scrollWidth > root.clientWidth) {
      this.previousOverflow = root.style.overflow;
      this.previousScrollbarGutter = root.style.scrollbarGutter;

      root.style.overflow = 'hidden';
      root.style.scrollbarGutter = 'stable';
      root.setAttribute('data-scrollblock', '');
      this.didBlockDocument = true;
    }

    // Mark as enabled if we blocked the document or any ancestors.
    if (root.hasAttribute('data-scrollblock') || this.savedAncestorStates.length > 0) {
      this.isEnabled = true;
    }
  }

  /** Unblocks page-level scroll while the attached overlay is open. */
  disable(): void {
    if (this.isEnabled) {
      const root = this.document.documentElement!;

      // Only restore document styles if this instance actually blocked document scrolling.
      if (this.didBlockDocument && root.hasAttribute('data-scrollblock')) {
        root.style.overflow = this.previousOverflow;
        root.style.scrollbarGutter = this.previousScrollbarGutter;
        root.removeAttribute('data-scrollblock');
      }

      this.didBlockDocument = false;

      // Restore scrollable ancestors
      this.restoreScrollableAncestors();
      this.isEnabled = false;
    }
  }

  private blockScrollableAncestors(element: HTMLElement): void {
    const ancestors = getOverflowAncestors(element);

    for (const ancestor of ancestors) {
      // Skip non-HTML elements (Window, VisualViewport) and document-level elements
      // (document scrolling is handled separately above).
      if (
        !(ancestor instanceof HTMLElement) ||
        ancestor === this.document.documentElement ||
        ancestor === this.document.body
      ) {
        continue;
      }

      const hasScrollContent =
        ancestor.scrollHeight > ancestor.clientHeight ||
        ancestor.scrollWidth > ancestor.clientWidth;

      this.savedAncestorStates.push({
        element: ancestor,
        overflow: ancestor.style.overflow,
        overflowX: ancestor.style.overflowX,
        overflowY: ancestor.style.overflowY,
        scrollbarGutter: ancestor.style.scrollbarGutter,
      });

      ancestor.style.overflow = 'hidden';
      if (hasScrollContent) {
        ancestor.style.scrollbarGutter = 'stable';
      }
    }
  }

  private restoreScrollableAncestors(): void {
    for (const state of this.savedAncestorStates) {
      state.element.style.overflow = state.overflow;
      state.element.style.overflowX = state.overflowX;
      state.element.style.overflowY = state.overflowY;
      state.element.style.scrollbarGutter = state.scrollbarGutter;
    }
    this.savedAncestorStates.length = 0;
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

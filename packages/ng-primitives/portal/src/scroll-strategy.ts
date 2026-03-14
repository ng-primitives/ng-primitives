/**
 * Originally based on Angular CDK's scroll strategy.
 * Modified to be fully standalone with no CDK overlay dependency.
 */
import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { getOverflowAncestors } from '@floating-ui/dom';
import { isFunction, isObject } from 'ng-primitives/utils';

export interface ScrollStrategy {
  enable(): void;
  disable(): void;
}

/** Cached result of the check that indicates whether the browser supports scroll behaviors. */
let scrollBehaviorSupported: boolean | undefined;

export function supportsScrollBehavior(): boolean {
  if (scrollBehaviorSupported != null) {
    return scrollBehaviorSupported;
  }

  // If we're not in the browser, it can't be supported. Also check for `Element`, because
  // some projects stub out the global `document` during SSR which can throw us off.
  if (!isObject(document) || !document || !isFunction(Element) || !Element) {
    return (scrollBehaviorSupported = false);
  }

  // If the element can have a `scrollBehavior` style, we can be sure that it's supported.
  if ('scrollBehavior' in document.documentElement!.style) {
    return (scrollBehaviorSupported = true);
  }

  // Check if scrollTo is supported and if it's been polyfilled
  const scrollToFunction = Element.prototype.scrollTo;
  if (!scrollToFunction) {
    return (scrollBehaviorSupported = false);
  }

  // We can detect if the function has been polyfilled by calling `toString` on it. Native
  // functions are obfuscated using `[native code]`, whereas if it was overwritten we'd get
  // the actual function source. Via https://davidwalsh.name/detect-native-function. Consider
  // polyfilled functions as supporting scroll behavior.
  return (scrollBehaviorSupported = !/\{\s*\[native code\]\s*\}/.test(scrollToFunction.toString()));
}

interface HTMLStyles {
  top: string;
  left: string;
  position: string;
  overflowY: string;
  width: string;
}

export class BlockScrollStrategy implements ScrollStrategy {
  private readonly previousHTMLStyles: HTMLStyles = {
    top: '',
    left: '',
    position: '',
    overflowY: '',
    width: '',
  };
  private previousScrollPosition = { top: 0, left: 0 };
  private isEnabled = false;

  constructor(private readonly document: Document) {}

  /** Blocks page-level scroll while the attached overlay is open. */
  enable() {
    if (this.canBeEnabled()) {
      const root = this.document.documentElement!;

      this.previousScrollPosition = { top: window.scrollY ?? 0, left: window.scrollX ?? 0 };

      // Cache the previous inline styles in case the user had set them.
      this.previousHTMLStyles.left = root.style.left || '';
      this.previousHTMLStyles.top = root.style.top || '';
      this.previousHTMLStyles.position = root.style.position || '';
      this.previousHTMLStyles.overflowY = root.style.overflowY || '';
      this.previousHTMLStyles.width = root.style.width || '';

      // Set the styles to block scrolling.
      root.style.position = 'fixed';

      // Necessary for the content not to lose its width. Note that we're using 100%, instead of
      // 100vw, because 100vw includes the width plus the scrollbar, whereas 100% is the width
      // that the element had before we made it `fixed`.
      root.style.width = '100%';

      // Note: this will always add a scrollbar to whatever element it is on, which can
      // potentially result in double scrollbars. It shouldn't be an issue, because we won't
      // block scrolling on a page that doesn't have a scrollbar in the first place.
      root.style.overflowY = 'scroll';

      // Note: we're using the `html` node, instead of the `body`, because the `body` may
      // have the user agent margin, whereas the `html` is guaranteed not to have one.
      root.style.left = coerceCssPixelValue(-this.previousScrollPosition.left);
      root.style.top = coerceCssPixelValue(-this.previousScrollPosition.top);
      root.setAttribute('data-scrollblock', '');
      this.isEnabled = true;
    }
  }

  /** Unblocks page-level scroll while the attached overlay is open. */
  disable(): void {
    if (this.isEnabled) {
      const html = this.document.documentElement!;
      const body = this.document.body!;
      const htmlStyle = html.style;
      const bodyStyle = body.style;
      const previousHtmlScrollBehavior = htmlStyle.scrollBehavior || '';
      const previousBodyScrollBehavior = bodyStyle.scrollBehavior || '';

      this.isEnabled = false;

      htmlStyle.left = this.previousHTMLStyles.left;
      htmlStyle.top = this.previousHTMLStyles.top;
      htmlStyle.position = this.previousHTMLStyles.position;
      htmlStyle.overflowY = this.previousHTMLStyles.overflowY;
      htmlStyle.width = this.previousHTMLStyles.width;
      html.removeAttribute('data-scrollblock');

      // Disable user-defined smooth scrolling temporarily while we restore the scroll position.
      // See https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior
      // Note that we don't mutate the property if the browser doesn't support `scroll-behavior`,
      // because it can throw off feature detections in `supportsScrollBehavior` which
      // checks for `'scrollBehavior' in documentElement.style`.
      if (supportsScrollBehavior()) {
        htmlStyle.scrollBehavior = bodyStyle.scrollBehavior = 'auto';
      }

      window.scroll(this.previousScrollPosition.left, this.previousScrollPosition.top);

      if (supportsScrollBehavior()) {
        htmlStyle.scrollBehavior = previousHtmlScrollBehavior;
        bodyStyle.scrollBehavior = previousBodyScrollBehavior;
      }
    }
  }

  private canBeEnabled(): boolean {
    const html = this.document.documentElement!;

    if (html.hasAttribute('data-scrollblock') || this.isEnabled) {
      return false;
    }

    return (
      html.scrollHeight > html.clientHeight || html.scrollWidth > html.clientWidth
    );
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

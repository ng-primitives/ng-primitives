import { ViewportRuler } from '@angular/cdk/scrolling';
import { BlockScrollStrategy, CloseScrollStrategy } from 'ng-primitives/portal';
import { describe, expect, it, vi } from 'vitest';

describe('CloseScrollStrategy', () => {
  let strategy: CloseScrollStrategy;
  let onClose: ReturnType<typeof vi.fn>;
  let overlayElement: HTMLDivElement;
  let triggerElement: HTMLDivElement;
  let scrollableContainer: HTMLDivElement;

  beforeEach(() => {
    onClose = vi.fn();

    scrollableContainer = document.createElement('div');
    scrollableContainer.style.overflow = 'auto';
    scrollableContainer.style.height = '100px';
    document.body.appendChild(scrollableContainer);

    triggerElement = document.createElement('div');
    scrollableContainer.appendChild(triggerElement);

    overlayElement = document.createElement('div');
    document.body.appendChild(overlayElement);

    strategy = new CloseScrollStrategy(triggerElement, onClose, () => [overlayElement]);
  });

  afterEach(() => {
    strategy.disable();
    overlayElement.remove();
    scrollableContainer.remove();
  });

  it('should call onClose when an ancestor scrolls', () => {
    strategy.enable();
    scrollableContainer.dispatchEvent(new Event('scroll'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose before enable is called', () => {
    scrollableContainer.dispatchEvent(new Event('scroll'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should not call onClose after disable is called', () => {
    strategy.enable();
    strategy.disable();
    scrollableContainer.dispatchEvent(new Event('scroll'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should not call onClose when scroll originates inside the overlay', () => {
    strategy.enable();

    const innerElement = document.createElement('div');
    innerElement.style.overflow = 'auto';
    innerElement.style.height = '50px';
    overlayElement.appendChild(innerElement);

    const scrollEvent = new Event('scroll');
    Object.defineProperty(scrollEvent, 'target', { value: innerElement });
    scrollableContainer.dispatchEvent(scrollEvent);

    expect(onClose).not.toHaveBeenCalled();

    innerElement.remove();
  });

  it('should handle multiple enable/disable cycles', () => {
    strategy.enable();
    strategy.disable();
    strategy.enable();

    scrollableContainer.dispatchEvent(new Event('scroll'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should be safe to call disable multiple times', () => {
    strategy.enable();
    strategy.disable();
    strategy.disable();

    scrollableContainer.dispatchEvent(new Event('scroll'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should self-disable after the first scroll to prevent redundant close calls', () => {
    strategy.enable();

    scrollableContainer.dispatchEvent(new Event('scroll'));
    scrollableContainer.dispatchEvent(new Event('scroll'));
    scrollableContainer.dispatchEvent(new Event('scroll'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not duplicate listeners when enable is called twice', () => {
    strategy.enable();
    strategy.enable();

    scrollableContainer.dispatchEvent(new Event('scroll'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('BlockScrollStrategy', () => {
  let root: HTMLElement;
  let body: HTMLElement;
  let strategy: BlockScrollStrategy | undefined;
  let scroll: ReturnType<typeof vi.spyOn>;

  /**
   * Build a strategy against stand-in `html`/`body` elements so a test can vary the
   * scroll position without scrolling or restyling the real page.
   *
   * `documentRect` is the document element's viewport-relative rect - a page scrolled
   * down 900px puts its top edge at -900.
   */
  function createStrategy(
    rulerScrollPosition: { top: number; left: number },
    documentRect: { top: number; left: number } = {
      top: -rulerScrollPosition.top,
      left: -rulerScrollPosition.left,
    },
  ): BlockScrollStrategy {
    const viewportRuler = {
      getViewportScrollPosition: () => rulerScrollPosition,
      getViewportSize: () => ({ width: 400, height: 600 }),
    } as unknown as ViewportRuler;

    root.getBoundingClientRect = () => new DOMRect(documentRect.left, documentRect.top, 400, 4000);

    const document = {
      documentElement: root,
      body,
    } as unknown as Document;

    return (strategy = new BlockScrollStrategy(viewportRuler, document));
  }

  beforeEach(() => {
    root = window.document.createElement('div');
    // The strategy only blocks scroll on a page that actually overflows.
    Object.defineProperty(root, 'scrollHeight', { value: 4000 });
    Object.defineProperty(root, 'scrollWidth', { value: 400 });

    body = window.document.createElement('div');
    scroll = vi.spyOn(window, 'scroll').mockImplementation(() => undefined);
  });

  afterEach(() => {
    strategy?.disable();
    strategy = undefined;
    scroll.mockRestore();
  });

  it('should offset the page by the document scroll position', () => {
    createStrategy({ top: 900, left: 0 }).enable();

    expect(root.style.position).toBe('fixed');
    expect(root.style.top).toBe('-900px');
    expect(root.style.left).toBe('0px');
  });

  // A pinch-zoomed WebKit page reports the visual viewport pan through `window.scrollX`,
  // which the ruler falls back to. Offsetting by that shifts the whole page - and every
  // `position: fixed` overlay with it - by the pan amount. The document element's rect is
  // layout-viewport-relative, so it stays on the layout scroll.
  // https://github.com/ng-primitives/ng-primitives/issues/758
  it('should ignore the visual viewport pan of a pinch-zoomed page', () => {
    createStrategy(
      // What the ruler reports on WebKit: the layout scroll plus the pan.
      { top: 940, left: 150 },
      // The layout scroll the document rect reports regardless of the pan.
      { top: -900, left: 0 },
    ).enable();

    expect(root.style.top).toBe('-900px');
    expect(root.style.left).toBe('0px');
  });

  it('should restore the layout scroll position on disable', () => {
    const blockScrollStrategy = createStrategy({ top: 940, left: 150 }, { top: -900, left: 0 });

    blockScrollStrategy.enable();
    blockScrollStrategy.disable();

    expect(scroll).toHaveBeenCalledWith(0, 900);
  });

  it('should offset by a horizontal scroll position', () => {
    createStrategy({ top: 500, left: 20 }).enable();

    expect(root.style.top).toBe('-500px');
    expect(root.style.left).toBe('-20px');
  });

  it('should restore the previous inline styles on disable', () => {
    root.style.position = 'relative';
    root.style.overflowY = 'hidden';

    const blockScrollStrategy = createStrategy({ top: 900, left: 0 });

    blockScrollStrategy.enable();
    blockScrollStrategy.disable();

    expect(root.style.position).toBe('relative');
    expect(root.style.overflowY).toBe('hidden');
    expect(root.style.top).toBe('');
    expect(root.hasAttribute('data-scrollblock')).toBe(false);
  });
});

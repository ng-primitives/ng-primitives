import { ViewportRuler } from '@angular/cdk/scrolling';
import { BlockScrollStrategy, CloseScrollStrategy } from 'ng-primitives/portal';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  const html = document.documentElement;
  // a viewport smaller than the page, so the page counts as scrollable
  const viewportRuler = {
    getViewportSize: () => ({ width: 0, height: 0 }),
    getViewportScrollPosition: () => ({ top: 0, left: 0 }),
  } as unknown as ViewportRuler;
  const strategies: BlockScrollStrategy[] = [];
  const initialHtmlStyle = html.style.cssText;

  function createStrategy(doc: Document = document): BlockScrollStrategy {
    const strategy = new BlockScrollStrategy(viewportRuler, doc);
    strategies.push(strategy);
    return strategy;
  }

  afterEach(() => {
    strategies.splice(0).forEach(strategy => strategy.disable());
    html.classList.remove('cdk-global-scrollblock');
    html.style.cssText = initialHtmlStyle;
  });

  it('should block the page scroll until disabled', () => {
    const strategy = createStrategy();

    strategy.enable();
    expect(html.hasAttribute('data-scrollblock')).toBe(true);
    expect(html.style.position).toBe('fixed');

    strategy.disable();
    expect(html.hasAttribute('data-scrollblock')).toBe(false);
    expect(html.style.position).toBe('');
  });

  it('should keep the page blocked while another overlay still blocks it', () => {
    const menu = createStrategy();
    const dialog = createStrategy();

    menu.enable();
    dialog.enable();
    menu.disable();

    expect(html.hasAttribute('data-scrollblock')).toBe(true);
    expect(html.style.position).toBe('fixed');

    dialog.disable();
    expect(html.hasAttribute('data-scrollblock')).toBe(false);
  });

  it('should restore the inline styles from before the first block', () => {
    Object.assign(html.style, {
      left: '1px',
      top: '5px',
      position: 'relative',
      overflowY: 'auto',
      width: '90%',
    });
    const menu = createStrategy();
    const dialog = createStrategy();

    menu.enable();
    dialog.enable();
    menu.disable();
    dialog.disable();

    expect(html.style).toMatchObject({
      left: '1px',
      top: '5px',
      position: 'relative',
      overflowY: 'auto',
      width: '90%',
    });
  });

  it('should restore the scroll position of its own document', () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);

    try {
      const frameWindow = iframe.contentWindow!;
      const frameScroll = vi.spyOn(frameWindow, 'scroll');
      const pageScroll = vi.spyOn(window, 'scroll');
      const strategy = createStrategy(frameWindow.document);

      strategy.enable();
      strategy.disable();

      expect(frameScroll).toHaveBeenCalled();
      expect(pageScroll).not.toHaveBeenCalled();
    } finally {
      vi.restoreAllMocks();
      iframe.remove();
    }
  });

  it('should not release the block of another overlay when disabled twice', () => {
    const menu = createStrategy();
    const dialog = createStrategy();

    menu.enable();
    dialog.enable();
    dialog.disable();
    dialog.disable();

    expect(html.hasAttribute('data-scrollblock')).toBe(true);

    menu.disable();
    expect(html.hasAttribute('data-scrollblock')).toBe(false);
  });

  it('should leave a block it did not set alone', () => {
    html.classList.add('cdk-global-scrollblock');
    const strategy = createStrategy();

    strategy.enable();
    expect(html.hasAttribute('data-scrollblock')).toBe(false);

    strategy.disable();
    expect(html.classList.contains('cdk-global-scrollblock')).toBe(true);
  });
});

import { BlockScrollStrategy, CloseScrollStrategy } from './scroll-strategy';

describe('BlockScrollStrategy', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.documentElement;
    root.style.cssText = '';
    root.removeAttribute('data-scrollblock');

    // Make the document scrollable
    Object.defineProperty(root, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(root, 'scrollWidth', { value: 1024, configurable: true });
    Object.defineProperty(root, 'clientHeight', { value: 768, configurable: true });
    Object.defineProperty(root, 'clientWidth', { value: 1024, configurable: true });
  });

  afterEach(() => {
    root.style.cssText = '';
    root.removeAttribute('data-scrollblock');
  });

  describe('document-level blocking', () => {
    it('should block scrolling on the document when enabled', () => {
      const strategy = new BlockScrollStrategy(document);
      strategy.enable();

      expect(root.style.overflow).toBe('hidden');
      expect(root.style.scrollbarGutter).toBe('stable');
      expect(root.hasAttribute('data-scrollblock')).toBe(true);

      strategy.disable();
    });

    it('should restore original styles when disabled', () => {
      root.style.overflow = 'visible';
      root.style.scrollbarGutter = '';

      const strategy = new BlockScrollStrategy(document);
      strategy.enable();
      strategy.disable();

      expect(root.style.overflow).toBe('visible');
      expect(root.style.scrollbarGutter).toBe('');
      expect(root.hasAttribute('data-scrollblock')).toBe(false);
    });

    it('should not enable if already has data-scrollblock', () => {
      root.setAttribute('data-scrollblock', '');

      const strategy = new BlockScrollStrategy(document);
      strategy.enable();
      strategy.disable();

      // Should still have the attribute since we didn't set didBlockDocument
      expect(root.hasAttribute('data-scrollblock')).toBe(true);
    });

    it('should not block when the document is not scrollable', () => {
      Object.defineProperty(root, 'scrollHeight', { value: 768, configurable: true });
      Object.defineProperty(root, 'scrollWidth', { value: 1024, configurable: true });

      const strategy = new BlockScrollStrategy(document);
      strategy.enable();

      expect(root.style.overflow).not.toBe('hidden');
      expect(root.hasAttribute('data-scrollblock')).toBe(false);

      strategy.disable();
    });
  });

  describe('scrollable ancestor blocking', () => {
    let scrollableContainer: HTMLDivElement;
    let triggerElement: HTMLButtonElement;

    beforeEach(() => {
      scrollableContainer = document.createElement('div');
      scrollableContainer.style.overflow = 'auto';
      scrollableContainer.style.height = '200px';
      Object.defineProperty(scrollableContainer, 'scrollHeight', {
        value: 500,
        configurable: true,
      });
      Object.defineProperty(scrollableContainer, 'clientHeight', {
        value: 200,
        configurable: true,
      });

      triggerElement = document.createElement('button');
      triggerElement.textContent = 'Trigger';

      scrollableContainer.appendChild(triggerElement);
      document.body.appendChild(scrollableContainer);
    });

    afterEach(() => {
      scrollableContainer.remove();
    });

    it('should block scroll on the scrollable ancestor when a trigger element is provided', () => {
      const strategy = new BlockScrollStrategy(document, triggerElement);
      strategy.enable();

      expect(scrollableContainer.style.overflow).toBe('hidden');

      strategy.disable();
    });

    it('should restore original overflow styles on the scrollable ancestor when disabled', () => {
      scrollableContainer.style.overflow = 'auto';
      scrollableContainer.style.overflowX = '';
      scrollableContainer.style.overflowY = '';

      const strategy = new BlockScrollStrategy(document, triggerElement);
      strategy.enable();

      expect(scrollableContainer.style.overflow).toBe('hidden');

      strategy.disable();

      expect(scrollableContainer.style.overflow).toBe('auto');
    });

    it('should set scrollbarGutter to stable when the ancestor has scroll content', () => {
      const strategy = new BlockScrollStrategy(document, triggerElement);
      strategy.enable();

      expect(scrollableContainer.style.scrollbarGutter).toBe('stable');

      strategy.disable();

      expect(scrollableContainer.style.scrollbarGutter).toBe('');
    });

    it('should not set scrollbarGutter if ancestor has overflow auto but no scroll content', () => {
      Object.defineProperty(scrollableContainer, 'scrollHeight', {
        value: 200,
        configurable: true,
      });

      const strategy = new BlockScrollStrategy(document, triggerElement);
      strategy.enable();

      expect(scrollableContainer.style.scrollbarGutter).not.toBe('stable');

      strategy.disable();
    });

    it('should still block the document when a trigger element is provided', () => {
      const strategy = new BlockScrollStrategy(document, triggerElement);
      strategy.enable();

      expect(root.style.overflow).toBe('hidden');
      expect(root.hasAttribute('data-scrollblock')).toBe(true);

      strategy.disable();
    });

    it('should work without a trigger element (backwards compatible)', () => {
      const strategy = new BlockScrollStrategy(document);
      strategy.enable();

      expect(root.style.overflow).toBe('hidden');

      strategy.disable();
    });

    it('should lock and unlock ancestor even when the document is not scrollable', () => {
      Object.defineProperty(root, 'scrollHeight', { value: 768, configurable: true });
      Object.defineProperty(root, 'scrollWidth', { value: 1024, configurable: true });

      const strategy = new BlockScrollStrategy(document, triggerElement);
      strategy.enable();

      // Ancestor should still be locked
      expect(scrollableContainer.style.overflow).toBe('hidden');
      // Document should NOT be blocked
      expect(root.style.overflow).not.toBe('hidden');
      expect(root.hasAttribute('data-scrollblock')).toBe(false);

      strategy.disable();

      // Ancestor should be restored
      expect(scrollableContainer.style.overflow).toBe('auto');
    });
  });
});

describe('CloseScrollStrategy', () => {
  let strategy: CloseScrollStrategy;
  let onClose: jest.Mock;
  let overlayElement: HTMLDivElement;
  let triggerElement: HTMLDivElement;
  let scrollableContainer: HTMLDivElement;

  beforeEach(() => {
    onClose = jest.fn();

    // Create a scrollable container with the trigger inside
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

    // Simulate a scroll event on the inner element that is part of the overlay
    const scrollEvent = new Event('scroll');
    Object.defineProperty(scrollEvent, 'target', { value: innerElement });

    // Dispatch on the scrollable container but with target overridden to overlay inner element
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

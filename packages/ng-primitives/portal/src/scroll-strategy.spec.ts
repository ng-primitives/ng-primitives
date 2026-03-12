import { BlockScrollStrategy, CloseScrollStrategy } from './scroll-strategy';

describe('BlockScrollStrategy', () => {
  let scrollHeightSpy: jest.SpyInstance;

  beforeEach(() => {
    // jsdom has no real layout, so scrollHeight === clientHeight === 0.
    // Mock scrollHeight to simulate scrollable overflow on the document root.
    scrollHeightSpy = jest
      .spyOn(document.documentElement, 'scrollHeight', 'get')
      .mockReturnValue(2000);
  });

  afterEach(() => {
    scrollHeightSpy.mockRestore();

    // Clean up any leftover data-scrollblock attributes
    document.querySelectorAll('[data-scrollblock]').forEach(el => {
      el.removeAttribute('data-scrollblock');
    });

    // Reset document root styles that may leak if an assertion fails mid-test
    const rootStyle = document.documentElement.style;
    rootStyle.position = '';
    rootStyle.top = '';
    rootStyle.left = '';
    rootStyle.width = '';
    rootStyle.overflow = '';
    rootStyle.overflowX = '';
    rootStyle.overflowY = '';
    rootStyle.scrollbarGutter = '';
  });

  it('should block scroll on the document root using position:fixed', () => {
    const strategy = new BlockScrollStrategy(document);
    strategy.enable();

    expect(document.documentElement.style.position).toBe('fixed');
    expect(document.documentElement.style.width).toBe('100%');
    expect(document.documentElement.style.overflowY).toBe('scroll');
    expect(document.documentElement.hasAttribute('data-scrollblock')).toBe(true);

    strategy.disable();

    expect(document.documentElement.hasAttribute('data-scrollblock')).toBe(false);
  });

  it('should not block root when there is no scrollable overflow', () => {
    scrollHeightSpy.mockReturnValue(0);

    const strategy = new BlockScrollStrategy(document);
    strategy.enable();

    expect(document.documentElement.style.position).not.toBe('fixed');
    expect(document.documentElement.hasAttribute('data-scrollblock')).toBe(false);

    strategy.disable();
  });

  it('should restore original inline styles on disable', () => {
    const root = document.documentElement;
    root.style.position = '';
    root.style.overflowY = '';
    root.style.width = '';
    root.style.top = '';
    root.style.left = '';

    const strategy = new BlockScrollStrategy(document);
    strategy.enable();

    expect(root.style.position).toBe('fixed');

    strategy.disable();

    expect(root.style.position).toBe('');
    expect(root.style.overflowY).toBe('');
    expect(root.style.width).toBe('');
    expect(root.style.top).toBe('');
    expect(root.style.left).toBe('');
  });

  it('should block scroll on ancestor scrollable containers with overflow:hidden', () => {
    const scrollableContainer = document.createElement('div');
    scrollableContainer.style.overflow = 'auto';
    scrollableContainer.style.height = '100px';
    document.body.appendChild(scrollableContainer);

    const trigger = document.createElement('div');
    scrollableContainer.appendChild(trigger);

    const strategy = new BlockScrollStrategy(document, trigger);
    strategy.enable();

    expect(scrollableContainer.style.overflow).toBe('hidden');
    expect(scrollableContainer.hasAttribute('data-scrollblock')).toBe(true);

    strategy.disable();

    expect(scrollableContainer.style.overflow).toBe('auto');
    expect(scrollableContainer.hasAttribute('data-scrollblock')).toBe(false);

    scrollableContainer.remove();
  });

  it('should not double-enable', () => {
    const strategy = new BlockScrollStrategy(document);
    strategy.enable();
    strategy.enable();

    expect(document.documentElement.style.position).toBe('fixed');

    strategy.disable();

    expect(document.documentElement.hasAttribute('data-scrollblock')).toBe(false);
  });

  it('should be safe to call disable without enable', () => {
    const strategy = new BlockScrollStrategy(document);
    expect(() => strategy.disable()).not.toThrow();
  });

  it('should handle multiple enable/disable cycles', () => {
    const strategy = new BlockScrollStrategy(document);

    strategy.enable();
    strategy.disable();
    strategy.enable();

    expect(document.documentElement.style.position).toBe('fixed');

    strategy.disable();

    expect(document.documentElement.hasAttribute('data-scrollblock')).toBe(false);
  });

  it('should work without a trigger element (document-only blocking)', () => {
    const strategy = new BlockScrollStrategy(document);
    strategy.enable();

    expect(document.documentElement.style.position).toBe('fixed');

    strategy.disable();
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
    // The ancestors listener won't fire for overlay-internal scrolls since the
    // overlay is not an ancestor of the trigger. This test verifies the filter logic.
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

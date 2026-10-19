import { TestBed } from '@angular/core/testing';
import { waitFor } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onDomRemoval } from '../dom-removal';

describe('onDomRemoval', () => {
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    element = document.createElement('div');
    element.style.width = '120px';
    element.style.height = '40px';
    document.body.appendChild(element);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    element.remove();
  });

  it('should not measure the element when it starts watching it', async () => {
    const getComputedStyle = vi.spyOn(window, 'getComputedStyle');

    TestBed.runInInjectionContext(() => onDomRemoval(element, () => {}));

    // A measurement would be deferred to a microtask, so the spy has to outlive one.
    await Promise.resolve();

    expect(getComputedStyle).not.toHaveBeenCalled();
  });

  it('should call the callback once the element is removed from the DOM', async () => {
    const callback = vi.fn();

    TestBed.runInInjectionContext(() => onDomRemoval(element, callback));

    // Let the observer deliver its first observation while the element is still rendered.
    await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve)));
    expect(callback).not.toHaveBeenCalled();

    element.remove();

    await waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
  });
});

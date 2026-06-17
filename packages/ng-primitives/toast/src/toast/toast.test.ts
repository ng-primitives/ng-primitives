import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NgpToast } from './toast';
import { provideToastOptions } from './toast-options';

// Note: #762 (every `pointermove` while hovering scheduling a change detection
// pass) only manifests in a zone-based app. The fix binds the pointer listeners
// outside the Angular zone via the `listener()` helper. This test harness is
// zoneless, so that symptom cannot be reproduced here; these tests instead lock
// in that the listener-based wiring still drives the swipe behaviour correctly.

@Component({
  template: `
    <div ngpToast data-testid="toast"></div>
  `,
  imports: [NgpToast],
  providers: [
    provideToastOptions({
      placement: 'top-end',
      duration: 3000,
      register: () => {
        /* noop */
      },
      expanded: signal(false),
      dismissible: true,
      swipeDirections: ['left', 'right', 'top', 'bottom'],
      sequential: false,
      // Keep the auto-dismiss timer inert so it never leaves a pending timeout.
      persistent: true,
    }),
  ],
})
class ToastHost {}

let fixture: ComponentFixture<ToastHost> | null = null;

function createToast() {
  fixture = TestBed.createComponent(ToastHost);
  fixture.detectChanges();
  const element = fixture.nativeElement.querySelector('[data-testid="toast"]') as HTMLElement;
  return { fixture, element };
}

describe('NgpToast', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ToastHost] });
  });

  afterEach(() => {
    // The fixtures are created with raw TestBed (not testing-library's auto-cleaning
    // `render`), so destroy them explicitly to tear down the toast's listeners and
    // effects before the next test.
    fixture?.destroy();
    fixture = null;
    vi.restoreAllMocks();
  });

  it('updates the swipe amount while dragging', () => {
    const { fixture, element } = createToast();

    element.setPointerCapture = vi.fn();

    element.dispatchEvent(
      new PointerEvent('pointerdown', { button: 0, clientX: 0, clientY: 0, pointerId: 1 }),
    );
    element.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 40, clientY: 0, pointerId: 1 }),
    );
    fixture.detectChanges();

    expect(element.getAttribute('data-swiping')).toBe('true');
    expect(element.style.getPropertyValue('--ngp-toast-swipe-amount-x')).not.toBe('');
  });

  it('does not respond to pointermove before a pointerdown', () => {
    const { fixture, element } = createToast();

    element.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 40, clientY: 0, pointerId: 1 }),
    );
    fixture.detectChanges();

    expect(element.getAttribute('data-swiping')).toBe('false');
  });
});

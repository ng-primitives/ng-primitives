import { Component, computed, ElementRef, inject, signal } from '@angular/core';
import { render } from '@testing-library/angular';
import { listener } from 'ng-primitives/state';
import { describe, expect, it } from 'vitest';

describe('listener', () => {
  it('should allow the handler to write signals when the event is dispatched during a reactive context', async () => {
    @Component({ selector: 'app-test', template: '' })
    class Test {
      readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
      readonly left = signal(false);

      constructor() {
        listener(this.element, 'mouseleave', () => this.left.set(true));
      }
    }

    const { fixture } = await render(Test);
    const host = fixture.nativeElement as HTMLElement;

    // A browser can dispatch an event synchronously while Angular renders, so the
    // handler must not inherit whichever reactive consumer is active.
    const dispatchWhileReactive = computed(() => {
      host.dispatchEvent(new MouseEvent('mouseleave'));
      return true;
    });

    expect(() => dispatchWhileReactive()).not.toThrow();
    expect(fixture.componentInstance.left()).toBe(true);
  });
});

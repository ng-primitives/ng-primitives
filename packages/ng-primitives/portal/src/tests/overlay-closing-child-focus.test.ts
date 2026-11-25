import {
  Component,
  ElementRef,
  inject,
  Injector,
  Signal,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { afterEach, describe, expect, it } from 'vitest';
import { createOverlay, NgpOverlay, NgpOverlayTemplateContext } from '../overlay';

@Component({
  template: `
    <button #trigger>Trigger</button>

    <ng-template #parentContent>
      <div data-testid="parent">
        <button data-testid="child-trigger">Child trigger</button>
      </div>
    </ng-template>

    <ng-template #childContent>
      <div data-testid="child"><button data-testid="child-item">Item</button></div>
    </ng-template>
  `,
})
class NestedOverlayHost {
  readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  readonly parentContent =
    viewChild.required<TemplateRef<NgpOverlayTemplateContext<unknown>>>('parentContent');
  readonly childContent =
    viewChild.required<TemplateRef<NgpOverlayTemplateContext<unknown>>>('childContent');

  private readonly injector = inject(Injector);
  private readonly viewContainerRef = inject(ViewContainerRef);

  create(
    content: Signal<TemplateRef<NgpOverlayTemplateContext<unknown>>>,
    triggerElement: HTMLElement,
    restoreFocus = true,
  ): NgpOverlay<unknown> {
    return createOverlay<unknown>({
      content,
      triggerElement,
      injector: this.injector,
      viewContainerRef: this.viewContainerRef,
      restoreFocus,
    });
  }
}

/** An exit animation the test ends by calling `finish`. */
function heldAnimation(): { animation: Animation; finish: () => void } {
  let finish!: () => void;
  const finished = new Promise<void>(resolve => (finish = resolve));
  const animation = {
    finished,
    cancel: () => undefined,
    finish: () => finish(),
    effect: { getComputedTiming: () => ({ iterations: 1, endTime: 100_000 }) },
  } as unknown as Animation;
  return { animation, finish };
}

describe('NgpOverlay focus in a nested overlay animating out', () => {
  const overlays: NgpOverlay<unknown>[] = [];

  afterEach(() => {
    overlays.splice(0).forEach(overlay => overlay.destroy());
  });

  it('returns focus to the trigger when the parent closes', async () => {
    const { fixture } = await render(NestedOverlayHost);
    const host = fixture.componentInstance;
    const trigger = host.trigger().nativeElement;
    trigger.focus();

    const parent = host.create(host.parentContent, trigger);
    overlays.push(parent);
    await parent.show();

    // opened from inside the parent, so it closes with it; like a submenu, it leaves focus to
    // the parent
    const child = host.create(host.childContent, screen.getByTestId('child-trigger'), false);
    overlays.push(child);
    await child.show();
    screen.getByTestId('child-item').focus();

    const exit = heldAnimation();
    screen.getByTestId('child').getAnimations = () => [exit.animation];
    child.hide({ immediate: true });

    try {
      await waitFor(() => expect(screen.getByTestId('child')).toHaveAttribute('data-exit'));
      parent.hide({ origin: 'keyboard', immediate: true });
      await waitFor(() => expect(parent.isOpen()).toBe(false));

      expect(document.activeElement).toBe(trigger);
    } finally {
      exit.finish();
      await waitFor(() => expect(screen.queryByTestId('child')).toBeNull());
    }
  });
});

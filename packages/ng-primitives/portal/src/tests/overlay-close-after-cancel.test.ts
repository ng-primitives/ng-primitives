import {
  Component,
  ElementRef,
  inject,
  Injector,
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

    <ng-template #content>
      <div data-testid="content">Content</div>
    </ng-template>
  `,
})
class OverlayHost {
  readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  readonly content = viewChild.required<TemplateRef<NgpOverlayTemplateContext<unknown>>>('content');

  private readonly injector = inject(Injector);
  private readonly viewContainerRef = inject(ViewContainerRef);

  create(): NgpOverlay<unknown> {
    return createOverlay<unknown>({
      content: this.content,
      triggerElement: this.trigger().nativeElement,
      injector: this.injector,
      viewContainerRef: this.viewContainerRef,
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

describe('NgpOverlay closing again after a cancelled close', () => {
  const overlays: NgpOverlay<unknown>[] = [];

  afterEach(() => {
    overlays.splice(0).forEach(overlay => overlay.destroy());
  });

  it('leaves the second close in charge of the view', async () => {
    const { fixture } = await render(OverlayHost);
    const overlay = fixture.componentInstance.create();
    overlays.push(overlay);
    await overlay.show();

    const content = screen.getByTestId('content');
    const firstExit = heldAnimation();
    content.getAnimations = () => [firstExit.animation];
    overlay.hide({ immediate: true });
    await waitFor(() => expect(content).toHaveAttribute('data-exit'));

    // reopened during the exit animation, then closed again before the cancelled close settles
    const secondExit = heldAnimation();
    content.getAnimations = () => [secondExit.animation];
    void overlay.show();
    overlay.hide({ immediate: true });

    try {
      // let the cancelled close settle
      await new Promise(resolve => setTimeout(resolve));

      expect(content).toHaveAttribute('data-exit');
      expect(content.isConnected).toBe(true);

      // still owned by the second close, so reopening brings the same view back
      await overlay.show();
      expect(screen.getByTestId('content')).toBe(content);
      expect(content).not.toHaveAttribute('data-exit');
    } finally {
      firstExit.finish();
      secondExit.finish();
      await new Promise(resolve => setTimeout(resolve));
    }
  });
});

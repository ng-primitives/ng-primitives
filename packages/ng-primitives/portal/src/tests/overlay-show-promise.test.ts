import {
  Component,
  ElementRef,
  inject,
  Injector,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { render } from '@testing-library/angular';
import { afterEach, describe, expect, it } from 'vitest';
import { createOverlay, NgpOverlay } from '../overlay';

@Component({
  template: `
    <button #trigger>Trigger</button>

    <ng-template #content>
      <div ngpOverlayContent>Content</div>
    </ng-template>
  `,
})
class OverlayHost {
  readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  readonly content = viewChild.required<TemplateRef<unknown>>('content');

  private readonly injector = inject(Injector);
  private readonly viewContainerRef = inject(ViewContainerRef);

  create(showDelay: number): NgpOverlay<unknown> {
    return createOverlay<unknown>({
      content: this.content(),
      triggerElement: this.trigger().nativeElement,
      injector: this.injector,
      viewContainerRef: this.viewContainerRef,
      showDelay,
    });
  }
}

/** Resolve to 'hung' if the promise has not settled - a pending promise would otherwise stall the run. */
function settlesWithin(promise: Promise<void>, ms: number): Promise<'settled' | 'hung'> {
  return Promise.race<'settled' | 'hung'>([
    promise.then(() => 'settled' as const),
    new Promise(resolve => setTimeout(() => resolve('hung'), ms)),
  ]);
}

describe('NgpOverlay show()', () => {
  afterEach(() => {
    document.querySelectorAll('[ngpOverlayContent]').forEach(element => element.remove());
  });

  it('settles the caller that scheduled an open when that open is cancelled', async () => {
    const { fixture } = await render(OverlayHost);
    const overlay = fixture.componentInstance.create(100);

    // The resolver for this call used to live only inside the show timer, so cancelling
    // the open before the delay elapsed left it pending forever.
    const showing = overlay.show();
    overlay.hide();

    expect(await settlesWithin(showing, 1000)).toBe('settled');
    expect(overlay.isOpen()).toBe(false);
  });

  it('settles every caller of a cancelled open, not just the ones that joined it', async () => {
    const { fixture } = await render(OverlayHost);
    const overlay = fixture.componentInstance.create(100);

    const first = overlay.show();
    const second = overlay.show();
    overlay.hide();

    expect(
      await settlesWithin(
        Promise.all([first, second]).then(() => undefined),
        1000,
      ),
    ).toBe('settled');
    expect(overlay.isOpen()).toBe(false);
  });

  it('settles every caller once the open completes', async () => {
    const { fixture } = await render(OverlayHost);
    const overlay = fixture.componentInstance.create(0);

    const first = overlay.show();
    const second = overlay.show();

    expect(
      await settlesWithin(
        Promise.all([first, second]).then(() => undefined),
        1000,
      ),
    ).toBe('settled');
    expect(overlay.isOpen()).toBe(true);
  });
});

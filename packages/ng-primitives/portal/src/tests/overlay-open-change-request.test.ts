import {
  Component,
  ElementRef,
  inject,
  Injector,
  signal,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { render, waitFor } from '@testing-library/angular';
import { afterEach, describe, expect, it } from 'vitest';
import { createOverlay, NgpOverlay, NgpOverlayConfig } from '../overlay';

@Component({
  template: `
    <button #trigger>Trigger</button>

    <ng-template #content>
      <div data-testid="overlay">Content</div>
    </ng-template>
  `,
})
class OverlayHost {
  readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  readonly content = viewChild.required<TemplateRef<unknown>>('content');

  private readonly injector = inject(Injector);
  private readonly viewContainerRef = inject(ViewContainerRef);

  create(
    requestOpenChange: (open: boolean) => boolean,
    config: Partial<NgpOverlayConfig<unknown>> = {},
  ): NgpOverlay<unknown> {
    return createOverlay<unknown>({
      content: this.content,
      triggerElement: this.trigger().nativeElement,
      injector: this.injector,
      viewContainerRef: this.viewContainerRef,
      restoreFocus: true,
      requestOpenChange,
      ...config,
    });
  }
}

/** An exit animation that never settles, holding the overlay mid-close. */
function pendingAnimation(): Animation {
  return {
    finished: new Promise<void>(() => undefined),
    cancel: () => undefined,
    finish: () => undefined,
    effect: { getComputedTiming: () => ({ iterations: 1, endTime: 100_000 }) },
  } as unknown as Animation;
}

/** An exit animation the test ends by calling `finish`. */
function controlledAnimation(): { animation: Animation; finish: () => void } {
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

/** A stand-in for a trigger whose open state is bound: it allows only what the binding says. */
function boundOwner(initial: boolean) {
  const owner = {
    open: initial,
    requests: [] as boolean[],
    requestOpenChange: (open: boolean): boolean => {
      owner.requests.push(open);
      return open === owner.open;
    },
  };
  return owner;
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('NgpOverlay requestOpenChange', () => {
  let overlay: NgpOverlay<unknown> | null = null;

  afterEach(() => {
    overlay?.destroy();
    overlay = null;
    document.querySelectorAll('[data-testid="overlay"]').forEach(element => element.remove());
  });

  it('stays closed when the open is declined', async () => {
    const { fixture } = await render(OverlayHost);
    const owner = boundOwner(false);
    overlay = fixture.componentInstance.create(owner.requestOpenChange);

    await overlay.show();

    expect(owner.requests).toEqual([true]);
    expect(overlay.isOpen()).toBe(false);
  });

  it('asks once the show delay has passed, not when the show starts', async () => {
    const { fixture } = await render(OverlayHost);
    const owner = boundOwner(true);
    overlay = fixture.componentInstance.create(owner.requestOpenChange, { showDelay: 50 });

    const showing = overlay.show();
    expect(owner.requests).toEqual([]);

    await showing;
    expect(owner.requests).toEqual([true]);
    expect(overlay.isOpen()).toBe(true);
  });

  it('skips the show delay for an immediate show', async () => {
    const { fixture } = await render(OverlayHost);
    overlay = fixture.componentInstance.create(() => true, { showDelay: 10_000 });

    overlay.show({ immediate: true });
    await wait(20);

    expect(overlay.isOpen()).toBe(true);
  });

  it('skips the delay of an open already scheduled when an immediate show joins it', async () => {
    const { fixture } = await render(OverlayHost);
    overlay = fixture.componentInstance.create(() => true, { showDelay: 10_000 });

    const scheduled = overlay.show();
    overlay.show({ immediate: true });
    await wait(20);

    expect(overlay.isOpen()).toBe(true);
    expect(await Promise.race([scheduled.then(() => 'settled'), wait(20)])).toBe('settled');
  });

  it('stays open when the close is declined, without tearing anything down', async () => {
    const { fixture } = await render(OverlayHost);
    const owner = boundOwner(true);
    overlay = fixture.componentInstance.create(owner.requestOpenChange, { hideDelay: 20 });
    await overlay.show();

    let closing = 0;
    overlay.closing.subscribe(() => closing++);

    overlay.hide();
    await wait(40);

    expect(owner.requests).toEqual([true, false]);
    expect(overlay.isOpen()).toBe(true);
    expect(closing).toBe(0);
    expect(document.querySelector('[data-testid="overlay"]')).not.toBeNull();
  });

  it('asks again on the next close after declining one', async () => {
    const { fixture } = await render(OverlayHost);
    const owner = boundOwner(true);
    overlay = fixture.componentInstance.create(owner.requestOpenChange);
    await overlay.show();

    overlay.hide({ immediate: true });
    overlay.hide({ immediate: true });

    expect(owner.requests).toEqual([true, false, false]);
  });

  it('returns focus the way the declined close would have when the owner closes it', async () => {
    const { fixture } = await render(OverlayHost);
    const owner = boundOwner(true);
    overlay = fixture.componentInstance.create(owner.requestOpenChange);
    await overlay.show();

    // Escape: nothing had focus when it opened, so only a keyboard close lands on the trigger
    overlay.hide({ origin: 'keyboard', immediate: true });
    expect(overlay.isOpen()).toBe(true);

    owner.open = false;
    overlay.hide({ immediate: true });

    await waitFor(() => expect(overlay!.isOpen()).toBe(false));
    expect(document.activeElement).toBe(fixture.componentInstance.trigger().nativeElement);
  });

  it('applies a content change made during a declined close', async () => {
    const { fixture } = await render(OverlayHost);
    const owner = boundOwner(true);
    const content = signal<TemplateRef<unknown> | undefined>(fixture.componentInstance.content());
    overlay = fixture.componentInstance.create(owner.requestOpenChange, {
      content,
      hideDelay: 20,
    });
    await overlay.show();

    overlay.hide();
    content.set(undefined);
    fixture.detectChanges();

    // nothing is left to render, so the overlay closes once it is no longer closing
    await waitFor(() => expect(overlay!.isOpen()).toBe(false));
  });

  it('keeps the trigger press of a reopen declined during an exit animation', async () => {
    const { fixture } = await render(OverlayHost);
    const owner = boundOwner(true);
    overlay = fixture.componentInstance.create(owner.requestOpenChange);
    (document.activeElement as HTMLElement | null)?.blur();
    await overlay.show();

    const exit = controlledAnimation();
    document.querySelector<HTMLElement>('[data-testid="overlay"]')!.getAnimations = () => [
      exit.animation,
    ];
    owner.open = false;
    overlay.hide({ immediate: true });

    // pressed while the overlay is still animating out, and declined
    await overlay.show({ fromTriggerPress: true });
    exit.finish();
    await waitFor(() => expect(overlay!.isOpen()).toBe(false));

    owner.open = true;
    await overlay.show({ immediate: true });
    owner.open = false;
    overlay.hide({ origin: 'mouse', immediate: true });

    await waitFor(() => expect(overlay!.isOpen()).toBe(false));
    expect(document.activeElement).toBe(fixture.componentInstance.trigger().nativeElement);
  });

  it('asks before cancelling an exit animation that is already running', async () => {
    const { fixture } = await render(OverlayHost);
    const owner = boundOwner(true);
    overlay = fixture.componentInstance.create(owner.requestOpenChange);
    await overlay.show();

    const element = document.querySelector<HTMLElement>('[data-testid="overlay"]')!;
    element.getAnimations = () => [pendingAnimation()];

    owner.open = false;
    overlay.hide({ immediate: true });
    owner.requests = [];

    overlay.cancelPendingClose();
    await overlay.show();

    expect(owner.requests).toEqual([true, true]);
    expect(element.hasAttribute('data-exit')).toBe(true);
  });

  it('keeps closing on scroll after a declined scroll close', async () => {
    const { fixture } = await render(OverlayHost);
    const owner = boundOwner(true);
    overlay = fixture.componentInstance.create(owner.requestOpenChange, {
      scrollBehaviour: 'close',
    });
    await overlay.show();
    owner.requests = [];

    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));

    expect(owner.requests).toEqual([false, false]);
    expect(overlay.isOpen()).toBe(true);
  });

  it('returns focus to the trigger whose press asked for an open the owner committed later', async () => {
    const { fixture } = await render(OverlayHost);
    const owner = boundOwner(false);
    overlay = fixture.componentInstance.create(owner.requestOpenChange);
    (document.activeElement as HTMLElement | null)?.blur();

    // Safari does not focus a pressed button, so only the press names the trigger
    await overlay.show({ fromTriggerPress: true });
    owner.open = true;
    await overlay.show({ immediate: true });

    owner.open = false;
    overlay.hide({ origin: 'mouse', immediate: true });

    await waitFor(() => expect(overlay!.isOpen()).toBe(false));
    expect(document.activeElement).toBe(fixture.componentInstance.trigger().nativeElement);
  });

  it('does not ask before a close it cannot refuse', async () => {
    const { fixture } = await render(OverlayHost);
    const owner = boundOwner(true);
    overlay = fixture.componentInstance.create(owner.requestOpenChange);
    await overlay.show();
    owner.requests = [];

    overlay.hideImmediate();

    expect(owner.requests).toEqual([]);
    await waitFor(() => expect(overlay!.isOpen()).toBe(false));
  });
});

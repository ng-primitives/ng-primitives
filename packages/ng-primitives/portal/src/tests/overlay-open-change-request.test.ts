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
import { afterEach, describe, expect, it, onTestFinished } from 'vitest';
import { createOverlay, NgpOverlay, NgpOverlayConfig } from '../overlay';

@Component({
  template: `
    <button #trigger>Trigger</button>
    <button #other>Other</button>

    <ng-template #content>
      <div data-testid="overlay"><button data-testid="inside">Inside</button></div>
    </ng-template>
  `,
})
class OverlayHost {
  readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  readonly other = viewChild.required<ElementRef<HTMLElement>>('other');
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

/** A pointer press: a primary `pointerdown`, then the `click` that ends it. */
function press(target: HTMLElement): void {
  target.dispatchEvent(
    new PointerEvent('pointerdown', { bubbles: true, cancelable: true, isPrimary: true }),
  );
  target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
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
    overlay.hide({ immediate: true, fromOwner: true });

    await waitFor(() => expect(overlay!.isOpen()).toBe(false));
    expect(document.activeElement).toBe(fixture.componentInstance.trigger().nativeElement);
  });

  it('does not take the origin of a declined close for a close of its own without one', async () => {
    const { fixture } = await render(OverlayHost);
    const owner = boundOwner(true);
    const origins: string[] = [];
    overlay = fixture.componentInstance.create(owner.requestOpenChange, {
      onClose: origin => origins.push(origin),
    });
    await overlay.show();

    overlay.hide({ origin: 'keyboard', immediate: true });
    expect(overlay.isOpen()).toBe(true);

    // a close on scroll or on hover brings no origin
    owner.open = false;
    overlay.hide({ immediate: true });

    await waitFor(() => expect(overlay!.isOpen()).toBe(false));
    expect(origins).toEqual(['program']);
  });

  it('does not carry a declined outside press into a later close of its own', async () => {
    const { fixture } = await render(OverlayHost);
    const owner = boundOwner(true);
    overlay = fixture.componentInstance.create(owner.requestOpenChange);
    await overlay.show();
    const outside = document.body.appendChild(document.createElement('button'));
    onTestFinished(() => outside.remove());

    overlay.hide({ origin: 'mouse', outsidePressTarget: outside, immediate: true });
    expect(overlay.isOpen()).toBe(true);

    owner.open = false;
    overlay.hide({ origin: 'keyboard', immediate: true });

    await waitFor(() => expect(overlay!.isOpen()).toBe(false));
    expect(document.activeElement).toBe(fixture.componentInstance.trigger().nativeElement);
  });

  it('does not take the origin of a declined close for an outside press', async () => {
    const { fixture } = await render(OverlayHost);
    const owner = boundOwner(true);
    const origins: string[] = [];
    overlay = fixture.componentInstance.create(owner.requestOpenChange, {
      onClose: origin => origins.push(origin),
    });
    await overlay.show();

    overlay.hide({ origin: 'keyboard', immediate: true });
    expect(overlay.isOpen()).toBe(true);

    owner.open = false;
    overlay.hide({ outsidePressTarget: document.body, immediate: true });

    await waitFor(() => expect(overlay!.isOpen()).toBe(false));
    expect(origins).toEqual(['program']);
  });

  describe('closingPressTarget', () => {
    async function recordPresses(requestOpenChange?: (open: boolean) => boolean) {
      const { fixture } = await render(OverlayHost);
      const created = fixture.componentInstance.create(requestOpenChange ?? (() => true), {
        requestOpenChange,
      });
      overlay = created;
      const presses: (Element | null)[] = [];
      created.closing.subscribe(() => presses.push(created.closingPressTarget()));
      await created.show();
      const outside = document.body.appendChild(document.createElement('div'));
      onTestFinished(() => outside.remove());
      return { overlay: created, presses, outside };
    }

    it('reports the outside press a close answers', async () => {
      const { overlay, presses, outside } = await recordPresses();

      overlay.hide({ outsidePressTarget: outside, immediate: true });

      expect(presses).toEqual([outside]);
      // not kept past the close, so a closed overlay holds no pressed element
      expect(overlay.closingPressTarget()).toBeNull();
    });

    it('reports a declined outside press when the owner commits it', async () => {
      const owner = boundOwner(true);
      const { overlay, presses, outside } = await recordPresses(owner.requestOpenChange);

      overlay.hide({ outsidePressTarget: outside, immediate: true });
      expect(presses).toEqual([]);
      owner.open = false;
      overlay.hide({ immediate: true, fromOwner: true });

      expect(presses).toEqual([outside]);
      expect(overlay.closingPressTarget()).toBeNull();
    });

    it('reports no press for a close of its own after a declined outside press', async () => {
      const owner = boundOwner(true);
      const { overlay, presses, outside } = await recordPresses(owner.requestOpenChange);

      overlay.hide({ outsidePressTarget: outside, immediate: true });
      owner.open = false;
      overlay.hide({ origin: 'keyboard', immediate: true });

      expect(presses).toEqual([null]);
    });

    it('drops a declined outside press once a close it cannot refuse goes through', async () => {
      const owner = boundOwner(true);
      const { overlay, presses, outside } = await recordPresses(owner.requestOpenChange);
      const element = document.querySelector<HTMLElement>('[data-testid="overlay"]')!;
      element.getAnimations = () => [pendingAnimation()];

      overlay.hide({ outsidePressTarget: outside, immediate: true });
      owner.open = false;
      overlay.hideImmediate();
      // reopened during the exit animation, so the overlay is not created again
      owner.open = true;
      await overlay.show();
      element.getAnimations = () => [];
      owner.open = false;
      overlay.hide({ immediate: true, fromOwner: true });

      expect(presses).toEqual([null, null]);
    });
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

    try {
      // pressed while the overlay is still animating out, and declined
      await overlay.show({ fromTriggerPress: true });
    } finally {
      exit.finish();
    }
    await waitFor(() => expect(overlay!.isOpen()).toBe(false));

    owner.open = true;
    await overlay.show({ immediate: true, fromOwner: true });
    owner.open = false;
    overlay.hide({ origin: 'mouse', immediate: true });

    await waitFor(() => expect(overlay!.isOpen()).toBe(false));
    expect(document.activeElement).toBe(fixture.componentInstance.trigger().nativeElement);
  });

  describe('when the owner commits a declined reopen before the exit animation ends', () => {
    async function commitDuringExit() {
      const { fixture } = await render(OverlayHost);
      const owner = boundOwner(true);
      overlay = fixture.componentInstance.create(owner.requestOpenChange);
      (document.activeElement as HTMLElement | null)?.blur();
      await overlay.show();

      const element = document.querySelector<HTMLElement>('[data-testid="overlay"]')!;
      element.getAnimations = () => [pendingAnimation()];
      owner.open = false;
      overlay.hide({ immediate: true });

      await overlay.show({ fromTriggerPress: true });
      owner.open = true;
      await overlay.show({ immediate: true, fromOwner: true });
      element.getAnimations = () => [];

      return { owner, trigger: fixture.componentInstance.trigger().nativeElement };
    }

    it('returns focus to the trigger whose press asked for it', async () => {
      const { owner, trigger } = await commitDuringExit();
      expect(overlay!.isOpen()).toBe(true);

      owner.open = false;
      overlay!.hide({ origin: 'mouse', immediate: true });

      await waitFor(() => expect(overlay!.isOpen()).toBe(false));
      expect(document.activeElement).toBe(trigger);
    });

    it('does not carry the press into a later open', async () => {
      const { owner } = await commitDuringExit();
      owner.open = false;
      overlay!.hide({ immediate: true });
      await waitFor(() => expect(overlay!.isOpen()).toBe(false));
      (document.activeElement as HTMLElement | null)?.blur();

      owner.open = true;
      await overlay!.show({ immediate: true, fromOwner: true });
      owner.open = false;
      overlay!.hide({ origin: 'mouse', immediate: true });

      await waitFor(() => expect(overlay!.isOpen()).toBe(false));
      expect(document.activeElement).toBe(document.body);
    });
  });

  describe('when the owner opens without answering a declined press', () => {
    it('returns focus to where it was rather than to the pressed trigger', async () => {
      const { fixture } = await render(OverlayHost);
      const owner = boundOwner(false);
      overlay = fixture.componentInstance.create(owner.requestOpenChange);
      const other = fixture.componentInstance.other().nativeElement;

      await overlay.show({ fromTriggerPress: true });
      other.focus();
      owner.open = true;
      await overlay.show({ immediate: true });
      // closed from inside the panel, so focus is still the overlay's to return
      document.querySelector<HTMLElement>('[data-testid="inside"]')!.focus();
      owner.open = false;
      overlay.hide({ origin: 'mouse', immediate: true });

      await waitFor(() => expect(overlay!.isOpen()).toBe(false));
      expect(document.activeElement).toBe(other);
    });

    it('drops the press when a later declined request has none', async () => {
      const { fixture } = await render(OverlayHost);
      const owner = boundOwner(false);
      overlay = fixture.componentInstance.create(owner.requestOpenChange);
      const other = fixture.componentInstance.other().nativeElement;

      await overlay.show({ fromTriggerPress: true });
      other.focus();
      // asked again from code, and this is the request the owner answers
      await overlay.show();
      owner.open = true;
      await overlay.show({ immediate: true, fromOwner: true });
      document.querySelector<HTMLElement>('[data-testid="inside"]')!.focus();
      owner.open = false;
      overlay.hide({ origin: 'mouse', immediate: true });

      await waitFor(() => expect(overlay!.isOpen()).toBe(false));
      expect(document.activeElement).toBe(other);
    });

    it('keeps the focus to return to when the open cancels an exit animation', async () => {
      const { fixture } = await render(OverlayHost);
      const owner = boundOwner(true);
      overlay = fixture.componentInstance.create(owner.requestOpenChange);
      const other = fixture.componentInstance.other().nativeElement;
      other.focus();
      await overlay.show();

      const element = document.querySelector<HTMLElement>('[data-testid="overlay"]')!;
      element.getAnimations = () => [pendingAnimation()];
      owner.open = false;
      overlay.hide({ immediate: true });

      await overlay.show({ fromTriggerPress: true });
      owner.open = true;
      await overlay.show({ immediate: true });
      element.getAnimations = () => [];
      expect(overlay.isOpen()).toBe(true);

      document.querySelector<HTMLElement>('[data-testid="inside"]')!.focus();
      owner.open = false;
      overlay.hide({ origin: 'mouse', immediate: true });

      await waitFor(() => expect(overlay!.isOpen()).toBe(false));
      expect(document.activeElement).toBe(other);
    });
  });

  it('returns focus to the trigger whose press reopened the overlay during its exit animation', async () => {
    const { fixture } = await render(OverlayHost);
    overlay = fixture.componentInstance.create(() => true);
    (document.activeElement as HTMLElement | null)?.blur();
    await overlay.show();

    const element = document.querySelector<HTMLElement>('[data-testid="overlay"]')!;
    element.getAnimations = () => [pendingAnimation()];
    overlay.hide({ immediate: true });

    await overlay.show({ fromTriggerPress: true });
    element.getAnimations = () => [];
    expect(overlay.isOpen()).toBe(true);

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
    await overlay.show({ immediate: true, fromOwner: true });

    owner.open = false;
    overlay.hide({ origin: 'mouse', immediate: true });

    await waitFor(() => expect(overlay!.isOpen()).toBe(false));
    expect(document.activeElement).toBe(fixture.componentInstance.trigger().nativeElement);
  });

  it('keeps the owner answering when another immediate show joins its pending open', async () => {
    const { fixture } = await render(OverlayHost);
    const owner = boundOwner(false);
    overlay = fixture.componentInstance.create(owner.requestOpenChange);
    (document.activeElement as HTMLElement | null)?.blur();

    await overlay.show({ fromTriggerPress: true });
    owner.open = true;
    await Promise.all([
      overlay.show({ immediate: true, fromOwner: true }),
      overlay.show({ immediate: true }),
    ]);
    document.querySelector<HTMLElement>('[data-testid="inside"]')!.focus();
    owner.open = false;
    overlay.hide({ origin: 'mouse', immediate: true });

    await waitFor(() => expect(overlay!.isOpen()).toBe(false));
    expect(document.activeElement).toBe(fixture.componentInstance.trigger().nativeElement);
  });

  it('returns focus to the control a declined press landed on when the owner commits the open', async () => {
    const { fixture } = await render(OverlayHost);
    const owner = boundOwner(false);
    overlay = fixture.componentInstance.create(owner.requestOpenChange);
    const other = fixture.componentInstance.other().nativeElement;
    (document.activeElement as HTMLElement | null)?.blur();

    await overlay.show({ pressTarget: other });
    owner.open = true;
    await overlay.show({ immediate: true, fromOwner: true });

    owner.open = false;
    overlay.hide({ origin: 'mouse', immediate: true });

    await waitFor(() => expect(overlay!.isOpen()).toBe(false));
    expect(document.activeElement).toBe(other);
  });

  it('asks before a modal overlay closes on an outside press, and keeps the page inert', async () => {
    const { fixture } = await render(OverlayHost);
    const owner = boundOwner(true);
    overlay = fixture.componentInstance.create(owner.requestOpenChange, {
      modal: true,
      closeOnOutsideClick: true,
    });
    const other = fixture.componentInstance.other().nativeElement;
    (document.activeElement as HTMLElement | null)?.blur();
    await overlay.show();
    owner.requests = [];
    expect(other.closest('[inert]')).not.toBeNull();

    press(other);

    await waitFor(() => expect(owner.requests).toEqual([false]));
    expect(overlay.isOpen()).toBe(true);
    expect(other.closest('[inert]')).not.toBeNull();

    // The swallowed press focused nothing, so the owner's close still returns focus
    owner.open = false;
    overlay.hide({ immediate: true, fromOwner: true });

    await waitFor(() => expect(overlay!.isOpen()).toBe(false));
    expect(document.activeElement).toBe(fixture.componentInstance.trigger().nativeElement);
    expect(other.closest('[inert]')).toBeNull();
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

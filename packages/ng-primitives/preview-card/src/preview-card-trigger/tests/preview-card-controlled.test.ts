import { Component, Directive, OnInit, signal } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import {
  injectPreviewCardTriggerState,
  NgpPreviewCard,
  NgpPreviewCardTrigger,
} from 'ng-primitives/preview-card';
import { afterEach, describe, expect, it, vi } from 'vitest';

// The fixtures sit away from the viewport origin, where the headless browser parks its real
// cursor - a trigger under it would get a genuine pointerenter at render time.

@Component({
  template: `
    <div style="padding: 200px">
      <a
        [(ngpPreviewCardTriggerOpen)]="open"
        [ngpPreviewCardTrigger]="card"
        (ngpPreviewCardTriggerOpenChange)="changes.push($event)"
        href="https://angularprimitives.com"
        ngpPreviewCardTriggerShowDelay="0"
        ngpPreviewCardTriggerHideDelay="0"
      >
        Angular Primitives
      </a>
    </div>

    <ng-template #card>
      <div ngpPreviewCard>Card</div>
    </ng-template>
  `,
  imports: [NgpPreviewCardTrigger, NgpPreviewCard],
})
class TwoWayComponent {
  readonly open = signal(false);
  readonly changes: boolean[] = [];
}

@Component({
  template: `
    <div style="padding: 200px">
      <a
        [ngpPreviewCardTrigger]="card"
        [ngpPreviewCardTriggerOpen]="open()"
        [ngpPreviewCardTriggerShowDelay]="delay"
        [ngpPreviewCardTriggerHideDelay]="delay"
        (ngpPreviewCardTriggerOpenChange)="changes.push($event)"
        href="https://angularprimitives.com"
      >
        Angular Primitives
      </a>
    </div>

    <ng-template #card>
      <div ngpPreviewCard>Card</div>
    </ng-template>
  `,
  imports: [NgpPreviewCardTrigger, NgpPreviewCard],
})
class OneWayComponent {
  readonly open = signal(false);
  readonly changes: boolean[] = [];
  delay = 0;
}

@Component({
  template: `
    <div style="padding: 200px">
      <a
        [ngpPreviewCardTrigger]="card"
        (ngpPreviewCardTriggerOpenChange)="changes.push($event)"
        href="https://angularprimitives.com"
        ngpPreviewCardTriggerDefaultOpen
      >
        Angular Primitives
      </a>
    </div>

    <ng-template #card>
      <div ngpPreviewCard>Card</div>
    </ng-template>
  `,
  imports: [NgpPreviewCardTrigger, NgpPreviewCard],
})
class DefaultOpenComponent {
  readonly changes: boolean[] = [];
}

/** Sets `defaultOpen` through the state, as a reusable component wrapping the trigger would. */
@Directive({ selector: '[setDefaultOpen]' })
class SetDefaultOpen implements OnInit {
  private readonly state = injectPreviewCardTriggerState();

  ngOnInit(): void {
    this.state().setDefaultOpen(true);
  }
}

@Component({
  template: `
    <div style="padding: 200px">
      <a [ngpPreviewCardTrigger]="card" href="https://angularprimitives.com" setDefaultOpen>
        Angular Primitives
      </a>
    </div>

    <ng-template #card>
      <div ngpPreviewCard>Card</div>
    </ng-template>
  `,
  imports: [NgpPreviewCardTrigger, NgpPreviewCard, SetDefaultOpen],
})
class SetDefaultOpenComponent {}

@Component({
  template: `
    <div style="padding: 200px">
      <a
        [ngpPreviewCardTrigger]="hasContent() ? card : undefined"
        (ngpPreviewCardTriggerOpenChange)="changes.push($event)"
        href="https://angularprimitives.com"
        ngpPreviewCardTriggerOpen
      >
        Angular Primitives
      </a>
    </div>

    <ng-template #card>
      <div ngpPreviewCard>Card</div>
    </ng-template>
  `,
  imports: [NgpPreviewCardTrigger, NgpPreviewCard],
})
class LateContentComponent {
  readonly hasContent = signal(false);
  readonly changes: boolean[] = [];
}

/** An exit animation that never settles, holding the card mid-close. */
function pendingAnimation(): Animation {
  return {
    finished: new Promise<void>(() => undefined),
    cancel: () => undefined,
    finish: () => undefined,
    effect: { getComputedTiming: () => ({ iterations: 1, endTime: 100_000 }) },
  } as unknown as Animation;
}

const card = () => document.querySelector('[ngpPreviewCard]');
const settle = () => new Promise(resolve => setTimeout(resolve, 50));

describe('NgpPreviewCardTrigger open binding', () => {
  afterEach(() => {
    document.querySelectorAll('[ngpPreviewCard]').forEach(el => el.remove());
  });

  describe('two-way', () => {
    it('updates the bound value as the pointer enters and leaves', async () => {
      const { fixture, getByRole } = await render(TwoWayComponent);
      const host = fixture.componentInstance;
      const trigger = getByRole('link');

      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
      await waitFor(() => expect(card()).toBeInTheDocument());
      expect(host.open()).toBe(true);

      fireEvent.pointerLeave(trigger, { pointerType: 'mouse' });
      await waitFor(() => expect(card()).not.toBeInTheDocument());
      expect(host.open()).toBe(false);

      expect(host.changes).toEqual([true, false]);
    });
  });

  describe('one-way', () => {
    it('opens and closes as the bound value changes, skipping the delays, without emitting', async () => {
      const { fixture } = await render(OneWayComponent, {
        componentProperties: { delay: 10_000 },
      });
      const host = fixture.componentInstance;

      host.open.set(true);
      fixture.detectChanges();
      await waitFor(() => expect(card()).toBeInTheDocument());

      host.open.set(false);
      fixture.detectChanges();
      await waitFor(() => expect(card()).not.toBeInTheDocument());

      expect(host.changes).toEqual([]);
    });

    it('reports a hover but stays closed until the binding opens it', async () => {
      const { fixture, getByRole } = await render(OneWayComponent);

      fireEvent.pointerEnter(getByRole('link'), { pointerType: 'mouse' });
      await settle();

      expect(fixture.componentInstance.changes).toEqual([true]);
      expect(card()).not.toBeInTheDocument();
    });

    it('reports the pointer leaving and Escape but stays open', async () => {
      const { fixture, getByRole } = await render(OneWayComponent);
      const host = fixture.componentInstance;
      host.open.set(true);
      fixture.detectChanges();
      await waitFor(() => expect(card()).toBeInTheDocument());

      // the hover bridge holds the card until the pointer stops heading toward it
      fireEvent.pointerLeave(getByRole('link'), { pointerType: 'mouse' });
      await waitFor(() => expect(host.changes).toEqual([false]));
      fireEvent.keyDown(document, { key: 'Escape' });
      await settle();

      expect(host.changes).toEqual([false, false]);
      expect(card()).toBeInTheDocument();
    });

    it('reports a hover during the exit animation once, without reopening', async () => {
      const { fixture, getByRole } = await render(OneWayComponent);
      const host = fixture.componentInstance;
      host.open.set(true);
      fixture.detectChanges();
      await waitFor(() => expect(card()).toBeInTheDocument());

      const element = card() as HTMLElement;
      element.getAnimations = () => [pendingAnimation()];
      host.open.set(false);
      fixture.detectChanges();
      await waitFor(() => expect(element).toHaveAttribute('data-exit'));

      fireEvent.pointerEnter(getByRole('link'), { pointerType: 'mouse' });
      await settle();

      expect(host.changes).toEqual([true]);
    });

    it('opens once content arrives for a binding that is already true', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      try {
        const { fixture } = await render(LateContentComponent);
        await settle();
        expect(card()).not.toBeInTheDocument();

        fixture.componentInstance.hasContent.set(true);
        fixture.detectChanges();

        await waitFor(() => expect(card()).toBeInTheDocument());
        expect(fixture.componentInstance.changes).toEqual([]);
        expect(consoleSpy).not.toHaveBeenCalled();
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });

  describe('defaultOpen', () => {
    it('can be set through the state before the first render', async () => {
      await render(SetDefaultOpenComponent);

      await waitFor(() => expect(card()).toBeInTheDocument());
    });

    it('opens on first render without emitting', async () => {
      const { fixture } = await render(DefaultOpenComponent);

      await waitFor(() => expect(card()).toBeInTheDocument());
      expect(fixture.componentInstance.changes).toEqual([]);
    });
  });
});

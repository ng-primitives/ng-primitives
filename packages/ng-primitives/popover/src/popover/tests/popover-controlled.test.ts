import { Component, Directive, OnInit, signal, viewChild } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { injectPopoverTriggerState, NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { afterEach, describe, expect, it } from 'vitest';

@Component({
  template: `
    <button
      [(ngpPopoverTriggerOpen)]="open"
      [ngpPopoverTrigger]="content"
      (ngpPopoverTriggerOpenChange)="changes.push($event)"
    >
      Trigger
    </button>
    <button data-testid="outside">Outside</button>

    <ng-template #content>
      <div ngpPopover>
        <button>Inside</button>
      </div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class TwoWayComponent {
  readonly open = signal(false);
  readonly changes: boolean[] = [];
}

@Component({
  template: `
    <button
      #trigger="ngpPopoverTrigger"
      [ngpPopoverTrigger]="content"
      [ngpPopoverTriggerOpen]="open()"
      [ngpPopoverTriggerDisabled]="disabled()"
      (ngpPopoverTriggerOpenChange)="changes.push($event)"
    >
      Trigger
    </button>

    <ng-template #content>
      <div ngpPopover>
        <button>Inside</button>
      </div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class OneWayComponent {
  readonly open = signal<boolean | undefined>(false);
  readonly disabled = signal(false);
  readonly changes: boolean[] = [];
  readonly trigger = viewChild.required<NgpPopoverTrigger>('trigger');
}

@Component({
  template: `
    <button
      [ngpPopoverTrigger]="content"
      (ngpPopoverTriggerOpenChange)="changes.push($event)"
      ngpPopoverTriggerDefaultOpen
    >
      Trigger
    </button>

    <ng-template #content>
      <div ngpPopover>Content</div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class DefaultOpenComponent {
  readonly changes: boolean[] = [];
}

@Component({
  template: `
    <button
      [ngpPopoverTrigger]="hasContent() ? content : undefined"
      [ngpPopoverTriggerOpen]="true"
      (ngpPopoverTriggerOpenChange)="changes.push($event)"
    >
      Trigger
    </button>

    <ng-template #content>
      <div ngpPopover>Content</div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class ClearedContentComponent {
  readonly hasContent = signal(true);
  readonly changes: boolean[] = [];
}

@Component({
  template: `
    <button
      [ngpPopoverTrigger]="content"
      [ngpPopoverTriggerOpen]="false"
      (ngpPopoverTriggerOpenChange)="changes.push($event)"
      ngpPopoverTriggerShowDelay="100"
    >
      Trigger
    </button>

    <ng-template #content>
      <div ngpPopover>Content</div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class ShowDelayComponent {
  readonly changes: boolean[] = [];
}

/** Sets `defaultOpen` through the state, as a reusable component wrapping the trigger would. */
@Directive({ selector: '[setDefaultOpen]' })
class SetDefaultOpen implements OnInit {
  private readonly state = injectPopoverTriggerState();

  ngOnInit(): void {
    this.state().setDefaultOpen(true);
  }
}

@Component({
  template: `
    <button [ngpPopoverTrigger]="content" setDefaultOpen>Trigger</button>

    <ng-template #content>
      <div ngpPopover>Content</div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover, SetDefaultOpen],
})
class SetDefaultOpenComponent {}

/** An exit animation that never settles, holding the popover mid-close. */
function pendingAnimation(): Animation {
  return {
    finished: new Promise<void>(() => undefined),
    cancel: () => undefined,
    finish: () => undefined,
    effect: { getComputedTiming: () => ({ iterations: 1, endTime: 100_000 }) },
  } as unknown as Animation;
}

const popover = () => document.querySelector('[ngpPopover]');
const settle = () => new Promise(resolve => setTimeout(resolve, 50));

describe('NgpPopoverTrigger open binding', () => {
  afterEach(() => {
    document.querySelectorAll('[ngpPopover]').forEach(el => el.remove());
  });

  describe('two-way', () => {
    it('opens and closes as the bound value changes, without emitting', async () => {
      const { fixture } = await render(TwoWayComponent);
      const host = fixture.componentInstance;

      host.open.set(true);
      fixture.detectChanges();
      await waitFor(() => expect(popover()).toBeInTheDocument());

      host.open.set(false);
      fixture.detectChanges();
      await waitFor(() => expect(popover()).not.toBeInTheDocument());

      expect(host.changes).toEqual([]);
    });

    it('updates the bound value when the user opens and closes it', async () => {
      const { fixture, getByRole } = await render(TwoWayComponent);
      const host = fixture.componentInstance;

      fireEvent.click(getByRole('button', { name: 'Trigger' }));
      await waitFor(() => expect(popover()).toBeInTheDocument());
      expect(host.open()).toBe(true);

      fireEvent.keyDown(document, { key: 'Escape' });
      await waitFor(() => expect(popover()).not.toBeInTheDocument());
      expect(host.open()).toBe(false);

      expect(host.changes).toEqual([true, false]);
    });
  });

  describe('one-way', () => {
    it('reports a trigger press but stays closed until the binding opens it', async () => {
      const { fixture, getByRole } = await render(OneWayComponent);
      const host = fixture.componentInstance;

      fireEvent.click(getByRole('button', { name: 'Trigger' }));
      await settle();

      expect(host.changes).toEqual([true]);
      expect(popover()).not.toBeInTheDocument();
    });

    it('reports Escape, outside press and trigger press but stays open', async () => {
      const { fixture, getByRole } = await render(OneWayComponent);
      const host = fixture.componentInstance;
      host.open.set(true);
      fixture.detectChanges();
      await waitFor(() => expect(popover()).toBeInTheDocument());

      fireEvent.keyDown(document, { key: 'Escape' });
      await settle();
      fireEvent.mouseUp(document.body);
      await settle();
      fireEvent.click(getByRole('button', { name: 'Trigger' }));
      await settle();

      expect(host.changes).toEqual([false, false, false]);
      expect(popover()).toBeInTheDocument();
    });

    it('opens on first render when bound to true', async () => {
      const { fixture } = await render(OneWayComponent, {
        componentProperties: { open: signal(true) },
      });

      await waitFor(() => expect(popover()).toBeInTheDocument());
      expect(fixture.componentInstance.changes).toEqual([]);
    });

    it('returns focus to the trigger when the binding closes it after Escape', async () => {
      const { fixture, getByRole } = await render(OneWayComponent);
      const host = fixture.componentInstance;
      host.open.set(true);
      fixture.detectChanges();
      await waitFor(() => expect(popover()).toBeInTheDocument());

      fireEvent.keyDown(document, { key: 'Escape' });
      host.open.set(false);
      fixture.detectChanges();

      await waitFor(() => expect(popover()).not.toBeInTheDocument());
      expect(document.activeElement).toBe(getByRole('button', { name: 'Trigger' }));
    });

    it('keeps the focus trap after a declined Escape', async () => {
      const { fixture } = await render(OneWayComponent);
      const host = fixture.componentInstance;
      host.open.set(true);
      fixture.detectChanges();
      await waitFor(() => expect(popover()).toBeInTheDocument());
      await waitFor(() => expect(popover()!.contains(document.activeElement)).toBe(true));

      fireEvent.keyDown(document, { key: 'Escape' });
      await settle();
      await userEvent.tab();

      expect(popover()!.contains(document.activeElement)).toBe(true);
    });

    it('reports a trigger press once the show delay has passed', async () => {
      const { fixture, getByRole } = await render(ShowDelayComponent);

      fireEvent.click(getByRole('button', { name: 'Trigger' }));
      expect(fixture.componentInstance.changes).toEqual([]);

      await waitFor(() => expect(fixture.componentInstance.changes).toEqual([true]));
      expect(popover()).not.toBeInTheDocument();
    });

    it('reports a close it cannot decline, such as the content being cleared', async () => {
      const { fixture } = await render(ClearedContentComponent);
      const host = fixture.componentInstance;
      await waitFor(() => expect(popover()).toBeInTheDocument());

      host.hasContent.set(false);
      fixture.detectChanges();

      await waitFor(() => expect(popover()).not.toBeInTheDocument());
      expect(host.changes).toEqual([false]);
    });

    it('reports a show() during the exit animation once, without reopening', async () => {
      const { fixture } = await render(OneWayComponent);
      const host = fixture.componentInstance;
      host.open.set(true);
      fixture.detectChanges();
      await waitFor(() => expect(popover()).toBeInTheDocument());

      const element = popover() as HTMLElement;
      element.getAnimations = () => [pendingAnimation()];
      host.open.set(false);
      fixture.detectChanges();
      await waitFor(() => expect(element).toHaveAttribute('data-exit'));

      await host.trigger().show();

      expect(host.changes).toEqual([true]);
    });

    it('opens once content arrives for a binding that is already true', async () => {
      const { fixture } = await render(ClearedContentComponent, {
        componentProperties: { hasContent: signal(false) },
      });
      await settle();
      expect(popover()).not.toBeInTheDocument();

      fixture.componentInstance.hasContent.set(true);
      fixture.detectChanges();

      await waitFor(() => expect(popover()).toBeInTheDocument());
      expect(fixture.componentInstance.changes).toEqual([]);
    });

    it('reports a show() call instead of opening', async () => {
      const { fixture } = await render(OneWayComponent);
      const host = fixture.componentInstance;

      await host.trigger().show();

      expect(host.changes).toEqual([true]);
      expect(popover()).not.toBeInTheDocument();
    });

    it('follows the binding while the trigger is disabled', async () => {
      const { fixture } = await render(OneWayComponent);
      const host = fixture.componentInstance;
      host.disabled.set(true);
      host.open.set(true);
      fixture.detectChanges();

      await waitFor(() => expect(popover()).toBeInTheDocument());
    });

    it('goes back to managing itself when the binding is cleared', async () => {
      const { fixture, getByRole } = await render(OneWayComponent);
      const host = fixture.componentInstance;
      host.open.set(undefined);
      fixture.detectChanges();

      fireEvent.click(getByRole('button', { name: 'Trigger' }));

      await waitFor(() => expect(popover()).toBeInTheDocument());
      expect(host.changes).toEqual([true]);
    });
  });

  describe('defaultOpen', () => {
    it('opens on first render without emitting', async () => {
      const { fixture } = await render(DefaultOpenComponent);

      await waitFor(() => expect(popover()).toBeInTheDocument());
      expect(fixture.componentInstance.changes).toEqual([]);
    });

    it('can be set through the state before the first render', async () => {
      await render(SetDefaultOpenComponent);

      await waitFor(() => expect(popover()).toBeInTheDocument());
    });

    it('then behaves as an unbound popover', async () => {
      const { fixture } = await render(DefaultOpenComponent);
      await waitFor(() => expect(popover()).toBeInTheDocument());

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => expect(popover()).not.toBeInTheDocument());
      expect(fixture.componentInstance.changes).toEqual([false]);
    });
  });
});

import { Component, signal } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { afterEach, describe, expect, it } from 'vitest';
import { NgpOffset, NgpScrollBehavior } from '../../index';

@Component({
  template: `
    <div class="spacer"></div>
    <button
      [ngpPopoverTrigger]="content"
      [ngpPopoverTriggerOffset]="offset()"
      [ngpPopoverTriggerScrollBehavior]="scrollBehavior()"
      [ngpPopoverTriggerCloseOnEscape]="closeOnEscape()"
      ngpPopoverTriggerPlacement="bottom"
    >
      Open Popover
    </button>
    <div class="spacer"></div>

    <ng-template #content>
      <div ngpPopover>Popover content</div>
    </ng-template>
  `,
  styles: `
    .spacer {
      height: 600px;
    }

    [ngpPopover] {
      position: fixed;
      width: 120px;
      height: 60px;
    }
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class ReactiveOptionsComponent {
  readonly offset = signal<NgpOffset>(4);
  readonly scrollBehavior = signal<NgpScrollBehavior>('reposition');
  readonly closeOnEscape = signal(true);
}

/**
 * An overlay is built on the first open and reused after that, so options were previously
 * snapshotted at that moment and a consumer binding stopped reaching the overlay.
 */
describe('overlay options', () => {
  afterEach(() => {
    document.querySelectorAll('[ngpPopover]').forEach(el => el.remove());
    window.scrollTo(0, 0);
  });

  function popover(): HTMLElement | null {
    return document.querySelector('[ngpPopover]');
  }

  async function open(trigger: HTMLElement): Promise<void> {
    fireEvent.click(trigger);
    await waitFor(() => expect(popover()).toBeInTheDocument());
  }

  it('should reposition an open overlay when the offset changes', async () => {
    const { getByRole, fixture } = await render(ReactiveOptionsComponent);
    const trigger = getByRole('button');

    await open(trigger);

    await waitFor(() =>
      expect(popover()!.getBoundingClientRect().top).toBeCloseTo(
        trigger.getBoundingClientRect().bottom + 4,
        0,
      ),
    );

    fixture.componentInstance.offset.set(40);
    fixture.detectChanges();

    await waitFor(() =>
      expect(popover()!.getBoundingClientRect().top).toBeCloseTo(
        trigger.getBoundingClientRect().bottom + 40,
        0,
      ),
    );
  });

  it('should apply a scroll behaviour changed between opens', async () => {
    const { getByRole, fixture } = await render(ReactiveOptionsComponent);
    const trigger = getByRole('button');
    const root = document.documentElement;

    await open(trigger);
    expect(root.style.position).not.toBe('fixed');

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(popover()).not.toBeInTheDocument());

    fixture.componentInstance.scrollBehavior.set('block');
    fixture.detectChanges();

    await open(trigger);
    // BlockScrollStrategy pins the document while the overlay is open.
    await waitFor(() => expect(root.style.position).toBe('fixed'));

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(root.style.position).not.toBe('fixed'));
  });

  it('should honour a dismiss guard changed after the overlay was first opened', async () => {
    const { getByRole, fixture } = await render(ReactiveOptionsComponent);
    const trigger = getByRole('button');

    await open(trigger);
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(popover()).not.toBeInTheDocument());

    fixture.componentInstance.closeOnEscape.set(false);
    fixture.detectChanges();

    await open(trigger);
    fireEvent.keyDown(document, { key: 'Escape' });

    // The guard is read at dismiss time, so the overlay stays put.
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(popover()).toBeInTheDocument();
  });
});

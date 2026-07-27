import { Component, signal } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { afterEach, describe, expect, it } from 'vitest';
import { NgpOffset, NgpScrollBehavior } from '../../index';

@Component({
  template: `
    <div class="spacer-top"></div>
    <button
      [ngpPopoverTrigger]="content"
      [ngpPopoverTriggerOffset]="offset()"
      [ngpPopoverTriggerScrollBehavior]="scrollBehavior()"
      [ngpPopoverTriggerCloseOnEscape]="closeOnEscape()"
      ngpPopoverTriggerPlacement="bottom"
    >
      Open Popover
    </button>
    <div class="spacer-bottom"></div>

    <ng-template #content>
      <div ngpPopover>Popover content</div>
    </ng-template>
  `,
  styles: `
    /* Keep the trigger near the top so it stays in view - an off-screen trigger makes
       the panel flip and the offset assertions measure the wrong edge. */
    .spacer-top {
      height: 20vh;
    }

    .spacer-bottom {
      height: 300vh;
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
 *
 * `close` is used as the representative scroll behaviour rather than `block`: it is
 * observable through this fixture's own overlay, where `block` is only observable through
 * inline styles on `<html>` that any other suite sharing the page can disturb.
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

    // 'reposition' (the initial value) follows the trigger rather than dismissing.
    await open(trigger);
    window.dispatchEvent(new Event('scroll'));
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(popover()).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(popover()).not.toBeInTheDocument());

    fixture.componentInstance.scrollBehavior.set('close');
    fixture.detectChanges();

    // The strategy is built when the overlay opens, so the new value takes effect here.
    await open(trigger);
    window.dispatchEvent(new Event('scroll'));

    await waitFor(() => expect(popover()).not.toBeInTheDocument());
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

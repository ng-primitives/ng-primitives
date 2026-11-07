import { FocusOrigin } from '@angular/cdk/a11y';
import { Component, signal, viewChild } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { NgpOverlayFinalFocus } from 'ng-primitives/portal';
import { describe, expect, it } from 'vitest';
import { userEvent as browserUserEvent } from 'vitest/browser';

@Component({
  template: `
    @if (showTrigger()) {
      <button [ngpPopoverTrigger]="content" data-testid="trigger">Open</button>
    }
    <input data-testid="other" />
    <input data-testid="outside" />

    <ng-template #content>
      <div [ngpPopoverFinalFocus]="finalFocus()" ngpPopover data-testid="popover">
        <button data-testid="inside">Inside</button>
      </div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class FinalFocusComponent {
  readonly showTrigger = signal(true);
  readonly finalFocus = signal<NgpOverlayFinalFocus | null>(null);
  readonly trigger = viewChild(NgpPopoverTrigger);
}

async function setup(finalFocus: (other: HTMLElement) => NgpOverlayFinalFocus | null = () => null) {
  const { fixture } = await render(FinalFocusComponent);
  const other = screen.getByTestId('other');
  fixture.componentInstance.finalFocus.set(finalFocus(other));
  fixture.detectChanges();
  return { component: fixture.componentInstance, fixture, other };
}

async function openWithClick() {
  await userEvent.click(screen.getByTestId('trigger'));
  await waitFor(() => expect(screen.getByTestId('inside')).toHaveFocus());
}

async function closed() {
  await waitFor(() => expect(screen.queryByTestId('popover')).not.toBeInTheDocument());
}

@Component({
  template: `
    <button [ngpPopoverTrigger]="useFirst() ? first : second" data-testid="trigger">Open</button>
    <input #other data-testid="other" />

    <ng-template #first>
      <div [ngpPopoverFinalFocus]="other" ngpPopover data-testid="first">First</div>
    </ng-template>
    <ng-template #second>
      <div data-testid="second">Second</div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class SwappedContentComponent {
  readonly useFirst = signal(true);
}

describe('NgpPopover final focus', () => {
  it('focuses the element focused before opening when the trigger is gone', async () => {
    const { component, fixture, other } = await setup();

    other.focus();
    await component.trigger()!.show();
    await waitFor(() => expect(screen.getByTestId('inside')).toHaveFocus());

    component.showTrigger.set(false);
    fixture.detectChanges();
    await closed();

    expect(other).toHaveFocus();
  });

  it('focuses the finalFocus element when the trigger is removed while open', async () => {
    const { component, fixture, other } = await setup(other => other);
    await openWithClick();

    // the trigger's view goes, and the popover content with it, before the overlay closes
    component.showTrigger.set(false);
    fixture.detectChanges();
    await closed();

    expect(other).toHaveFocus();
  });

  it('focuses the finalFocus element on close', async () => {
    const { other } = await setup(other => other);
    await openWithClick();

    await userEvent.keyboard('{Escape}');
    await closed();

    expect(other).toHaveFocus();
  });

  it('calls a finalFocus function with the close origin', async () => {
    const origins: FocusOrigin[] = [];
    const { other } = await setup(other => origin => {
      origins.push(origin);
      return other;
    });
    await openWithClick();

    await userEvent.keyboard('{Escape}');
    await closed();

    expect(origins).toEqual(['keyboard']);
    expect(other).toHaveFocus();
  });

  it('lets an outside press on a control win over the finalFocus element', async () => {
    await setup(other => other);
    await openWithClick();

    const outside = screen.getByTestId('outside');
    await browserUserEvent.click(outside);
    await closed();

    expect(outside).toHaveFocus();
  });

  it('skips focus restoration when finalFocus is false', async () => {
    await setup(() => false);
    await openWithClick();

    await userEvent.keyboard('{Escape}');
    await closed();

    expect(screen.getByTestId('trigger')).not.toHaveFocus();
  });

  it("drops the replaced content's finalFocus when new content takes its place", async () => {
    const { fixture } = await render(SwappedContentComponent);
    const trigger = screen.getByTestId('trigger');
    await userEvent.click(trigger);
    await screen.findByTestId('first');

    fixture.componentInstance.useFirst.set(false);
    await screen.findByTestId('second');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByTestId('second')).not.toBeInTheDocument());

    expect(trigger).toHaveFocus();
  });
});

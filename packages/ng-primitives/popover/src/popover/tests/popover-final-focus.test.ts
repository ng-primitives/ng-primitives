import { FocusOrigin } from '@angular/cdk/a11y';
import { Component, signal, viewChild } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { NgpOverlayFinalFocus } from 'ng-primitives/portal';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

@Component({
  template: `
    @if (showTrigger()) {
      <button [ngpPopoverTrigger]="content" data-testid="trigger">Open</button>
    }
    <input data-testid="other" />

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

  it('skips focus restoration when finalFocus is false', async () => {
    await setup(() => false);
    await openWithClick();

    await userEvent.keyboard('{Escape}');
    await closed();

    expect(screen.getByTestId('trigger')).not.toHaveFocus();
  });
});

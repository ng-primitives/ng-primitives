import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { NgpDialog, NgpDialogOverlay, NgpDialogTrigger } from 'ng-primitives/dialog';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { NgpTooltip, NgpTooltipTrigger } from 'ng-primitives/tooltip';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

@Component({
  template: `
    <button
      [ngpDialogTrigger]="dialog"
      [ngpTooltipTrigger]="tooltip"
      ngpTooltipTriggerShowDelay="0"
      data-testid="dialog-trigger"
    >
      Launch dialog
    </button>
    <button
      [ngpPopoverTrigger]="popover"
      [ngpTooltipTrigger]="tooltip"
      ngpTooltipTriggerShowDelay="0"
      data-testid="popover-trigger"
    >
      Launch popover
    </button>
    <button data-testid="elsewhere">Elsewhere</button>

    <ng-template #tooltip>
      <div ngpTooltip>Tooltip</div>
    </ng-template>

    <ng-template #dialog let-close="close">
      <div ngpDialogOverlay>
        <div ngpDialog>
          <button (click)="close()" data-testid="close">Close</button>
        </div>
      </div>
    </ng-template>

    <ng-template #popover>
      <div ngpPopover>
        <button data-testid="popover-content">Popover content</button>
      </div>
    </ng-template>
  `,
  imports: [
    NgpDialogTrigger,
    NgpDialog,
    NgpDialogOverlay,
    NgpPopoverTrigger,
    NgpPopover,
    NgpTooltipTrigger,
    NgpTooltip,
  ],
})
class TooltipFocusComponent {}

@Component({
  template: `
    <button
      [ngpPopoverTrigger]="popover"
      [ngpTooltipTrigger]="tooltip"
      [ngpTooltipTriggerDisabled]="disabled()"
      ngpTooltipTriggerShowDelay="0"
      data-testid="popover-trigger"
    >
      Launch popover
    </button>

    <ng-template #tooltip>
      <div ngpTooltip>Tooltip</div>
    </ng-template>

    <ng-template #popover>
      <div ngpPopover>
        <button data-testid="popover-content">Popover content</button>
      </div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover, NgpTooltipTrigger, NgpTooltip],
})
class DisabledTooltipFocusComponent {
  readonly disabled = signal(true);
}

const tooltip = () => document.querySelector('[ngpTooltip]');

/** Long enough for a tooltip with no show delay to have opened. */
const settle = () => new Promise(resolve => setTimeout(resolve, 100));

describe('NgpTooltipTrigger focus', () => {
  it('opens when the user tabs onto the trigger', async () => {
    const { getByTestId } = await render(TooltipFocusComponent);

    await userEvent.keyboard('{Tab}');

    expect(getByTestId('dialog-trigger')).toHaveFocus();
    await waitFor(() => expect(tooltip()).toBeInTheDocument());
  });

  it('stays closed when a dialog closed with Escape hands focus back', async () => {
    const { getByTestId } = await render(TooltipFocusComponent);
    const trigger = getByTestId('dialog-trigger');

    await userEvent.keyboard('{Tab}');
    await waitFor(() => expect(tooltip()).toBeInTheDocument());
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(document.querySelector('[ngpDialog]')).toBeInTheDocument());
    await waitFor(() => expect(tooltip()).not.toBeInTheDocument());

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(trigger).toHaveFocus());
    await settle();
    expect(tooltip()).not.toBeInTheDocument();
  });

  it('stays closed when a dialog closed with its close button hands focus back', async () => {
    const { getByTestId } = await render(TooltipFocusComponent);
    const trigger = getByTestId('dialog-trigger');

    await userEvent.click(trigger);
    await waitFor(() => expect(document.querySelector('[ngpDialog]')).toBeInTheDocument());
    await waitFor(() => expect(tooltip()).not.toBeInTheDocument());

    await userEvent.click(screen.getByTestId('close'));
    await userEvent.hover(getByTestId('elsewhere'));

    await waitFor(() => expect(trigger).toHaveFocus());
    await settle();
    expect(tooltip()).not.toBeInTheDocument();
  });

  it('stays closed when a popover closed with Escape hands focus back', async () => {
    const { getByTestId } = await render(TooltipFocusComponent);
    const trigger = getByTestId('popover-trigger');

    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard('{Tab}');
    expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(document.querySelector('[ngpPopover]')).toBeInTheDocument());
    await waitFor(() => expect(tooltip()).not.toBeInTheDocument());

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(trigger).toHaveFocus());
    await settle();
    expect(tooltip()).not.toBeInTheDocument();
  });

  it('opens on programmatic focus, as when a screen reader moves focus with no keydown', async () => {
    const { getByTestId } = await render(TooltipFocusComponent);
    const trigger = getByTestId('dialog-trigger');

    trigger.focus();

    expect(trigger).toHaveFocus();
    await waitFor(() => expect(tooltip()).toBeInTheDocument());
  });

  it('stays closed when re-enabled on focus a popover handed back while it was disabled', async () => {
    const { fixture, getByTestId } = await render(DisabledTooltipFocusComponent);
    const trigger = getByTestId('popover-trigger');

    await userEvent.keyboard('{Tab}');
    expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(document.querySelector('[ngpPopover]')).toBeInTheDocument());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());

    fixture.componentInstance.disabled.set(false);
    fixture.detectChanges();

    await settle();
    expect(tooltip()).not.toBeInTheDocument();
  });

  it('opens when re-enabled on focus the user tabbed to while it was disabled', async () => {
    const { fixture, getByTestId } = await render(DisabledTooltipFocusComponent);

    await userEvent.keyboard('{Tab}');
    expect(getByTestId('popover-trigger')).toHaveFocus();

    fixture.componentInstance.disabled.set(false);
    fixture.detectChanges();

    await waitFor(() => expect(tooltip()).toBeInTheDocument());
  });
});

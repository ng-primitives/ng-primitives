import { Component, signal } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { describe, expect, it } from 'vitest';

@Component({
  template: `
    <button [ngpPopoverTrigger]="content" [attr.id]="triggerId()" data-testid="trigger">
      Settings
    </button>

    <ng-template #content>
      <div
        [attr.aria-label]="label()"
        [attr.aria-labelledby]="labelledBy()"
        ngpPopover
        data-testid="popover"
      >
        Popover content
      </div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class PopoverNameTestComponent {
  readonly triggerId = signal<string | null>(null);
  readonly label = signal<string | null>(null);
  readonly labelledBy = signal<string | null>(null);
}

@Component({
  template: `
    <button [ngpPopoverTrigger]="content" data-testid="trigger">Settings</button>

    <ng-template #content>
      <div ngpPopover aria-label="Static name" data-testid="popover">Popover content</div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class PopoverStaticLabelTestComponent {}

async function open(): Promise<HTMLElement> {
  fireEvent.click(screen.getByTestId('trigger'));
  await waitFor(() => expect(screen.getByTestId('popover')).toBeInTheDocument());
  return screen.getByTestId('popover');
}

describe('NgpPopover accessible name', () => {
  it('should be labelled by its trigger by default', async () => {
    await render(PopoverNameTestComponent);
    const popover = await open();
    const trigger = screen.getByTestId('trigger');

    expect(trigger.id).not.toBe('');
    await waitFor(() => expect(popover).toHaveAttribute('aria-labelledby', trigger.id));
    expect(popover).toHaveAccessibleName('Settings');
  });

  it('should keep an id the consumer gave the trigger', async () => {
    const { fixture } = await render(PopoverNameTestComponent);
    fixture.componentInstance.triggerId.set('settings-trigger');
    fixture.detectChanges();

    const popover = await open();

    expect(screen.getByTestId('trigger')).toHaveAttribute('id', 'settings-trigger');
    await waitFor(() => expect(popover).toHaveAttribute('aria-labelledby', 'settings-trigger'));
  });

  it('should not override a static aria-label', async () => {
    await render(PopoverStaticLabelTestComponent);
    const popover = await open();

    await new Promise(resolve => setTimeout(resolve));
    expect(popover).not.toHaveAttribute('aria-labelledby');
    expect(popover).toHaveAccessibleName('Static name');
  });

  it('should not override a bound aria-label', async () => {
    const { fixture } = await render(PopoverNameTestComponent);
    fixture.componentInstance.label.set('Bound name');
    fixture.detectChanges();

    const popover = await open();

    await new Promise(resolve => setTimeout(resolve));
    expect(popover).not.toHaveAttribute('aria-labelledby');
    expect(popover).toHaveAccessibleName('Bound name');
  });

  it('should not override a bound aria-labelledby', async () => {
    const { fixture } = await render(PopoverNameTestComponent);
    fixture.componentInstance.labelledBy.set('custom-heading');
    fixture.detectChanges();

    const popover = await open();

    await new Promise(resolve => setTimeout(resolve));
    expect(popover).toHaveAttribute('aria-labelledby', 'custom-heading');
  });
});

import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { claimEscapeKey } from 'ng-primitives/portal';
import { describe, expect, it } from 'vitest';

@Component({
  selector: 'test-inline-edit',
  template: `
    <input #field data-testid="field" />
  `,
})
class InlineEditComponent {
  /** The rendered instance, which lives in the overlay and is out of the fixture's reach. */
  static current: InlineEditComponent | null = null;

  readonly editing = signal(true);
  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');

  constructor() {
    InlineEditComponent.current = this;
    claimEscapeKey(
      event => this.editing() && event.composedPath()[0] === this.field()?.nativeElement,
    );
  }
}

@Component({
  imports: [NgpPopoverTrigger, NgpPopover, InlineEditComponent],
  template: `
    <button [ngpPopoverTrigger]="content">Open</button>
    <ng-template #content>
      <div ngpPopover>
        <test-inline-edit />
      </div>
    </ng-template>
  `,
})
class PopoverWithInlineEditComponent {}

describe('claimEscapeKey', () => {
  async function open() {
    const { getByRole } = await render(PopoverWithInlineEditComponent);
    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(document.querySelector('[ngpPopover]')).toBeInTheDocument());
    return document.querySelector<HTMLInputElement>('[data-testid="field"]')!;
  }

  it('keeps the popover open when a control inside it claims the Escape', async () => {
    const field = await open();

    fireEvent.keyDown(field, { key: 'Escape' });

    // give any close handler a chance to run, then assert it stayed open
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
  });

  it('closes the popover when the control declines to claim the Escape', async () => {
    const field = await open();
    InlineEditComponent.current!.editing.set(false);

    fireEvent.keyDown(field, { key: 'Escape' });

    await waitFor(() => expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument());
  });

  it('closes the popover on an Escape the control does not claim', async () => {
    await open();

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument());
  });
});

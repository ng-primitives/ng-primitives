import { Component, signal } from '@angular/core';
import { FormField as SignalFormField, FormRoot, form, required } from '@angular/forms/signals';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { describe, expect, it } from 'vitest';

/**
 * The reactive-forms suite covers `ControlContainer` not leaking into portalled overlay content.
 * Signal forms has no ambient container - the field tree is passed by value - so the equivalent
 * risk is a `[formField]` inside the overlay failing to bind at all.
 */

@Component({
  template: `
    <form [formRoot]="f">
      <button [ngpPopoverTrigger]="content" type="button">Open</button>
    </form>

    <ng-template #content>
      <div ngpPopover>
        <input [formField]="f.name" data-testid="overlay-input" />
      </div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover, SignalFormField, FormRoot],
})
class Host {
  readonly model = signal({ name: '' });
  readonly f = form(this.model, path => required(path.name));
}

describe('Popover with signal forms', () => {
  it('binds a field inside portalled overlay content', async () => {
    const { getByRole, fixture } = await render(Host);

    fireEvent.click(getByRole('button'));

    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
    });

    const input = document.querySelector<HTMLInputElement>('[data-testid="overlay-input"]')!;
    expect(input).toBeInTheDocument();

    input.value = 'Ada';
    fireEvent.input(input);
    await fixture.whenStable();

    expect(fixture.componentInstance.model().name).toBe('Ada');
    expect(fixture.componentInstance.f.name().valid()).toBe(true);
  });
});

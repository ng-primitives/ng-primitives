import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpListbox, NgpListboxOption, NgpListboxTrigger } from 'ng-primitives/listbox';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * `NgpListboxTrigger` sits on the popover trigger that hosts a listbox. Pressing
 * ArrowUp/ArrowDown on the trigger opens the popover so keyboard users can reach
 * the list without a pointer.
 */
describe('NgpListboxTrigger', () => {
  const imports = [NgpListbox, NgpListboxOption, NgpListboxTrigger, NgpPopover, NgpPopoverTrigger];

  const template = `
    <button [ngpPopoverTrigger]="dropdown" ngpListboxTrigger data-testid="trigger">Open</button>
    <ng-template #dropdown>
      <div ngpPopover ngpListbox aria-label="Fruit">
        <div ngpListboxOption ngpListboxOptionValue="a">A</div>
        <div ngpListboxOption ngpListboxOptionValue="b">B</div>
      </div>
    </ng-template>
  `;

  afterEach(() => {
    // Popover content attaches to the document body, not the fixture.
    document.querySelectorAll('[ngpPopover]').forEach(el => el.remove());
  });

  it('opens the popover on ArrowDown', async () => {
    const { getByTestId } = await render(template, { imports });
    const trigger = getByTestId('trigger');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(document.querySelector('[ngpListbox]')).not.toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    await waitFor(() => expect(document.querySelector('[ngpListbox]')).toBeInTheDocument());
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens the popover on ArrowUp', async () => {
    const { getByTestId } = await render(template, { imports });
    const trigger = getByTestId('trigger');

    fireEvent.keyDown(trigger, { key: 'ArrowUp' });

    await waitFor(() => expect(document.querySelector('[ngpListbox]')).toBeInTheDocument());
  });

  it('does not open the popover on other keys', async () => {
    const { getByTestId } = await render(template, { imports });
    const trigger = getByTestId('trigger');

    fireEvent.keyDown(trigger, { key: 'Enter' });
    fireEvent.keyDown(trigger, { key: 'a' });

    expect(document.querySelector('[ngpListbox]')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the popover when an option is selected in single mode', async () => {
    const { getByTestId } = await render(template, { imports });
    const trigger = getByTestId('trigger');

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    await waitFor(() => expect(document.querySelector('[ngpListbox]')).toBeInTheDocument());

    // selecting an option closes the popover in single-selection mode
    fireEvent.click(document.querySelector('[ngpListboxOption]')!);

    await waitFor(() => expect(document.querySelector('[ngpListbox]')).not.toBeInTheDocument());
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps the popover open when an option is selected in multiple mode', async () => {
    const multipleTemplate = `
      <button [ngpPopoverTrigger]="dropdown" ngpListboxTrigger data-testid="trigger">Open</button>
      <ng-template #dropdown>
        <div ngpPopover ngpListbox ngpListboxMode="multiple" aria-label="Fruit">
          <div ngpListboxOption ngpListboxOptionValue="a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b">B</div>
        </div>
      </ng-template>
    `;
    const { getByTestId } = await render(multipleTemplate, { imports });
    const trigger = getByTestId('trigger');

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    await waitFor(() => expect(document.querySelector('[ngpListbox]')).toBeInTheDocument());

    fireEvent.click(document.querySelector('[ngpListboxOption]')!);

    // in multiple-selection mode the popover stays open so more options can be picked
    expect(document.querySelector('[ngpListbox]')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});

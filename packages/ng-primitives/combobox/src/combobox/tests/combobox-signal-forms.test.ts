import { Component, signal } from '@angular/core';
import { FormField as SignalFormField, disabled, form, required } from '@angular/forms/signals';
import { fireEvent, render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { ComboboxFixture } from './combobox-forms.fixture';

afterEach(() => {
  // Dropdown is portalled to the body, so fixture.destroy() alone can leave it lingering.
  screen.queryByRole('listbox')?.remove();
});

/**
 * Read when the host is constructed, so a test can choose the field's starting value.
 * Signal forms builds the field tree from the model's own keys, and a key holding `undefined`
 * produces no subfield at all - so the empty value here is `null`.
 */
let initialValue: string | null = null;

@Component({
  imports: [ComboboxFixture, SignalFormField],
  template: `
    <app-combobox [options]="options" [formField]="f.fruit" />
  `,
})
class Host {
  readonly options = ['Apple', 'Banana', 'Cherry', 'Dragon Fruit', 'Elderberry'];
  readonly isDisabled = signal(false);
  readonly model = signal<{ fruit: string | null }>({ fruit: initialValue });
  readonly f = form(this.model, path => {
    disabled(path.fruit, () => this.isDisabled());
    required(path.fruit);
  });
}

function renderHost(fruit: string | null = null) {
  initialValue = fruit;
  return render(Host);
}

describe('Combobox (reusable component) — signal forms', () => {
  it('reflects the initial field value', async () => {
    const { fixture } = await renderHost('Cherry');
    await fixture.whenStable();

    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('Cherry');
    expect(fixture.componentInstance.f.fruit().value()).toBe('Cherry');
  });

  it('updates the model on selection and the DOM on a model change', async () => {
    const { fixture } = await renderHost();

    await userEvent.click(screen.getByTestId('combobox-button'));
    await userEvent.click(screen.getByText('Banana'));
    await fixture.whenStable();
    expect(fixture.componentInstance.model().fruit).toBe('Banana');

    fixture.componentInstance.model.set({ fruit: 'Dragon Fruit' });
    await fixture.whenStable();
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('Dragon Fruit');
  });

  it('reflects the disabled state from the field', async () => {
    const { fixture } = await renderHost('Apple');
    await fixture.whenStable();

    const combobox = screen.getByTestId('combobox');
    expect(combobox).not.toHaveAttribute('data-disabled');
    expect(screen.getByRole('combobox')).not.toBeDisabled();

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    expect(combobox).toHaveAttribute('data-disabled', '');
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('marks the field as touched on blur', async () => {
    const { fixture } = await renderHost('Apple');

    expect(fixture.componentInstance.f.fruit().touched()).toBe(false);

    fireEvent.blur(screen.getByTestId('combobox-input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.f.fruit().touched()).toBe(true);
  });

  it('clears the value when the model is cleared', async () => {
    const { fixture } = await renderHost('Apple');
    await fixture.whenStable();
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('Apple');

    fixture.componentInstance.model.set({ fruit: null });
    await fixture.whenStable();

    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('');
  });

  it('clears the model when the input is emptied then closed', async () => {
    const { fixture } = await renderHost('Apple');
    await fixture.whenStable();

    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toBe('Apple');

    await userEvent.click(screen.getByTestId('combobox-button'));
    await userEvent.clear(input);
    await userEvent.click(document.body);
    await fixture.whenStable();

    expect(input.value).toBe('');
    expect(fixture.componentInstance.model().fruit).toBeNull();
    // the field must survive the clear - signal forms drops a key whose value is `undefined`
    expect(fixture.componentInstance.f.fruit().invalid()).toBe(true);
  });

  it('reports validation errors from the field', async () => {
    const { fixture } = await renderHost();
    const field = fixture.componentInstance.f.fruit;

    expect(field().invalid()).toBe(true);
    expect(field().errors()[0].kind).toBe('required');

    await userEvent.click(screen.getByTestId('combobox-button'));
    await userEvent.click(screen.getByText('Banana'));
    await fixture.whenStable();

    expect(field().valid()).toBe(true);
  });
});

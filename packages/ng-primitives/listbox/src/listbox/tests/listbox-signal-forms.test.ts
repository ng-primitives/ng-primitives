import { Component, signal } from '@angular/core';
import { FormField as SignalFormField, disabled, form, minLength } from '@angular/forms/signals';
import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { Listbox, ListboxOption } from './listbox-forms.fixture';

/** Read when the host is constructed, so a test can choose the field's starting value. */
let initialValue: string[] = [];

@Component({
  imports: [Listbox, ListboxOption, SignalFormField],
  template: `
    <app-listbox [formField]="f.fruit" [mode]="mode()" aria-label="Fruit">
      <app-listbox-option value="apple">Apple</app-listbox-option>
      <app-listbox-option value="banana">Banana</app-listbox-option>
    </app-listbox>
  `,
})
class Host {
  readonly mode = signal<'single' | 'multiple'>('single');
  readonly isDisabled = signal(false);
  readonly model = signal({ fruit: initialValue });
  readonly f = form(this.model, path => {
    disabled(path.fruit, () => this.isDisabled());
    // `required` treats only ''/false/null as empty, so an empty array needs minLength.
    minLength(path.fruit, 1);
  });
}

function renderHost(fruit: string[] = []) {
  initialValue = fruit;
  return render(Host);
}

describe('Listbox (reusable component) — signal forms', () => {
  it('reflects the initial field value', async () => {
    const { getByRole, fixture } = await renderHost(['apple']);
    await fixture.whenStable();

    expect(getByRole('option', { name: 'Apple' })).toHaveAttribute('data-selected', '');
    expect(fixture.componentInstance.f.fruit().value()).toEqual(['apple']);
  });

  it('updates the model on click', async () => {
    const { getByRole, fixture } = await renderHost();
    await fixture.whenStable();

    const apple = getByRole('option', { name: 'Apple' });
    fireEvent.click(apple);
    await fixture.whenStable();

    expect(fixture.componentInstance.model().fruit).toEqual(['apple']);
    expect(apple).toHaveAttribute('data-selected', '');
  });

  it('accumulates the model value on click in multiple mode', async () => {
    const { getByRole, fixture } = await renderHost();
    fixture.componentInstance.mode.set('multiple');
    await fixture.whenStable();

    fireEvent.click(getByRole('option', { name: 'Apple' }));
    fireEvent.click(getByRole('option', { name: 'Banana' }));
    await fixture.whenStable();

    expect(fixture.componentInstance.model().fruit).toEqual(['apple', 'banana']);
  });

  it('reflects the DOM when the model value is set', async () => {
    const { getByRole, fixture } = await renderHost();
    await fixture.whenStable();

    fixture.componentInstance.model.set({ fruit: ['banana'] });
    await fixture.whenStable();

    expect(getByRole('option', { name: 'Banana' })).toHaveAttribute('data-selected', '');
  });

  it('clears the selection when the model is emptied', async () => {
    const { getByRole, fixture } = await renderHost(['apple']);
    await fixture.whenStable();
    expect(getByRole('option', { name: 'Apple' })).toHaveAttribute('data-selected', '');

    fixture.componentInstance.model.set({ fruit: [] });
    await fixture.whenStable();

    expect(getByRole('option', { name: 'Apple' })).not.toHaveAttribute('data-selected');
  });

  it('reflects the disabled state from the field', async () => {
    const { getByRole, fixture } = await renderHost();
    await fixture.whenStable();

    expect(getByRole('listbox')).toHaveAttribute('aria-disabled', 'false');

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    expect(getByRole('listbox')).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not allow selection while the field is disabled', async () => {
    const { getByRole, fixture } = await renderHost();
    await fixture.whenStable();

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    fireEvent.click(getByRole('option', { name: 'Apple' }));
    await fixture.whenStable();

    expect(fixture.componentInstance.model().fruit).toEqual([]);
    expect(getByRole('option', { name: 'Apple' })).not.toHaveAttribute('data-selected');
  });

  it('marks the field as touched on focusout', async () => {
    const { getByRole, fixture } = await renderHost();
    await fixture.whenStable();

    expect(fixture.componentInstance.f.fruit().touched()).toBe(false);

    fireEvent.focusOut(getByRole('listbox'));
    await fixture.whenStable();

    expect(fixture.componentInstance.f.fruit().touched()).toBe(true);
  });

  it('reports validation errors from the field', async () => {
    const { getByRole, fixture } = await renderHost();
    await fixture.whenStable();
    const field = fixture.componentInstance.f.fruit;

    expect(field().invalid()).toBe(true);
    expect(field().errors()[0].kind).toBe('minLength');

    fireEvent.click(getByRole('option', { name: 'Apple' }));
    await fixture.whenStable();

    expect(field().valid()).toBe(true);
  });
});

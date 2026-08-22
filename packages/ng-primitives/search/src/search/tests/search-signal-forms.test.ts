import { Component, signal } from '@angular/core';
import {
  FormField as SignalFormField,
  disabled,
  form,
  minLength,
  required,
} from '@angular/forms/signals';
import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { SearchFixture } from './search-forms.fixture';

/** Read when the host is constructed, so a test can choose the field's starting value. */
let initialValue = '';

@Component({
  imports: [SearchFixture, SignalFormField],
  template: `
    <app-search [formField]="f.query" />
  `,
})
class Host {
  readonly isDisabled = signal(false);
  readonly model = signal({ query: initialValue });
  readonly f = form(this.model, path => {
    disabled(path.query, () => this.isDisabled());
    required(path.query);
    minLength(path.query, 3);
  });
}

function renderHost(query = '') {
  initialValue = query;
  return render(Host);
}

describe('Search (reusable component) — signal forms', () => {
  it('reflects the initial field value', async () => {
    const { getByRole, fixture } = await renderHost('hello');
    await fixture.whenStable();

    expect(getByRole('searchbox')).toHaveValue('hello');
    expect(fixture.componentInstance.f.query().value()).toBe('hello');
  });

  it('updates the model as the user types', async () => {
    const { getByRole, fixture } = await renderHost();
    const input = getByRole('searchbox') as HTMLInputElement;

    input.value = 'world';
    fireEvent.input(input);
    await fixture.whenStable();

    expect(fixture.componentInstance.model().query).toBe('world');
  });

  it('writes a new value into the field on a model change', async () => {
    const { getByRole, fixture } = await renderHost();

    fixture.componentInstance.model.set({ query: 'world' });
    await fixture.whenStable();

    expect(getByRole('searchbox')).toHaveValue('world');
  });

  it('clears the field when the model is cleared', async () => {
    const { getByRole, fixture } = await renderHost('hello');
    await fixture.whenStable();
    expect(getByRole('searchbox')).toHaveValue('hello');

    fixture.componentInstance.model.set({ query: '' });
    await fixture.whenStable();

    expect(getByRole('searchbox')).toHaveValue('');
  });

  it('marks the field as touched on focusout', async () => {
    const { getByRole, fixture } = await renderHost();

    expect(fixture.componentInstance.f.query().touched()).toBe(false);

    fireEvent.focusOut(getByRole('searchbox'));
    await fixture.whenStable();

    expect(fixture.componentInstance.f.query().touched()).toBe(true);
  });

  it('disables the input when the field is disabled', async () => {
    const { getByRole, fixture } = await renderHost('hello');
    const input = getByRole('searchbox') as HTMLInputElement;

    expect(input.disabled).toBe(false);

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    expect(input.disabled).toBe(true);
  });

  it('does not clear the field via the clear button while the field is disabled', async () => {
    const { getByRole, fixture } = await renderHost('hello');
    await fixture.whenStable();

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    fireEvent.click(getByRole('button', { name: 'Clear search' }));
    await fixture.whenStable();

    expect(fixture.componentInstance.model().query).toBe('hello');
  });

  it('reports validation errors from the field', async () => {
    const { getByRole, fixture } = await renderHost();
    const field = fixture.componentInstance.f.query;

    expect(field().invalid()).toBe(true);
    expect(
      field()
        .errors()
        .map(error => error.kind),
    ).toContain('required');

    const input = getByRole('searchbox') as HTMLInputElement;
    input.value = 'ab';
    fireEvent.input(input);
    await fixture.whenStable();

    expect(
      field()
        .errors()
        .map(error => error.kind),
    ).toContain('minLength');

    input.value = 'abc';
    fireEvent.input(input);
    await fixture.whenStable();

    expect(field().valid()).toBe(true);
  });
});

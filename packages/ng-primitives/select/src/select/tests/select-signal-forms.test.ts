import { Component, signal } from '@angular/core';
import { FormField as SignalFormField, disabled, form, required } from '@angular/forms/signals';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { SelectFixture } from './select-forms.fixture';

function removeLingeringDropdown(): void {
  // Dropdown is portalled to the body, so fixture.destroy() alone can leave
  // it lingering between tests.
  screen.queryByRole('listbox')?.remove();
}

/**
 * Read when the host is constructed, so a test can choose the field's starting value.
 * Signal forms builds the field tree from the model's own keys, and a key holding `undefined`
 * produces no subfield at all - so the empty value here is `''`, which the fixture also treats
 * as "nothing selected".
 */
let initialValue = '';

@Component({
  imports: [SelectFixture, SignalFormField],
  template: `
    <app-select [options]="options" [formField]="f.fruit" />
  `,
})
class Host {
  readonly options = ['Apple', 'Banana'];
  readonly isDisabled = signal(false);
  readonly model = signal({ fruit: initialValue });
  readonly f = form(this.model, path => {
    disabled(path.fruit, () => this.isDisabled());
    required(path.fruit);
  });
}

@Component({
  imports: [SelectFixture, SignalFormField],
  template: `
    <app-select [options]="options" [multiple]="true" [formField]="f.fruits" />
  `,
})
class MultipleHost {
  readonly options = ['Apple', 'Banana', 'Cherry'];
  readonly model = signal<{ fruits: string[] }>({ fruits: [] });
  readonly f = form(this.model);
}

function renderHost(fruit = '') {
  initialValue = fruit;
  return render(Host);
}

describe('Select (reusable component) — signal forms', () => {
  afterEach(removeLingeringDropdown);

  it('reflects the initial field value', async () => {
    const { fixture } = await renderHost('Apple');

    expect(screen.getByTestId('select-value')).toHaveTextContent('Apple');
    expect(fixture.componentInstance.f.fruit().value()).toBe('Apple');
  });

  it('updates the model on user selection and the DOM on a model change', async () => {
    const user = userEvent.setup();
    const { fixture } = await renderHost();

    await user.click(screen.getByTestId('select'));
    await user.click(screen.getByTestId('option-Banana'));
    await fixture.whenStable();

    expect(fixture.componentInstance.model().fruit).toBe('Banana');
    expect(screen.getByTestId('select-value')).toHaveTextContent('Banana');

    fixture.componentInstance.model.set({ fruit: 'Apple' });
    await fixture.whenStable();
    expect(screen.getByTestId('select-value')).toHaveTextContent('Apple');

    fixture.componentInstance.model.set({ fruit: '' });
    await fixture.whenStable();
    expect(screen.getByTestId('select-placeholder')).toBeInTheDocument();
  });

  it('reflects the disabled state from the field', async () => {
    const { fixture } = await renderHost();

    expect(screen.getByTestId('select')).not.toHaveAttribute('data-disabled');

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();
    expect(screen.getByTestId('select')).toHaveAttribute('data-disabled');

    fixture.componentInstance.isDisabled.set(false);
    await fixture.whenStable();
    expect(screen.getByTestId('select')).not.toHaveAttribute('data-disabled');
  });

  it('supports multiple selection bound to a string[] field', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(MultipleHost);

    await user.click(screen.getByTestId('select'));
    await user.click(screen.getByTestId('option-Apple'));
    await user.click(screen.getByTestId('option-Cherry'));
    await fixture.whenStable();

    expect(fixture.componentInstance.model().fruits).toEqual(['Apple', 'Cherry']);
    expect(screen.getByTestId('select-value')).toHaveTextContent('Apple, Cherry');
  });

  it('marks the field as touched on blur', async () => {
    const user = userEvent.setup();
    const { fixture } = await renderHost();

    expect(fixture.componentInstance.f.fruit().touched()).toBe(false);

    await user.click(screen.getByTestId('select'));
    await user.click(document.body);
    await fixture.whenStable();

    expect(fixture.componentInstance.f.fruit().touched()).toBe(true);
  });

  it('reports validation errors from the field', async () => {
    const user = userEvent.setup();
    const { fixture } = await renderHost();
    const field = fixture.componentInstance.f.fruit;

    expect(field().invalid()).toBe(true);
    expect(field().errors()[0].kind).toBe('required');

    await user.click(screen.getByTestId('select'));
    await user.click(screen.getByTestId('option-Banana'));
    await fixture.whenStable();

    expect(field().valid()).toBe(true);
  });
});

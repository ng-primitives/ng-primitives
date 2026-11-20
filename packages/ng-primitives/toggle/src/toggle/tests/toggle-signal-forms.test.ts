import { Component, signal } from '@angular/core';
import { FormField as SignalFormField, disabled, form, validate } from '@angular/forms/signals';
import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { Toggle } from './toggle-forms.fixture';

/** Read when the host is constructed, so a test can choose the field's starting value. */
let initialValue = false;

@Component({
  imports: [Toggle, SignalFormField],
  template: `
    <button [formField]="f.bold" app-toggle>Toggle</button>
  `,
})
class Host {
  readonly isDisabled = signal(false);
  readonly model = signal({ bold: initialValue });
  readonly f = form(this.model, path => {
    disabled(path.bold, () => this.isDisabled());
    validate(path.bold, ({ value }) => (value() ? undefined : { kind: 'mustSelect' }));
  });
}

function renderHost(bold = false) {
  initialValue = bold;
  return render(Host);
}

describe('Toggle (reusable component) — signal forms', () => {
  it('reflects the initial field value', async () => {
    const { getByRole, fixture } = await renderHost(true);
    const button = getByRole('button');

    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAttribute('data-selected', '');
    expect(fixture.componentInstance.f.bold().value()).toBe(true);
  });

  it('updates the model on click and the DOM on a model change', async () => {
    const { getByRole, fixture } = await renderHost();
    const button = getByRole('button');

    fireEvent.click(button);
    await fixture.whenStable();
    expect(fixture.componentInstance.model().bold).toBe(true);
    expect(button).toHaveAttribute('aria-pressed', 'true');

    fixture.componentInstance.model.set({ bold: false });
    await fixture.whenStable();
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('reflects the disabled state from the field', async () => {
    const { getByRole, fixture } = await renderHost();
    const button = getByRole('button');

    expect(button).not.toHaveAttribute('data-disabled');

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('data-disabled', '');
    expect(button).toBeDisabled();
  });

  it('does not toggle while the field is disabled', async () => {
    const { getByRole, fixture } = await renderHost();
    const button = getByRole('button');

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    fireEvent.click(button);
    await fixture.whenStable();

    expect(fixture.componentInstance.model().bold).toBe(false);
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('marks the field as touched on focusout', async () => {
    const { getByRole, fixture } = await renderHost();

    expect(fixture.componentInstance.f.bold().touched()).toBe(false);

    fireEvent.focusOut(getByRole('button'));
    await fixture.whenStable();

    expect(fixture.componentInstance.f.bold().touched()).toBe(true);
  });

  it('reports validation errors from the field', async () => {
    const { getByRole, fixture } = await renderHost();
    const field = fixture.componentInstance.f.bold;

    expect(field().invalid()).toBe(true);
    expect(field().errors()[0].kind).toBe('mustSelect');

    fireEvent.click(getByRole('button'));
    await fixture.whenStable();

    expect(field().valid()).toBe(true);
  });
});

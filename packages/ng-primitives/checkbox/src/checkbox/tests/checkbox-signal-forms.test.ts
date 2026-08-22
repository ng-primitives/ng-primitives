import { Component, signal } from '@angular/core';
import { FormField as SignalFormField, disabled, form, validate } from '@angular/forms/signals';
import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { CheckboxFixture } from './checkbox-forms.fixture';

/** Read when the host is constructed, so a test can choose the field's starting value. */
let initialValue = false;

@Component({
  imports: [CheckboxFixture, SignalFormField],
  template: `
    <app-checkbox [formField]="f.agreed" />
  `,
})
class Host {
  readonly isDisabled = signal(false);
  readonly model = signal({ agreed: initialValue });
  readonly f = form(this.model, path => {
    disabled(path.agreed, () => this.isDisabled());
    validate(path.agreed, ({ value }) => (value() ? undefined : { kind: 'mustAccept' }));
  });
}

function renderHost(agreed = false) {
  initialValue = agreed;
  return render(Host);
}

describe('Checkbox (reusable component) — signal forms', () => {
  it('reflects the initial field value', async () => {
    const { getByRole, fixture } = await renderHost(true);

    expect(getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
    expect(fixture.componentInstance.f.agreed().value()).toBe(true);
  });

  it('updates the model on click and the DOM on a model change', async () => {
    const { getByRole, fixture } = await renderHost();
    const checkbox = getByRole('checkbox');

    fireEvent.click(checkbox);
    await fixture.whenStable();
    expect(fixture.componentInstance.model().agreed).toBe(true);
    expect(checkbox).toHaveAttribute('aria-checked', 'true');

    fixture.componentInstance.model.set({ agreed: false });
    await fixture.whenStable();
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  it('reflects the disabled state from the field', async () => {
    const { getByRole, fixture } = await renderHost();

    expect(getByRole('checkbox')).not.toHaveAttribute('data-disabled');

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();
    expect(getByRole('checkbox')).toHaveAttribute('data-disabled', '');
  });

  it('does not toggle while the field is disabled', async () => {
    const { getByRole, fixture } = await renderHost();
    const checkbox = getByRole('checkbox');

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    fireEvent.click(checkbox);
    await fixture.whenStable();
    expect(fixture.componentInstance.model().agreed).toBe(false);
    expect(checkbox).toHaveAttribute('aria-checked', 'false');

    fixture.componentInstance.isDisabled.set(false);
    await fixture.whenStable();

    fireEvent.click(checkbox);
    await fixture.whenStable();
    expect(fixture.componentInstance.model().agreed).toBe(true);
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });

  it('marks the field as touched on focusout', async () => {
    const { getByRole, fixture } = await renderHost();

    expect(fixture.componentInstance.f.agreed().touched()).toBe(false);

    fireEvent.focusOut(getByRole('checkbox'));
    await fixture.whenStable();

    expect(fixture.componentInstance.f.agreed().touched()).toBe(true);
  });

  it('reports validation errors from the field', async () => {
    const { getByRole, fixture } = await renderHost();
    const field = fixture.componentInstance.f.agreed;

    expect(field().invalid()).toBe(true);
    expect(field().errors()[0].kind).toBe('mustAccept');

    fireEvent.click(getByRole('checkbox'));
    await fixture.whenStable();

    expect(field().valid()).toBe(true);
    expect(field().errors()).toEqual([]);
  });

  it('clears the touched and dirty state on reset', async () => {
    const { getByRole, fixture } = await renderHost();
    const field = fixture.componentInstance.f.agreed;

    fireEvent.click(getByRole('checkbox'));
    fireEvent.focusOut(getByRole('checkbox'));
    await fixture.whenStable();
    expect(field().dirty()).toBe(true);
    expect(field().touched()).toBe(true);

    field().reset();
    await fixture.whenStable();

    expect(field().dirty()).toBe(false);
    expect(field().touched()).toBe(false);
  });
});

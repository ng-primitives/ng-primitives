import { Component, signal } from '@angular/core';
import { FormField as SignalFormField, disabled, form, validate } from '@angular/forms/signals';
import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { Switch } from './switch-forms.fixture';

/** Read when the host is constructed, so a test can choose the field's starting value. */
let initialValue = false;

@Component({
  imports: [Switch, SignalFormField],
  template: `
    <app-switch [formField]="f.enabled" />
  `,
})
class Host {
  readonly isDisabled = signal(false);
  readonly model = signal({ enabled: initialValue });
  readonly f = form(this.model, path => {
    disabled(path.enabled, () => this.isDisabled());
    validate(path.enabled, ({ value }) => (value() ? undefined : { kind: 'mustEnable' }));
  });
}

function renderHost(enabled = false) {
  initialValue = enabled;
  return render(Host);
}

describe('Switch (reusable component) — signal forms', () => {
  it('reflects the initial field value', async () => {
    const { getByRole, fixture } = await renderHost(true);

    expect(getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(fixture.componentInstance.f.enabled().value()).toBe(true);
  });

  it('updates the model on click and the DOM on a model change', async () => {
    const { getByRole, fixture } = await renderHost();
    const el = getByRole('switch');

    fireEvent.click(el);
    await fixture.whenStable();
    expect(fixture.componentInstance.model().enabled).toBe(true);
    expect(el).toHaveAttribute('aria-checked', 'true');

    fixture.componentInstance.model.set({ enabled: false });
    await fixture.whenStable();
    expect(el).toHaveAttribute('aria-checked', 'false');
  });

  it('reflects the disabled state from the field', async () => {
    const { getByRole, fixture } = await renderHost();

    expect(getByRole('switch')).not.toHaveAttribute('data-disabled');

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();
    expect(getByRole('switch')).toHaveAttribute('data-disabled', '');
  });

  it('does not toggle while the field is disabled', async () => {
    const { getByRole, fixture } = await renderHost();
    const el = getByRole('switch');

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    fireEvent.click(el);
    await fixture.whenStable();
    expect(fixture.componentInstance.model().enabled).toBe(false);
    expect(el).toHaveAttribute('aria-checked', 'false');

    fixture.componentInstance.isDisabled.set(false);
    await fixture.whenStable();

    fireEvent.click(el);
    await fixture.whenStable();
    expect(fixture.componentInstance.model().enabled).toBe(true);
    expect(el).toHaveAttribute('aria-checked', 'true');
  });

  it('marks the field as touched on focusout', async () => {
    const { getByRole, fixture } = await renderHost();

    expect(fixture.componentInstance.f.enabled().touched()).toBe(false);

    fireEvent.focusOut(getByRole('switch'));
    await fixture.whenStable();

    expect(fixture.componentInstance.f.enabled().touched()).toBe(true);
  });

  it('reports validation errors from the field', async () => {
    const { getByRole, fixture } = await renderHost();
    const field = fixture.componentInstance.f.enabled;

    expect(field().invalid()).toBe(true);
    expect(field().errors()[0].kind).toBe('mustEnable');

    fireEvent.click(getByRole('switch'));
    await fixture.whenStable();

    expect(field().valid()).toBe(true);
  });
});

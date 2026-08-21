import { Component, signal } from '@angular/core';
import { FormField as SignalFormField, disabled, form, required } from '@angular/forms/signals';
import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { RadioGroup, RadioItemFixture } from './radio-forms.fixture';

/** Read when the host is constructed, so a test can choose the field's starting value. */
let initialValue: string | null = null;

@Component({
  imports: [RadioGroup, RadioItemFixture, SignalFormField],
  template: `
    <app-radio-group [formField]="f.choice">
      <app-radio-item value="1">One</app-radio-item>
      <app-radio-item value="2">Two</app-radio-item>
    </app-radio-group>
  `,
})
class Host {
  readonly isDisabled = signal(false);
  readonly model = signal<{ choice: string | null }>({ choice: initialValue });
  readonly f = form(this.model, path => {
    disabled(path.choice, () => this.isDisabled());
    required(path.choice);
  });
}

function renderHost(choice: string | null = null) {
  initialValue = choice;
  return render(Host);
}

describe('RadioGroup (reusable component) — signal forms', () => {
  it('reflects the initial field value', async () => {
    const { getByRole, fixture } = await renderHost('1');

    expect(getByRole('radio', { name: 'One' })).toHaveAttribute('data-checked', '');
    expect(getByRole('radio', { name: 'Two' })).not.toHaveAttribute('data-checked');
    expect(fixture.componentInstance.f.choice().value()).toBe('1');
  });

  it('updates the model on click and the DOM on a model change', async () => {
    const { getByRole, fixture } = await renderHost();
    const one = getByRole('radio', { name: 'One' });

    fireEvent.click(one);
    await fixture.whenStable();
    expect(fixture.componentInstance.model().choice).toBe('1');
    expect(one).toHaveAttribute('data-checked', '');

    fixture.componentInstance.model.set({ choice: '2' });
    await fixture.whenStable();
    expect(getByRole('radio', { name: 'Two' })).toHaveAttribute('data-checked', '');
    expect(one).not.toHaveAttribute('data-checked');
  });

  it('reflects the disabled state from the field', async () => {
    const { getByRole, fixture } = await renderHost();

    expect(getByRole('radiogroup')).not.toHaveAttribute('data-disabled');

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    expect(getByRole('radiogroup')).toHaveAttribute('data-disabled', '');
  });

  it('does not allow selection while the field is disabled', async () => {
    const { getByRole, fixture } = await renderHost();
    const one = getByRole('radio', { name: 'One' });

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    fireEvent.click(one);
    await fixture.whenStable();
    expect(fixture.componentInstance.model().choice).toBeNull();
    expect(one).not.toHaveAttribute('data-checked');

    fixture.componentInstance.isDisabled.set(false);
    await fixture.whenStable();

    fireEvent.click(one);
    await fixture.whenStable();
    expect(fixture.componentInstance.model().choice).toBe('1');
    expect(one).toHaveAttribute('data-checked', '');
  });

  it('does not roam focus with the keyboard while the field is disabled', async () => {
    const { getByRole, fixture } = await renderHost();
    const one = getByRole('radio', { name: 'One' });
    const two = getByRole('radio', { name: 'Two' });

    // activate the first item so the roving focus group has an active item
    fireEvent.click(one);
    await fixture.whenStable();

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    fireEvent.keyDown(one, { key: 'ArrowRight' });
    await fixture.whenStable();

    expect(two).not.toHaveFocus();
    expect(two).not.toHaveAttribute('data-checked');
    expect(fixture.componentInstance.model().choice).toBe('1');
  });

  it('marks the field as touched on focusout', async () => {
    const { getByRole, fixture } = await renderHost();

    expect(fixture.componentInstance.f.choice().touched()).toBe(false);

    fireEvent.focusOut(getByRole('radiogroup'));
    await fixture.whenStable();

    expect(fixture.componentInstance.f.choice().touched()).toBe(true);
  });

  it('reports validation errors from the field', async () => {
    const { getByRole, fixture } = await renderHost();
    const field = fixture.componentInstance.f.choice;

    expect(field().invalid()).toBe(true);
    expect(field().errors()[0].kind).toBe('required');

    fireEvent.click(getByRole('radio', { name: 'One' }));
    await fixture.whenStable();

    expect(field().valid()).toBe(true);
  });
});

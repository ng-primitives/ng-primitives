import { Component, signal } from '@angular/core';
import { FormField as SignalFormField, disabled, form, min } from '@angular/forms/signals';
import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { Rating } from './rating-forms.fixture';

/** Read when the host is constructed, so a test can choose the field's starting value. */
let initialValue = 0;

@Component({
  imports: [Rating, SignalFormField],
  template: `
    <app-rating [formField]="f.score" count="5" />
  `,
})
class Host {
  readonly isDisabled = signal(false);
  readonly model = signal({ score: initialValue });
  readonly f = form(this.model, path => {
    disabled(path.score, () => this.isDisabled());
    min(path.score, 1);
  });
}

function renderHost(score = 0) {
  initialValue = score;
  return render(Host);
}

describe('Rating (reusable component) — signal forms', () => {
  it('reflects the initial field value', async () => {
    const { getByRole, fixture } = await renderHost(3);

    expect(getByRole('slider')).toHaveAttribute('aria-valuenow', '3');
    expect(fixture.componentInstance.f.score().value()).toBe(3);
  });

  it('updates the model on keyboard and the DOM on a model change', async () => {
    const { getByRole, fixture } = await renderHost(2);
    const rating = getByRole('slider');

    fireEvent.keyDown(rating, { key: 'ArrowRight' });
    await fixture.whenStable();
    expect(fixture.componentInstance.model().score).toBe(3);

    fixture.componentInstance.model.set({ score: 1 });
    await fixture.whenStable();
    expect(rating).toHaveAttribute('aria-valuenow', '1');
  });

  it('reflects the disabled state from the field', async () => {
    const { getByRole, fixture } = await renderHost();

    expect(getByRole('slider')).not.toHaveAttribute('data-disabled');

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    expect(getByRole('slider')).toHaveAttribute('data-disabled', '');
    expect(getByRole('slider')).toHaveAttribute('tabindex', '-1');
  });

  it('does not change value with the keyboard while the field is disabled', async () => {
    const { getByRole, fixture } = await renderHost(2);
    const rating = getByRole('slider');

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    fireEvent.keyDown(rating, { key: 'ArrowRight' });
    await fixture.whenStable();
    expect(fixture.componentInstance.model().score).toBe(2);
    expect(rating).toHaveAttribute('aria-valuenow', '2');

    fixture.componentInstance.isDisabled.set(false);
    await fixture.whenStable();

    fireEvent.keyDown(rating, { key: 'ArrowRight' });
    await fixture.whenStable();
    expect(fixture.componentInstance.model().score).toBe(3);
  });

  it('marks the field as touched on focusout', async () => {
    const { getByRole, fixture } = await renderHost();

    expect(fixture.componentInstance.f.score().touched()).toBe(false);

    fireEvent.focusOut(getByRole('slider'));
    await fixture.whenStable();

    expect(fixture.componentInstance.f.score().touched()).toBe(true);
  });

  it('reports validation errors from the field', async () => {
    const { getByRole, fixture } = await renderHost(0);
    const field = fixture.componentInstance.f.score;

    expect(field().invalid()).toBe(true);
    expect(field().errors()[0].kind).toBe('min');

    fireEvent.keyDown(getByRole('slider'), { key: 'ArrowRight' });
    await fixture.whenStable();

    expect(field().valid()).toBe(true);
  });
});

import { Component, signal } from '@angular/core';
import { FormField as SignalFormField, disabled, form, min } from '@angular/forms/signals';
import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { Slider } from './slider-forms.fixture';

/** Read when the host is constructed, so a test can choose the field's starting value. */
let initialValue = 0;

@Component({
  imports: [Slider, SignalFormField],
  template: `
    <app-slider [formField]="f.volume" min="0" max="100" step="10" />
  `,
})
class Host {
  readonly isDisabled = signal(false);
  readonly model = signal({ volume: initialValue });
  readonly f = form(this.model, path => {
    disabled(path.volume, () => this.isDisabled());
    min(path.volume, 20);
  });
}

function renderHost(volume = 50) {
  initialValue = volume;
  return render(Host);
}

describe('Slider (reusable component) — signal forms', () => {
  it('reflects the initial field value', async () => {
    const { getByRole, fixture } = await renderHost(30);

    expect(getByRole('slider')).toHaveAttribute('aria-valuenow', '30');
    expect(fixture.componentInstance.f.volume().value()).toBe(30);
  });

  it('updates the model on keyboard and the DOM on a model change', async () => {
    const { getByRole, fixture } = await renderHost(50);
    const thumb = getByRole('slider');

    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    await fixture.whenStable();
    expect(fixture.componentInstance.model().volume).toBe(60);

    fixture.componentInstance.model.set({ volume: 20 });
    await fixture.whenStable();
    expect(thumb).toHaveAttribute('aria-valuenow', '20');
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
    const { getByRole, fixture } = await renderHost(40);
    const thumb = getByRole('slider');

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    await fixture.whenStable();
    expect(fixture.componentInstance.model().volume).toBe(40);
    expect(thumb).toHaveAttribute('aria-valuenow', '40');

    fixture.componentInstance.isDisabled.set(false);
    await fixture.whenStable();

    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    await fixture.whenStable();
    expect(fixture.componentInstance.model().volume).toBe(50);
  });

  it('marks the field as touched on focusout', async () => {
    const { getByRole, fixture } = await renderHost();

    expect(fixture.componentInstance.f.volume().touched()).toBe(false);

    fireEvent.focusOut(getByRole('slider'));
    await fixture.whenStable();

    expect(fixture.componentInstance.f.volume().touched()).toBe(true);
  });

  it('reports validation errors from the field', async () => {
    const { getByRole, fixture } = await renderHost(10);
    const field = fixture.componentInstance.f.volume;

    expect(field().invalid()).toBe(true);
    expect(field().errors()[0].kind).toBe('min');

    fireEvent.keyDown(getByRole('slider'), { key: 'ArrowRight' });
    await fixture.whenStable();

    expect(field().valid()).toBe(true);
  });
});

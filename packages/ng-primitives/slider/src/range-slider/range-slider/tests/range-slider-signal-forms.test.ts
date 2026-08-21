import { Component, signal } from '@angular/core';
import { FormField as SignalFormField, disabled, form, validate } from '@angular/forms/signals';
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { RangeSlider } from './range-slider-forms.fixture';

@Component({
  imports: [RangeSlider, SignalFormField],
  template: `
    <app-range-slider [formField]="f.range" [min]="0" [max]="100" [step]="1" />
  `,
})
class Host {
  readonly isDisabled = signal(false);
  readonly model = signal<{ range: [number, number] }>({ range: [20, 80] });
  readonly f = form(this.model, path => {
    disabled(path.range, () => this.isDisabled());
    validate(path.range, ({ value }) =>
      value()[1] - value()[0] >= 10 ? undefined : { kind: 'tooNarrow' },
    );
  });
}

describe('RangeSlider (reusable component) — signal forms', () => {
  it('reflects the initial field value', async () => {
    const { fixture } = await render(Host);
    await fixture.whenStable();

    expect(screen.getByTestId('low-thumb')).toHaveAttribute('aria-valuenow', '20');
    expect(screen.getByTestId('high-thumb')).toHaveAttribute('aria-valuenow', '80');
    expect(fixture.componentInstance.f.range().value()).toEqual([20, 80]);
  });

  it('updates the model when a thumb moves and the DOM on a model change', async () => {
    const { fixture } = await render(Host);
    await fixture.whenStable();

    const highThumb = screen.getByTestId('high-thumb');
    highThumb.focus();
    await userEvent.keyboard('{arrowleft}');
    await fixture.whenStable();

    expect(fixture.componentInstance.model().range).toEqual([20, 79]);

    fixture.componentInstance.model.set({ range: [40, 60] });
    await fixture.whenStable();

    expect(screen.getByTestId('low-thumb')).toHaveAttribute('aria-valuenow', '40');
    expect(highThumb).toHaveAttribute('aria-valuenow', '60');
  });

  it('reflects the disabled state from the field', async () => {
    const { fixture } = await render(Host);
    await fixture.whenStable();

    const lowThumb = screen.getByTestId('low-thumb');
    expect(lowThumb).toHaveAttribute('tabindex', '0');

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    expect(lowThumb).toHaveAttribute('tabindex', '-1');
    expect(lowThumb).toHaveAttribute('data-disabled', '');
  });

  it('does not respond to the keyboard while the field is disabled', async () => {
    const { fixture } = await render(Host);
    await fixture.whenStable();

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    const lowThumb = screen.getByTestId('low-thumb');
    lowThumb.focus();
    await userEvent.keyboard('{arrowright}');
    await fixture.whenStable();

    expect(lowThumb).toHaveAttribute('aria-valuenow', '20');

    fixture.componentInstance.isDisabled.set(false);
    await fixture.whenStable();

    lowThumb.focus();
    await userEvent.keyboard('{arrowright}');
    await fixture.whenStable();

    expect(lowThumb).toHaveAttribute('aria-valuenow', '21');
  });

  it('marks the field as touched on focusout', async () => {
    const { fixture } = await render(Host);
    await fixture.whenStable();

    expect(fixture.componentInstance.f.range().touched()).toBe(false);

    screen.getByTestId('low-thumb').focus();
    screen.getByTestId('low-thumb').blur();
    await fixture.whenStable();

    expect(fixture.componentInstance.f.range().touched()).toBe(true);
  });

  it('reports validation errors from the field', async () => {
    const { fixture } = await render(Host);
    await fixture.whenStable();
    const field = fixture.componentInstance.f.range;

    expect(field().valid()).toBe(true);

    fixture.componentInstance.model.set({ range: [50, 55] });
    await fixture.whenStable();

    expect(field().invalid()).toBe(true);
    expect(field().errors()[0].kind).toBe('tooNarrow');
  });
});

import { Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RangeSlider } from './range-slider-forms.fixture';

@Component({
  imports: [RangeSlider, FormsModule],
  template: `
    <app-range-slider
      [(ngModel)]="value"
      [min]="0"
      [max]="100"
      [step]="1"
      (ngModelChange)="ngModelChange($event)"
    />
  `,
})
class NgModelHost {
  readonly value = signal<[number, number]>([20, 80]);
  ngModelChange = vi.fn();
}

describe('RangeSlider (reusable component) — template-driven forms', () => {
  it('reflects the initial [(ngModel)] value', async () => {
    const { fixture } = await render(NgModelHost);
    await fixture.whenStable();

    expect(screen.getByTestId('low-thumb')).toHaveAttribute('aria-valuenow', '20');
    expect(screen.getByTestId('high-thumb')).toHaveAttribute('aria-valuenow', '80');
  });

  it('binds with [(ngModel)] two-way when a thumb moves', async () => {
    const { fixture } = await render(NgModelHost);
    await fixture.whenStable();

    const lowThumb = screen.getByTestId('low-thumb');
    lowThumb.focus();
    await userEvent.keyboard('{arrowright}');
    await fixture.whenStable();

    expect(lowThumb).toHaveAttribute('aria-valuenow', '21');
    expect(fixture.componentInstance.value()).toEqual([21, 80]);
    expect(fixture.componentInstance.ngModelChange).toHaveBeenLastCalledWith([21, 80]);
  });
});

describe('RangeSlider (reusable component) — reactive forms', () => {
  it('reflects the initial form control value', async () => {
    const formControl = new FormControl<[number, number]>([20, 80]);
    const { fixture } = await render(
      `<app-range-slider [formControl]="formControl" [min]="0" [max]="100"></app-range-slider>`,
      {
        imports: [RangeSlider, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );
    await fixture.whenStable();

    expect(screen.getByTestId('low-thumb')).toHaveAttribute('aria-valuenow', '20');
    expect(screen.getByTestId('high-thumb')).toHaveAttribute('aria-valuenow', '80');
    expect(formControl.value).toEqual([20, 80]);
  });

  it('updates the form control when a thumb moves and the DOM on setValue', async () => {
    const formControl = new FormControl<[number, number]>([20, 80]);
    const { fixture } = await render(
      `<app-range-slider [formControl]="formControl" [min]="0" [max]="100" [step]="1"></app-range-slider>`,
      {
        imports: [RangeSlider, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );
    await fixture.whenStable();

    const highThumb = screen.getByTestId('high-thumb');
    highThumb.focus();
    await userEvent.keyboard('{arrowleft}');
    await fixture.whenStable();

    expect(formControl.value).toEqual([20, 79]);

    formControl.setValue([40, 60]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(screen.getByTestId('low-thumb')).toHaveAttribute('aria-valuenow', '40');
    expect(highThumb).toHaveAttribute('aria-valuenow', '60');
  });

  it('reflects the disabled state from the form control', async () => {
    const formControl = new FormControl<[number, number]>([20, 80]);
    const { fixture } = await render(
      `<app-range-slider [formControl]="formControl" [min]="0" [max]="100"></app-range-slider>`,
      {
        imports: [RangeSlider, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );
    await fixture.whenStable();

    const lowThumb = screen.getByTestId('low-thumb');
    expect(lowThumb).toHaveAttribute('tabindex', '0');

    formControl.disable();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(lowThumb).toHaveAttribute('tabindex', '-1');
    expect(lowThumb).toHaveAttribute('data-disabled', '');
  });

  it('does not respond to the keyboard while the form control is disabled', async () => {
    const formControl = new FormControl<[number, number]>({ value: [20, 80], disabled: true });
    const { fixture } = await render(
      `<app-range-slider [formControl]="formControl" [min]="0" [max]="100" [step]="1"></app-range-slider>`,
      {
        imports: [RangeSlider, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );
    await fixture.whenStable();

    const lowThumb = screen.getByTestId('low-thumb');
    expect(lowThumb).toHaveAttribute('tabindex', '-1');
    expect(lowThumb).toHaveAttribute('data-disabled', '');

    lowThumb.focus();
    await userEvent.keyboard('{arrowright}');
    await fixture.whenStable();

    // a disabled slider must ignore keyboard input entirely
    expect(lowThumb).toHaveAttribute('aria-valuenow', '20');

    // re-enabling the control restores keyboard interaction
    formControl.enable();
    fixture.detectChanges();
    await fixture.whenStable();

    lowThumb.focus();
    await userEvent.keyboard('{arrowright}');
    await fixture.whenStable();

    expect(lowThumb).toHaveAttribute('aria-valuenow', '21');
  });

  it('marks the control as touched on focusout', async () => {
    const formControl = new FormControl<[number, number]>([20, 80]);
    const { fixture } = await render(
      `<app-range-slider [formControl]="formControl"></app-range-slider>`,
      {
        imports: [RangeSlider, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );
    await fixture.whenStable();

    expect(formControl.touched).toBe(false);

    screen.getByTestId('low-thumb').focus();
    screen.getByTestId('low-thumb').blur();
    fixture.detectChanges();

    expect(formControl.touched).toBe(true);
  });

  it('does not loop writeValue back through onChange (regression)', async () => {
    const formControl = new FormControl<[number, number]>([20, 80]);
    const { fixture } = await render(
      `<app-range-slider [formControl]="formControl" [min]="0" [max]="100" [step]="1"></app-range-slider>`,
      {
        imports: [RangeSlider, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );
    await fixture.whenStable();

    const spy = vi.fn();
    formControl.valueChanges.subscribe(spy);

    formControl.setValue([40, 60]);
    fixture.detectChanges();
    await fixture.whenStable();

    // writing a value from the model must not re-emit through onChange: a single
    // value change with the written pair, and no intermediate half-written pair
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith([40, 60]);
    expect(formControl.value).toEqual([40, 60]);
  });
});

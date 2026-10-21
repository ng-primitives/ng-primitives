import { Component, signal } from '@angular/core';
import { ControlValueAccessor, FormControl, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import { ChangeFn, TouchedFn, provideValueAccessor } from 'ng-primitives/utils';
import { describe, expect, it } from 'vitest';

@Component({
  selector: 'test-counter',
  providers: [provideValueAccessor(CounterComponent)],
  template: `
    <button [disabled]="disabled()" (click)="increment()" (blur)="onTouched?.()" type="button">
      {{ value() }}
    </button>
  `,
})
class CounterComponent implements ControlValueAccessor {
  readonly value = signal(0);
  readonly disabled = signal(false);
  private onChange?: ChangeFn<number>;
  protected onTouched?: TouchedFn;

  increment(): void {
    this.value.update(value => value + 1);
    this.onChange?.(this.value());
  }

  writeValue(value: number): void {
    this.value.set(value);
  }

  registerOnChange(fn: ChangeFn<number>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchedFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}

describe('provideValueAccessor', () => {
  it('registers the component as the value accessor of a form control on its host', async () => {
    const control = new FormControl(5, { nonNullable: true });
    const { getByRole } = await render(`<test-counter [formControl]="control" />`, {
      imports: [CounterComponent, ReactiveFormsModule],
      componentProperties: { control },
    });
    const button = getByRole('button');

    expect(button).toHaveTextContent('5');

    fireEvent.click(button);
    expect(control.value).toBe(6);

    fireEvent.blur(button);
    expect(control.touched).toBe(true);

    control.setValue(10);
    await expect.poll(() => button.textContent?.trim()).toBe('10');

    control.disable();
    await expect.poll(() => (button as HTMLButtonElement).disabled).toBe(true);
  });
});

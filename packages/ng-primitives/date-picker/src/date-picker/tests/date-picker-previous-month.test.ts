import { Component, signal, viewChild } from '@angular/core';
import { render } from '@testing-library/angular';
import { NgpDatePicker, NgpDatePickerPreviousMonth } from 'ng-primitives/date-picker';
import { describe, expect, it, vi } from 'vitest';

@Component({
  template: `
    <div
      [ngpDatePickerFocusedDate]="focusedDate()"
      [ngpDatePickerMin]="min()"
      [ngpDatePickerDisabled]="disabled()"
      (ngpDatePickerFocusedDateChange)="focusedDate.set($event); focusedDateChange($event)"
      ngpDatePicker
    >
      <button ngpDatePickerPreviousMonth aria-label="previous month">prev</button>
    </div>
  `,
  imports: [NgpDatePicker, NgpDatePickerPreviousMonth],
})
class TestHost {
  readonly focusedDate = signal<Date>(new Date(2025, 2, 15));
  readonly min = signal<Date | undefined>(undefined);
  readonly disabled = signal(false);
  readonly focusedDateChange = vi.fn<(date: Date) => void>();
  readonly previousMonth = viewChild.required<NgpDatePickerPreviousMonth<Date>>(
    NgpDatePickerPreviousMonth,
  );
}

async function setup() {
  const view = await render(TestHost);
  await view.fixture.whenStable();

  const host = view.fixture.componentInstance;
  const button = view.container.querySelector('[ngpDatePickerPreviousMonth]') as HTMLButtonElement;

  const click = async () => {
    button.click();
    await view.fixture.whenStable();
  };

  const setState = async (state: { focusedDate?: Date; min?: Date; disabled?: boolean }) => {
    if (state.focusedDate) {
      host.focusedDate.set(state.focusedDate);
    }
    if ('min' in state) {
      host.min.set(state.min);
    }
    if (typeof state.disabled === 'boolean') {
      host.disabled.set(state.disabled);
    }
    await view.fixture.whenStable();
  };

  return { view, host, button, click, setState };
}

describe('NgpDatePickerPreviousMonth', () => {
  it('should create', async () => {
    const { host } = await setup();
    expect(host.previousMonth()).toBeTruthy();
  });

  it('should navigate to previous month when clicked', async () => {
    const { host, click } = await setup();
    await click();

    const emitted = host.focusedDateChange.mock.calls.at(-1)?.[0] as Date;
    expect(emitted.getMonth()).toBe(1); // February
    expect(emitted.getFullYear()).toBe(2025);
    expect(emitted.getDate()).toBe(15); // Focused day is preserved
  });

  it('should handle navigation from 31st of month to previous month without 31 days', async () => {
    const { host, click, setState } = await setup();
    await setState({ focusedDate: new Date(2025, 2, 31) }); // March 31, 2025
    await click();

    const emitted = host.focusedDateChange.mock.calls.at(-1)?.[0] as Date;
    // Should navigate to February 28, 2025 (February only has 28 days in 2025),
    // clamping the focused day to the last day of the month.
    expect(emitted.getMonth()).toBe(1); // February
    expect(emitted.getFullYear()).toBe(2025);
    expect(emitted.getDate()).toBe(28); // Clamped to the last day of February
  });

  it('should handle navigation from January to December of previous year', async () => {
    const { host, click, setState } = await setup();
    await setState({ focusedDate: new Date(2025, 0, 15) }); // January 15, 2025
    await click();

    const emitted = host.focusedDateChange.mock.calls.at(-1)?.[0] as Date;
    expect(emitted.getMonth()).toBe(11); // December
    expect(emitted.getFullYear()).toBe(2024);
    expect(emitted.getDate()).toBe(15); // Focused day is preserved
  });

  it('should not navigate when disabled', async () => {
    const { host, click, setState } = await setup();
    await setState({ focusedDate: new Date(2025, 2, 15), disabled: true });
    await click();

    expect(host.focusedDateChange).not.toHaveBeenCalled();
    expect(host.focusedDate().getMonth()).toBe(2); // Still March
    expect(host.focusedDate().getDate()).toBe(15);
  });

  it('should be disabled when min date is in current month', async () => {
    const { host, setState } = await setup();
    await setState({ focusedDate: new Date(2025, 2, 15), min: new Date(2025, 2, 1) });
    expect(host.previousMonth().disabled()).toBe(true);
  });

  it('should not be disabled when min date is in previous month', async () => {
    const { host, setState } = await setup();
    await setState({ focusedDate: new Date(2025, 2, 15), min: new Date(2025, 1, 1) });
    expect(host.previousMonth().disabled()).toBe(false);
  });

  it('should set time to midnight when navigating', async () => {
    const { host, click, setState } = await setup();
    await setState({ focusedDate: new Date(2025, 2, 15, 14, 30, 45, 500) });
    await click();

    const emitted = host.focusedDateChange.mock.calls.at(-1)?.[0] as Date;
    expect(emitted.getHours()).toBe(0);
    expect(emitted.getMinutes()).toBe(0);
    expect(emitted.getSeconds()).toBe(0);
    expect(emitted.getMilliseconds()).toBe(0);
  });

  it('should have correct aria-disabled attribute when disabled', async () => {
    const { button, setState } = await setup();
    await setState({ disabled: true });
    expect(button.getAttribute('aria-disabled')).toBe('true');
  });

  it('should have correct aria-disabled attribute when not disabled', async () => {
    const { button, setState } = await setup();
    await setState({ disabled: false });
    expect(button).not.toHaveAttribute('aria-disabled');
  });

  it('should have type="button" attribute for button elements', async () => {
    const { button } = await setup();
    expect(button.getAttribute('type')).toBe('button');
  });
});

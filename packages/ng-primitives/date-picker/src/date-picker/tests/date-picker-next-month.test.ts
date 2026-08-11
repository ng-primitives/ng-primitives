import { Component, signal, viewChild } from '@angular/core';
import { render } from '@testing-library/angular';
import { NgpDatePicker, NgpDatePickerNextMonth } from 'ng-primitives/date-picker';
import { describe, expect, it, vi } from 'vitest';

@Component({
  template: `
    <div
      [ngpDatePickerFocusedDate]="focusedDate()"
      [ngpDatePickerMax]="max()"
      [ngpDatePickerDisabled]="disabled()"
      (ngpDatePickerFocusedDateChange)="focusedDate.set($event); focusedDateChange($event)"
      ngpDatePicker
    >
      <button ngpDatePickerNextMonth aria-label="next month">next</button>
    </div>
  `,
  imports: [NgpDatePicker, NgpDatePickerNextMonth],
})
class TestHost {
  readonly focusedDate = signal<Date>(new Date(2025, 2, 15));
  readonly max = signal<Date | undefined>(undefined);
  readonly disabled = signal(false);
  readonly focusedDateChange = vi.fn<(date: Date) => void>();
  readonly nextMonth = viewChild.required<NgpDatePickerNextMonth<Date>>(NgpDatePickerNextMonth);
}

async function setup() {
  const view = await render(TestHost);
  await view.fixture.whenStable();

  const host = view.fixture.componentInstance;
  const button = view.container.querySelector('[ngpDatePickerNextMonth]') as HTMLButtonElement;

  const click = async () => {
    button.click();
    await view.fixture.whenStable();
  };

  const setState = async (state: { focusedDate?: Date; max?: Date; disabled?: boolean }) => {
    if (state.focusedDate) {
      host.focusedDate.set(state.focusedDate);
    }
    if ('max' in state) {
      host.max.set(state.max);
    }
    if (typeof state.disabled === 'boolean') {
      host.disabled.set(state.disabled);
    }
    await view.fixture.whenStable();
  };

  return { view, host, button, click, setState };
}

describe('NgpDatePickerNextMonth', () => {
  it('should create', async () => {
    const { host } = await setup();
    expect(host.nextMonth()).toBeTruthy();
  });

  it('should navigate to next month when clicked', async () => {
    const { host, click } = await setup();
    await click();

    const emitted = host.focusedDateChange.mock.calls.at(-1)?.[0] as Date;
    expect(emitted.getMonth()).toBe(3); // April
    expect(emitted.getFullYear()).toBe(2025);
    expect(emitted.getDate()).toBe(15); // Focused day is preserved
  });

  it('should advance exactly one month from the 31st of a month into a shorter month', async () => {
    const { host, click, setState } = await setup();
    await setState({ focusedDate: new Date(2026, 4, 31) }); // May 31, 2026 (June has 30 days)
    await click();

    const emitted = host.focusedDateChange.mock.calls.at(-1)?.[0] as Date;
    // Should navigate to June 30, 2026 - clamped to the last day, not skip to July.
    expect(emitted.getMonth()).toBe(5); // June
    expect(emitted.getFullYear()).toBe(2026);
    expect(emitted.getDate()).toBe(30); // Clamped to the last day of June
  });

  it('should handle navigation from December to January of next year', async () => {
    const { host, click, setState } = await setup();
    await setState({ focusedDate: new Date(2025, 11, 15) }); // December 15, 2025
    await click();

    const emitted = host.focusedDateChange.mock.calls.at(-1)?.[0] as Date;
    expect(emitted.getMonth()).toBe(0); // January
    expect(emitted.getFullYear()).toBe(2026);
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

  it('should be disabled when max date is in current month', async () => {
    const { host, setState } = await setup();
    await setState({ focusedDate: new Date(2025, 2, 15), max: new Date(2025, 2, 31) });
    expect(host.nextMonth().disabled()).toBe(true);
  });

  it('should not be disabled when max date is in next month', async () => {
    const { host, setState } = await setup();
    await setState({ focusedDate: new Date(2025, 2, 15), max: new Date(2025, 3, 1) });
    expect(host.nextMonth().disabled()).toBe(false);
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

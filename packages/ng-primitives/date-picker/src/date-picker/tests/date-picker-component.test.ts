import { Component, computed, signal, viewChild } from '@angular/core';
import { render } from '@testing-library/angular';
import {
  injectDatePickerState,
  NgpDatePicker,
  NgpDatePickerCell,
  NgpDatePickerCellRender,
  NgpDatePickerDateButton,
  NgpDatePickerGrid,
  NgpDatePickerLabel,
  NgpDatePickerNextMonth,
  NgpDatePickerPreviousMonth,
  NgpDatePickerRowRender,
} from 'ng-primitives/date-picker';
import { describe, expect, it, vi } from 'vitest';

/**
 * An inline reusable-component fixture that mirrors the composition of the
 * `app-date-picker` reusable component in
 * `apps/components/src/app/pages/reusable-components/date-picker`. It composes the
 * date picker primitives with a formatted month/year label and a weekday header.
 * Unlike the app component this fixture is not a ControlValueAccessor - it is a
 * plain component so the composition can be exercised without forms.
 */
@Component({
  selector: 'app-date-picker',
  hostDirectives: [
    {
      directive: NgpDatePicker,
      inputs: [
        'ngpDatePickerDate: date',
        'ngpDatePickerFocusedDate: focusedDate',
        'ngpDatePickerMin: min',
        'ngpDatePickerMax: max',
        'ngpDatePickerDisabled: disabled',
      ],
      outputs: [
        'ngpDatePickerDateChange: dateChange',
        'ngpDatePickerFocusedDateChange: focusedDateChange',
      ],
    },
  ],
  imports: [
    NgpDatePickerLabel,
    NgpDatePickerNextMonth,
    NgpDatePickerPreviousMonth,
    NgpDatePickerGrid,
    NgpDatePickerCell,
    NgpDatePickerRowRender,
    NgpDatePickerCellRender,
    NgpDatePickerDateButton,
  ],
  template: `
    <div class="date-picker-header">
      <button ngpDatePickerPreviousMonth aria-label="previous month">prev</button>
      <h2 ngpDatePickerLabel>{{ label() }}</h2>
      <button ngpDatePickerNextMonth aria-label="next month">next</button>
    </div>
    <table ngpDatePickerGrid>
      <thead>
        <tr>
          <th scope="col" abbr="Sunday">S</th>
          <th scope="col" abbr="Monday">M</th>
          <th scope="col" abbr="Tuesday">T</th>
          <th scope="col" abbr="Wednesday">W</th>
          <th scope="col" abbr="Thursday">T</th>
          <th scope="col" abbr="Friday">F</th>
          <th scope="col" abbr="Saturday">S</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngpDatePickerRowRender>
          <td *ngpDatePickerCellRender="let date" ngpDatePickerCell>
            <button ngpDatePickerDateButton>{{ date.getDate() }}</button>
          </td>
        </tr>
      </tbody>
    </table>
  `,
})
class DatePicker {
  private readonly state = injectDatePickerState<Date>();

  /** The focused date rendered as "August 2025". */
  readonly label = computed(
    () =>
      `${this.state().focusedDate().toLocaleString('default', { month: 'long' })} ${this.state().focusedDate().getFullYear()}`,
  );
}

@Component({
  template: `
    <app-date-picker
      [focusedDate]="focusedDate()"
      [date]="date()"
      [disabled]="disabled()"
      (focusedDateChange)="focusedDate.set($event)"
      (dateChange)="date.set($event); dateChange($event)"
    />
  `,
  imports: [DatePicker],
})
class TestHost {
  readonly focusedDate = signal<Date>(new Date(2025, 7, 15)); // August 15, 2025
  readonly date = signal<Date | undefined>(undefined);
  readonly disabled = signal(false);
  readonly dateChange = vi.fn<(date: Date | undefined) => void>();
  readonly datePicker = viewChild.required(DatePicker);
}

async function setup(options: { focusedDate?: Date; disabled?: boolean } = {}) {
  const view = await render(TestHost);
  const host = view.fixture.componentInstance;

  if (options.focusedDate) {
    host.focusedDate.set(options.focusedDate);
  }
  if (typeof options.disabled === 'boolean') {
    host.disabled.set(options.disabled);
  }

  await view.fixture.whenStable();

  const label = view.container.querySelector('[ngpDatePickerLabel]') as HTMLElement;
  const grid = view.container.querySelector('[ngpDatePickerGrid]') as HTMLElement;

  const dayButton = (day: number) =>
    Array.from(grid.querySelectorAll('[ngpDatePickerDateButton]')).find(
      button =>
        button.textContent?.trim() === String(day) && !button.hasAttribute('data-outside-month'),
    ) as HTMLButtonElement | undefined;

  const clickButton = async (selector: string) => {
    (view.container.querySelector(selector) as HTMLButtonElement).click();
    await view.fixture.whenStable();
  };

  return { view, host, label, grid, dayButton, clickButton };
}

describe('DatePicker (reusable component)', () => {
  it('should render the formatted month/year label for the focused date', async () => {
    const { label } = await setup();
    expect(label.textContent?.trim()).toBe('August 2025');
  });

  it('should render a weekday header row', async () => {
    const { grid } = await setup();
    const headers = grid.querySelectorAll('thead th');
    expect(headers).toHaveLength(7);
    expect(Array.from(headers).map(h => h.getAttribute('abbr'))).toEqual([
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]);
  });

  it('should update the label when navigating to the next month', async () => {
    const { label, clickButton } = await setup();
    await clickButton('[ngpDatePickerNextMonth]');
    expect(label.textContent?.trim()).toBe('September 2025');
  });

  it('should update the label when navigating to the previous month', async () => {
    const { label, clickButton } = await setup();
    await clickButton('[ngpDatePickerPreviousMonth]');
    expect(label.textContent?.trim()).toBe('July 2025');
  });

  it('should emit dateChange and mark the day selected when a day is clicked', async () => {
    const { host, view, dayButton } = await setup();

    dayButton(20)!.click();
    await view.fixture.whenStable();

    const emitted = host.dateChange.mock.calls.at(-1)?.[0] as Date;
    expect(emitted.getFullYear()).toBe(2025);
    expect(emitted.getMonth()).toBe(7);
    expect(emitted.getDate()).toBe(20);
    expect(dayButton(20)).toHaveAttribute('data-selected', '');
  });

  it('should mark days outside the focused month with data-outside-month', async () => {
    const { grid } = await setup();
    const outside = grid.querySelectorAll('[ngpDatePickerDateButton][data-outside-month]');
    expect(outside.length).toBeGreaterThan(0);
  });

  it('should mark today with data-today', async () => {
    const today = new Date();
    const { grid } = await setup({ focusedDate: today });
    const todayButtons = grid.querySelectorAll('[ngpDatePickerDateButton][data-today]');
    expect(todayButtons).toHaveLength(1);
    expect(todayButtons[0].textContent?.trim()).toBe(String(today.getDate()));
  });

  it('should not emit dateChange when the picker is disabled', async () => {
    const { host, view, dayButton } = await setup({ disabled: true });
    dayButton(20)!.click();
    await view.fixture.whenStable();
    expect(host.dateChange).not.toHaveBeenCalled();
  });
});

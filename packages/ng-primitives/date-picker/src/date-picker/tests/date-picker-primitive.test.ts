import { By } from '@angular/platform-browser';
import { render } from '@testing-library/angular';
import {
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

const IMPORTS = [
  NgpDatePicker,
  NgpDatePickerLabel,
  NgpDatePickerNextMonth,
  NgpDatePickerPreviousMonth,
  NgpDatePickerGrid,
  NgpDatePickerCell,
  NgpDatePickerRowRender,
  NgpDatePickerCellRender,
  NgpDatePickerDateButton,
];

const TEMPLATE = `
  <div
    ngpDatePicker
    [ngpDatePickerFocusedDate]="focusedDate"
    [ngpDatePickerDate]="date"
    [ngpDatePickerMin]="min"
    [ngpDatePickerMax]="max"
    [ngpDatePickerDisabled]="disabled"
    [ngpDatePickerDateDisabled]="dateDisabled"
    (ngpDatePickerDateChange)="date = $event; dateChange($event)"
    (ngpDatePickerFocusedDateChange)="focusedDate = $event; focusedDateChange($event)"
  >
    <button ngpDatePickerPreviousMonth aria-label="previous month">prev</button>
    <h2 ngpDatePickerLabel>label</h2>
    <button ngpDatePickerNextMonth aria-label="next month">next</button>
    <table ngpDatePickerGrid>
      <tbody>
        <tr *ngpDatePickerRowRender>
          <td *ngpDatePickerCellRender="let day" ngpDatePickerCell>
            <button ngpDatePickerDateButton>{{ day.getDate() }}</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
`;

interface SetupOptions {
  focusedDate?: Date;
  date?: Date;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  dateDisabled?: (date: Date) => boolean;
  dir?: 'ltr' | 'rtl';
}

// August 2025 begins on a Friday. With the default Sunday start the grid spans
// six weeks (Sun 27 Jul - Sat 6 Sep) which keeps navigation deterministic.
const FOCUSED = new Date(2025, 7, 15);

async function setup(options: SetupOptions = {}) {
  const dateChange = vi.fn();
  const focusedDateChange = vi.fn();

  const template = options.dir
    ? TEMPLATE.replace('ngpDatePicker\n', `ngpDatePicker dir="${options.dir}"\n`)
    : TEMPLATE;

  const view = await render(template, {
    imports: IMPORTS,
    componentProperties: {
      focusedDate: options.focusedDate ?? FOCUSED,
      date: options.date ?? undefined,
      min: options.min ?? undefined,
      max: options.max ?? undefined,
      disabled: options.disabled ?? false,
      dateDisabled: options.dateDisabled ?? (() => false),
      dateChange,
      focusedDateChange,
    },
  });

  await view.fixture.whenStable();

  const { container } = view;
  const grid = container.querySelector('[ngpDatePickerGrid]') as HTMLElement;

  /** The date button that currently holds roving focus (tabindex 0). */
  const tabbable = () =>
    grid.querySelector('[ngpDatePickerDateButton][tabindex="0"]') as HTMLButtonElement | null;

  /** Find an in-month date button by its day number (ignoring outside-month days). */
  const dayButton = (day: number) =>
    Array.from(grid.querySelectorAll('[ngpDatePickerDateButton]')).find(
      button =>
        button.textContent?.trim() === String(day) && !button.hasAttribute('data-outside-month'),
    ) as HTMLButtonElement | undefined;

  return { ...view, container, grid, tabbable, dateChange, focusedDateChange, dayButton };
}

/**
 * Render a picker with arbitrary `ngpDatePicker*` bindings, focused on August 2025
 * (via `defaultFocusedDate`) so day numbers are unambiguous. Used by the
 * controlled/uncontrolled value tests.
 */
async function renderCustomPicker(bindings: string, props: Record<string, unknown> = {}) {
  const view = await render(
    `
      <div ngpDatePicker [ngpDatePickerDefaultFocusedDate]="focused" ${bindings}>
        <table ngpDatePickerGrid>
          <tbody>
            <tr *ngpDatePickerRowRender>
              <td *ngpDatePickerCellRender="let day" ngpDatePickerCell>
                <button ngpDatePickerDateButton>{{ day.getDate() }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
    {
      imports: IMPORTS,
      componentProperties: { focused: new Date(2025, 7, 15), ...props },
    },
  );

  await view.fixture.whenStable();

  const grid = view.container.querySelector('[ngpDatePickerGrid]') as HTMLElement;
  const dayButton = (day: number) =>
    Array.from(grid.querySelectorAll('[ngpDatePickerDateButton]')).find(
      button =>
        button.textContent?.trim() === String(day) && !button.hasAttribute('data-outside-month'),
    ) as HTMLButtonElement | undefined;

  return { ...view, grid, dayButton };
}

describe('NgpDatePicker', () => {
  describe('roles & grid attributes', () => {
    it('should expose role="grid" on the grid', async () => {
      const { grid } = await setup();
      expect(grid).toHaveAttribute('role', 'grid');
    });

    it('should label the grid with the calendar label via aria-labelledby', async () => {
      const { grid, container } = await setup();
      const label = container.querySelector('[ngpDatePickerLabel]') as HTMLElement;
      expect(label.id).toBeTruthy();
      expect(grid).toHaveAttribute('aria-labelledby', label.id);
    });

    it('should render each week as a row', async () => {
      const { getAllByRole } = await setup();
      // August 2025 with a Sunday start spans six weeks.
      expect(getAllByRole('row')).toHaveLength(6);
    });

    it('should expose role="gridcell" on every day cell', async () => {
      const { getAllByRole } = await setup();
      // Six weeks of seven days.
      expect(getAllByRole('gridcell')).toHaveLength(42);
    });

    it('should apply a roving tabindex with exactly one tabbable day', async () => {
      const { grid, tabbable } = await setup();
      const buttons = grid.querySelectorAll('[ngpDatePickerDateButton]');
      const tabbableButtons = grid.querySelectorAll('[ngpDatePickerDateButton][tabindex="0"]');

      expect(tabbableButtons).toHaveLength(1);
      expect(tabbable()?.textContent?.trim()).toBe('15');
      // Every other button is removed from the tab order.
      buttons.forEach(button => {
        if (button !== tabbable()) {
          expect(button).toHaveAttribute('tabindex', '-1');
        }
      });
    });

    it('should mark the grid as disabled when the picker is disabled', async () => {
      const { grid } = await setup({ disabled: true });
      expect(grid).toHaveAttribute('data-disabled', '');
    });
  });

  describe('day accessible name', () => {
    it('should not label every day cell with the shared month label', async () => {
      // a gridcell must not point at the month/year label (that would make every
      // cell announce "August 2025"); its name comes from its own day content
      const { getAllByRole, container } = await setup();
      const label = container.querySelector('[ngpDatePickerLabel]') as HTMLElement;
      const cells = getAllByRole('gridcell');
      cells.forEach(cell => expect(cell).not.toHaveAttribute('aria-labelledby', label.id));
      // the accessible name comes through from the day button (e.g. "15")
      const cellWith15 = cells.find(cell => cell.textContent?.trim() === '15');
      expect(cellWith15).toBeTruthy();
    });
  });

  describe('month navigation', () => {
    it('should navigate to the next month when the next button is clicked', async () => {
      const { container, focusedDateChange } = await setup();
      const next = container.querySelector('[ngpDatePickerNextMonth]') as HTMLButtonElement;

      next.click();

      const emitted = focusedDateChange.mock.calls.at(-1)?.[0] as Date;
      expect(emitted.getMonth()).toBe(8); // September
      expect(emitted.getFullYear()).toBe(2025);
      expect(emitted.getDate()).toBe(15); // focused day preserved
    });

    it('should navigate to the previous month when the previous button is clicked', async () => {
      const { container, focusedDateChange } = await setup();
      const prev = container.querySelector('[ngpDatePickerPreviousMonth]') as HTMLButtonElement;

      prev.click();

      const emitted = focusedDateChange.mock.calls.at(-1)?.[0] as Date;
      expect(emitted.getMonth()).toBe(6); // July
      expect(emitted.getFullYear()).toBe(2025);
      expect(emitted.getDate()).toBe(15);
    });

    it('should re-render the grid rows after navigating to a shorter month', async () => {
      const { container, focusedDateChange, fixture, grid } = await setup({
        focusedDate: new Date(2025, 0, 15), // January 2025 -> February
      });
      const next = container.querySelector('[ngpDatePickerNextMonth]') as HTMLButtonElement;

      next.click();
      await fixture.whenStable();

      const emitted = focusedDateChange.mock.calls.at(-1)?.[0] as Date;
      expect(emitted.getMonth()).toBe(1); // February
      // The tabbable day is now within February.
      const tabbable = grid.querySelector(
        '[ngpDatePickerDateButton][tabindex="0"]',
      ) as HTMLButtonElement;
      expect(tabbable.textContent?.trim()).toBe('15');
    });
  });

  describe('day selection', () => {
    it('should emit dateChange with the clicked date', async () => {
      const { dateChange, dayButton } = await setup();

      dayButton(20)!.click();

      const emitted = dateChange.mock.calls.at(-1)?.[0] as Date;
      expect(emitted.getFullYear()).toBe(2025);
      expect(emitted.getMonth()).toBe(7);
      expect(emitted.getDate()).toBe(20);
    });

    it('should mark the selected day with aria-selected and data-selected', async () => {
      const { dayButton, fixture } = await setup();

      dayButton(20)!.click();
      await fixture.whenStable();

      const selectedButton = dayButton(20)!;
      const selectedCell = selectedButton.closest('[ngpDatePickerCell]') as HTMLElement;
      expect(selectedButton).toHaveAttribute('data-selected', '');
      expect(selectedCell).toHaveAttribute('aria-selected', 'true');
      expect(selectedCell).toHaveAttribute('data-selected', '');
    });

    it('should reflect a controlled selected date', async () => {
      const { dayButton } = await setup({ date: new Date(2025, 7, 10) });
      const selectedCell = dayButton(10)!.closest('[ngpDatePickerCell]') as HTMLElement;
      expect(selectedCell).toHaveAttribute('aria-selected', 'true');
      expect(dayButton(10)).toHaveAttribute('data-selected', '');
      // Non-selected cells report aria-selected="false".
      expect(dayButton(11)!.closest('[ngpDatePickerCell]')).toHaveAttribute(
        'aria-selected',
        'false',
      );
    });

    it('should not emit dateChange when the whole picker is disabled', async () => {
      const { dateChange, dayButton } = await setup({ disabled: true });
      dayButton(20)!.click();
      expect(dateChange).not.toHaveBeenCalled();
    });
  });

  describe('today & selected marking', () => {
    it('should mark today with data-today', async () => {
      const today = new Date();
      const { grid } = await setup({ focusedDate: today });

      const todayButtons = grid.querySelectorAll('[ngpDatePickerDateButton][data-today]');
      expect(todayButtons).toHaveLength(1);
      expect(todayButtons[0].textContent?.trim()).toBe(String(today.getDate()));
    });

    it('should mark days outside the focused month with data-outside-month', async () => {
      const { grid } = await setup();
      const outside = grid.querySelectorAll('[ngpDatePickerDateButton][data-outside-month]');
      // July trailing days + September leading days are shown but marked outside.
      expect(outside.length).toBeGreaterThan(0);
    });
  });

  describe('keyboard grid navigation', () => {
    it('should move focus one day forward with ArrowRight', async () => {
      const { tabbable, fixture } = await setup();
      tabbable()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await fixture.whenStable();
      expect(tabbable()?.textContent?.trim()).toBe('16');
    });

    it('should move focus one day backward with ArrowLeft', async () => {
      const { tabbable, fixture } = await setup();
      tabbable()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      await fixture.whenStable();
      expect(tabbable()?.textContent?.trim()).toBe('14');
    });

    it('should ignore navigation keys with a modifier held and not preventDefault', async () => {
      const { tabbable, fixture } = await setup();
      // Capture the focused button by identity: comparing day text alone could
      // false-pass since outside-month cells can repeat a day number.
      const before = tabbable();
      // Alt+ArrowLeft is the browser back shortcut and must pass through: focus
      // stays put and the event is not consumed.
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        altKey: true,
        bubbles: true,
        cancelable: true,
      });
      tabbable()!.dispatchEvent(event);
      await fixture.whenStable();
      expect(tabbable()).toBe(before);
      expect(event.defaultPrevented).toBe(false);
    });

    it('should move focus one week forward with ArrowDown', async () => {
      const { tabbable, fixture } = await setup();
      tabbable()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await fixture.whenStable();
      expect(tabbable()?.textContent?.trim()).toBe('22');
    });

    it('should move focus one week backward with ArrowUp', async () => {
      const { tabbable, fixture } = await setup();
      tabbable()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
      await fixture.whenStable();
      expect(tabbable()?.textContent?.trim()).toBe('8');
    });

    it('should move focus to the first day of the month with Home', async () => {
      const { tabbable, fixture } = await setup();
      tabbable()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      await fixture.whenStable();
      expect(tabbable()?.textContent?.trim()).toBe('1');
    });

    it('should move focus to the last day of the month with End', async () => {
      const { tabbable, fixture } = await setup();
      tabbable()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      await fixture.whenStable();
      expect(tabbable()?.textContent?.trim()).toBe('31');
    });

    it('should move focus to the previous month with PageUp', async () => {
      const { tabbable, focusedDateChange, fixture } = await setup();
      tabbable()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true }));
      await fixture.whenStable();
      const emitted = focusedDateChange.mock.calls.at(-1)?.[0] as Date;
      expect(emitted.getMonth()).toBe(6); // July
      expect(emitted.getDate()).toBe(15);
      expect(tabbable()?.textContent?.trim()).toBe('15');
    });

    it('should move focus to the next month with PageDown', async () => {
      const { focusedDateChange, fixture, tabbable } = await setup();
      tabbable()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true }));
      await fixture.whenStable();
      const emitted = focusedDateChange.mock.calls.at(-1)?.[0] as Date;
      expect(emitted.getMonth()).toBe(8); // September
      expect(emitted.getDate()).toBe(15);
    });

    it('should cross the month boundary when arrowing off the first day', async () => {
      const { tabbable, focusedDateChange, fixture } = await setup({
        focusedDate: new Date(2025, 7, 1),
      });
      tabbable()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      await fixture.whenStable();
      const emitted = focusedDateChange.mock.calls.at(-1)?.[0] as Date;
      expect(emitted.getMonth()).toBe(6); // July
      expect(emitted.getDate()).toBe(31);
    });

    it('should reverse ArrowRight/ArrowLeft in an RTL calendar', async () => {
      const { tabbable, fixture } = await setup({ dir: 'rtl' });
      // In RTL, ArrowRight moves to the previous (earlier) day.
      tabbable()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await fixture.whenStable();
      expect(tabbable()?.textContent?.trim()).toBe('14');
    });
  });

  describe('min/max disabling', () => {
    const cellOf = (button: HTMLButtonElement) =>
      button.closest('[ngpDatePickerCell]') as HTMLElement;

    it('should disable days before the min date', async () => {
      const { dayButton } = await setup({ min: new Date(2025, 7, 10) });
      expect(cellOf(dayButton(5)!)).toHaveAttribute('aria-disabled', 'true');
      expect(cellOf(dayButton(5)!)).toHaveAttribute('data-disabled', '');
      // The min date itself remains enabled.
      expect(cellOf(dayButton(10)!)).toHaveAttribute('aria-disabled', 'false');
    });

    it('should disable days after the max date', async () => {
      const { dayButton } = await setup({ max: new Date(2025, 7, 20) });
      expect(cellOf(dayButton(25)!)).toHaveAttribute('aria-disabled', 'true');
      expect(cellOf(dayButton(20)!)).toHaveAttribute('aria-disabled', 'false');
    });

    it('should not select a day disabled by min', async () => {
      const { dateChange, dayButton } = await setup({ min: new Date(2025, 7, 10) });
      dayButton(5)!.click();
      expect(dateChange).not.toHaveBeenCalled();
    });

    it('should disable days rejected by the dateDisabled predicate', async () => {
      const { dateChange, dayButton } = await setup({
        dateDisabled: (date: Date) => date.getDate() === 12,
      });
      expect(cellOf(dayButton(12)!)).toHaveAttribute('aria-disabled', 'true');
      dayButton(12)!.click();
      expect(dateChange).not.toHaveBeenCalled();
    });
  });

  describe('preserve time on select', () => {
    it('should preserve the existing time when selecting with preserveTime=true', async () => {
      const { fixture, dateChange } = await setup();
      const picker = fixture.debugElement
        .query(By.directive(NgpDatePicker))
        .injector.get(NgpDatePicker) as NgpDatePicker<Date>;

      picker.select(new Date(2025, 7, 1, 14, 30, 45, 123));
      picker.select(new Date(2025, 7, 5), true);

      const emitted = dateChange.mock.calls.at(-1)?.[0] as Date;
      expect(emitted.getDate()).toBe(5);
      expect(emitted.getHours()).toBe(14);
      expect(emitted.getMinutes()).toBe(30);
      expect(emitted.getSeconds()).toBe(45);
      expect(emitted.getMilliseconds()).toBe(123);
    });

    it('should not emit dateChange when select is called with emit:false', async () => {
      const { fixture, dateChange } = await setup();
      const picker = fixture.debugElement
        .query(By.directive(NgpDatePicker))
        .injector.get(NgpDatePicker) as NgpDatePicker<Date>;

      picker.select(new Date(2025, 7, 5), false, { emit: false });
      expect(dateChange).not.toHaveBeenCalled();
    });
  });

  describe('controlled date', () => {
    it('should reflect a controlled date binding', async () => {
      const { dayButton } = await renderCustomPicker('[ngpDatePickerDate]="date"', {
        date: new Date(2025, 7, 15),
      });
      expect(dayButton(15)).toHaveAttribute('data-selected', '');
      expect(dayButton(20)).not.toHaveAttribute('data-selected');
    });

    it('should emit dateChange on click but keep the controlled selection when the parent does not write it back', async () => {
      const dateChange = vi.fn();
      const { dayButton, fixture } = await renderCustomPicker(
        '[ngpDatePickerDate]="date" (ngpDatePickerDateChange)="dateChange($event)"',
        { date: new Date(2025, 7, 15), dateChange },
      );

      dayButton(20)!.click();
      await fixture.whenStable();

      // the change is emitted so the parent can act on it...
      expect(dateChange).toHaveBeenCalled();
      expect((dateChange.mock.calls.at(-1)?.[0] as Date).getDate()).toBe(20);
      // ...but since the parent never writes it back, the controlled value stays put.
      expect(dayButton(15)).toHaveAttribute('data-selected', '');
      expect(dayButton(20)).not.toHaveAttribute('data-selected');
    });
  });

  describe('defaultDate (uncontrolled)', () => {
    it('should select the default date on init', async () => {
      const { dayButton } = await renderCustomPicker('[ngpDatePickerDefaultDate]="defaultDate"', {
        defaultDate: new Date(2025, 7, 15),
      });
      expect(dayButton(15)).toHaveAttribute('data-selected', '');
    });

    it('should let a click override the default date', async () => {
      const { dayButton, fixture } = await renderCustomPicker(
        '[ngpDatePickerDefaultDate]="defaultDate"',
        { defaultDate: new Date(2025, 7, 15) },
      );

      dayButton(20)!.click();
      await fixture.whenStable();

      expect(dayButton(20)).toHaveAttribute('data-selected', '');
      expect(dayButton(15)).not.toHaveAttribute('data-selected');
    });

    it('should prefer a controlled date over the default date', async () => {
      const { dayButton } = await renderCustomPicker(
        '[ngpDatePickerDate]="date" [ngpDatePickerDefaultDate]="defaultDate"',
        { date: new Date(2025, 7, 20), defaultDate: new Date(2025, 7, 15) },
      );
      expect(dayButton(20)).toHaveAttribute('data-selected', '');
      expect(dayButton(15)).not.toHaveAttribute('data-selected');
    });
  });

  describe('defaultFocusedDate (uncontrolled)', () => {
    it('should apply the roving tabindex to the default focused date on init', async () => {
      const { grid } = await renderCustomPicker('', { focused: new Date(2025, 7, 10) });
      const tabbable = grid.querySelector('[ngpDatePickerDateButton][tabindex="0"]');
      expect(tabbable?.textContent?.trim()).toBe('10');
    });
  });
});

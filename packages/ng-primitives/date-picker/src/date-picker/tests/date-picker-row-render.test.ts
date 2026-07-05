import { Component, signal, viewChild } from '@angular/core';
import { render } from '@testing-library/angular';
import { NgpDatePicker, NgpDatePickerRowRender } from 'ng-primitives/date-picker';
import { describe, expect, it } from 'vitest';

const firstOfAugust2025 = new Date(2025, 7, 1);
const lastOfAugust2025 = new Date(2025, 7, 31);

@Component({
  template: `
    <div
      [ngpDatePickerFocusedDate]="focusedDate()"
      [ngpDatePickerFirstDayOfWeek]="firstDayOfWeek()"
      ngpDatePicker
    >
      <div class="week" *ngpDatePickerRowRender></div>
    </div>
  `,
  imports: [NgpDatePicker, NgpDatePickerRowRender],
})
class TestHost {
  readonly focusedDate = signal<Date>(firstOfAugust2025);
  readonly firstDayOfWeek = signal<number>(7);
  readonly rowRender = viewChild.required<NgpDatePickerRowRender<Date>>(NgpDatePickerRowRender);
}

async function setup() {
  const view = await render(TestHost);
  await view.fixture.whenStable();
  const host = view.fixture.componentInstance;

  const setFirstDayOfWeek = async (day: number) => {
    host.firstDayOfWeek.set(day);
    await view.fixture.whenStable();
  };

  // access the protected `weeks` computed for assertions.
  const weeks = () => host.rowRender()['weeks']();

  return { view, host, setFirstDayOfWeek, weeks };
}

describe('NgpDatePickerRowRender', () => {
  it('should calculate the first day of the week offset', async () => {
    const { host, setFirstDayOfWeek } = await setup();
    const rowRender = host.rowRender();

    expect(rowRender.getFirstDayOfWeekOffset(firstOfAugust2025)).toBe(5);
    expect(rowRender.getLastDayOfWeekOffset(lastOfAugust2025)).toBe(6);

    await setFirstDayOfWeek(1);
    expect(rowRender.getFirstDayOfWeekOffset(firstOfAugust2025)).toBe(4);
    expect(rowRender.getLastDayOfWeekOffset(lastOfAugust2025)).toBe(0);

    await setFirstDayOfWeek(2);
    expect(rowRender.getFirstDayOfWeekOffset(firstOfAugust2025)).toBe(3);
    expect(rowRender.getLastDayOfWeekOffset(lastOfAugust2025)).toBe(1);

    await setFirstDayOfWeek(3);
    expect(rowRender.getFirstDayOfWeekOffset(firstOfAugust2025)).toBe(2);
    expect(rowRender.getLastDayOfWeekOffset(lastOfAugust2025)).toBe(2);

    await setFirstDayOfWeek(4);
    expect(rowRender.getFirstDayOfWeekOffset(firstOfAugust2025)).toBe(1);
    expect(rowRender.getLastDayOfWeekOffset(lastOfAugust2025)).toBe(3);

    await setFirstDayOfWeek(5);
    expect(rowRender.getFirstDayOfWeekOffset(firstOfAugust2025)).toBe(0);
    expect(rowRender.getLastDayOfWeekOffset(lastOfAugust2025)).toBe(4);

    await setFirstDayOfWeek(6);
    expect(rowRender.getFirstDayOfWeekOffset(firstOfAugust2025)).toBe(6);
    expect(rowRender.getLastDayOfWeekOffset(lastOfAugust2025)).toBe(5);
  });

  it('should calculate the days and first week', async () => {
    const { weeks } = await setup();
    expect(weeks()).toEqual(
      expect.arrayContaining([
        [
          new Date(2025, 6, 27),
          new Date(2025, 6, 28),
          new Date(2025, 6, 29),
          new Date(2025, 6, 30),
          new Date(2025, 6, 31),
          new Date(2025, 7, 1),
          new Date(2025, 7, 2),
        ],
      ]),
    );
  });

  it('should calculate the days and last week', async () => {
    const { weeks } = await setup();
    expect(weeks()).toEqual(
      expect.arrayContaining([
        [
          new Date(2025, 7, 31),
          new Date(2025, 8, 1),
          new Date(2025, 8, 2),
          new Date(2025, 8, 3),
          new Date(2025, 8, 4),
          new Date(2025, 8, 5),
          new Date(2025, 8, 6),
        ],
      ]),
    );
  });

  it('should calculate the first week with the first day of the week offset', async () => {
    const { weeks, setFirstDayOfWeek } = await setup();
    await setFirstDayOfWeek(1);
    expect(weeks()).toEqual(
      expect.arrayContaining([
        [
          new Date(2025, 6, 28),
          new Date(2025, 6, 29),
          new Date(2025, 6, 30),
          new Date(2025, 6, 31),
          new Date(2025, 7, 1),
          new Date(2025, 7, 2),
          new Date(2025, 7, 3),
        ],
      ]),
    );
  });

  it('should calculate the last week with the first day of the week offset', async () => {
    const { weeks, setFirstDayOfWeek } = await setup();
    await setFirstDayOfWeek(1);
    expect(weeks()).toEqual(
      expect.arrayContaining([
        [
          new Date(2025, 7, 25),
          new Date(2025, 7, 26),
          new Date(2025, 7, 27),
          new Date(2025, 7, 28),
          new Date(2025, 7, 29),
          new Date(2025, 7, 30),
          new Date(2025, 7, 31),
        ],
      ]),
    );
  });

  it('should re-render rows in the DOM when firstDayOfWeek changes within the same month', async () => {
    const { view, setFirstDayOfWeek } = await setup();

    // Initial render with default firstDayOfWeek (7 = Sunday).
    // August 2025 with Sunday start spans 6 weeks (Jul 27 - Sep 6).
    expect(view.container.querySelectorAll('.week')).toHaveLength(6);

    // Change firstDayOfWeek to Monday (1).
    await setFirstDayOfWeek(1);

    // August 2025 with Monday start spans 5 weeks (Jul 28 - Aug 31).
    expect(view.container.querySelectorAll('.week')).toHaveLength(5);
  });
});

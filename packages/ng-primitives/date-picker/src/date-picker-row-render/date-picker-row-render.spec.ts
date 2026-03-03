import {
  Component,
  InputSignal,
  InputSignalWithTransform,
  Provider,
  signal,
  viewChild,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgpNativeDateAdapter } from 'ng-primitives/date-time';
import { defaultDatePickerConfig } from '../config/date-picker-config';
import { NgpDatePicker } from '../date-picker/date-picker';
import {
  NgpDatePickerFirstDayOfWeekNumber,
  NgpDatePickerFirstDayOfWeekNumberInput,
} from '../date-picker/date-picker-first-day-of-week';
import {
  injectDateControllerState,
  NgpDatePickerStateToken,
} from '../date-picker/date-picker-state';
import { NgpDatePickerRowRender } from './date-picker-row-render';

describe('NgpDatePickerRowRender', () => {
  const adapter = new NgpNativeDateAdapter();
  const firstOfAugust2025 = adapter.create({ year: 2025, month: 8, day: 1 });
  const lastOfAugust2025 = adapter.create({ year: 2025, month: 8, day: 31 });

  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [
        provideMockDatePickerState(firstOfAugust2025, defaultDatePickerConfig.firstDayOfWeek),
      ],
    });
    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    host = fixture.componentInstance;
  });

  it('should calculate the first day of the week offset', () => {
    const firstDayOfWeek = TestBed.runInInjectionContext(
      () => injectDateControllerState()().firstDayOfWeek,
    );

    expect(host.rowRender().getFirstDayOfWeekOffset(firstOfAugust2025)).toBe(5);
    expect(host.rowRender().getLastDayOfWeekOffset(lastOfAugust2025)).toBe(6);

    firstDayOfWeek.set(1);

    expect(host.rowRender().getFirstDayOfWeekOffset(firstOfAugust2025)).toBe(4);
    expect(host.rowRender().getLastDayOfWeekOffset(lastOfAugust2025)).toBe(0);

    firstDayOfWeek.set(2);
    expect(host.rowRender().getFirstDayOfWeekOffset(firstOfAugust2025)).toBe(3);
    expect(host.rowRender().getLastDayOfWeekOffset(lastOfAugust2025)).toBe(1);

    firstDayOfWeek.set(3);
    expect(host.rowRender().getFirstDayOfWeekOffset(firstOfAugust2025)).toBe(2);
    expect(host.rowRender().getLastDayOfWeekOffset(lastOfAugust2025)).toBe(2);

    firstDayOfWeek.set(4);
    expect(host.rowRender().getFirstDayOfWeekOffset(firstOfAugust2025)).toBe(1);
    expect(host.rowRender().getLastDayOfWeekOffset(lastOfAugust2025)).toBe(3);

    firstDayOfWeek.set(5);
    expect(host.rowRender().getFirstDayOfWeekOffset(firstOfAugust2025)).toBe(0);
    expect(host.rowRender().getLastDayOfWeekOffset(lastOfAugust2025)).toBe(4);

    firstDayOfWeek.set(6);
    expect(host.rowRender().getFirstDayOfWeekOffset(firstOfAugust2025)).toBe(6);
    expect(host.rowRender().getLastDayOfWeekOffset(lastOfAugust2025)).toBe(5);
  });

  it('should calculate the days and first week', () => {
    expect(host.rowRender()['weeks']()).toEqual(
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

  it('should calculate the days and last week', () => {
    expect(host.rowRender()['weeks']()).toEqual(
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

  it('should calculate the days and last week with the first day of the week offset', () => {
    const firstDayOfWeek = TestBed.runInInjectionContext(
      () => injectDateControllerState()().firstDayOfWeek,
    );

    firstDayOfWeek.set(1);
    expect(host.rowRender()['weeks']()).toEqual(
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

  it('should calculate the days and last week with the first day of the week offset', () => {
    const firstDayOfWeek = TestBed.runInInjectionContext(
      () => injectDateControllerState()().firstDayOfWeek,
    );

    firstDayOfWeek.set(1);
    expect(host.rowRender()['weeks']()).toEqual(
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

  it('should re-render rows in the DOM when firstDayOfWeek changes within the same month', () => {
    const firstDayOfWeek = TestBed.runInInjectionContext(
      () => injectDateControllerState()().firstDayOfWeek,
    );

    // Initial render with default firstDayOfWeek (7 = Sunday)
    // August 2025 with Sunday start spans 6 weeks (Jul 27 - Sep 6)
    const initialRows = fixture.nativeElement.querySelectorAll('div');
    expect(initialRows.length).toBe(6);

    // Change firstDayOfWeek to Monday (1)
    firstDayOfWeek.set(1);
    fixture.detectChanges();

    // August 2025 with Monday start spans 5 weeks (Jul 28 - Aug 31)
    const updatedRows = fixture.nativeElement.querySelectorAll('div');
    expect(updatedRows.length).toBe(5);
  });
});

@Component({
  template: `
    <div *ngpDatePickerRowRender></div>
  `,
  imports: [NgpDatePickerRowRender],
})
class TestHost {
  public rowRender = viewChild.required<NgpDatePickerRowRender<Date>>(NgpDatePickerRowRender);
}

/** Provide a partial mock date picker state. */
function provideMockDatePickerState(
  date: Date,
  firstDayOfWeek: NgpDatePickerFirstDayOfWeekNumber,
): Provider {
  return {
    provide: NgpDatePickerStateToken,
    useValue: signal({
      focusedDate: signal(date) as unknown as InputSignal<Date>,
      firstDayOfWeek: signal(firstDayOfWeek) as unknown as InputSignalWithTransform<
        NgpDatePickerFirstDayOfWeekNumber,
        NgpDatePickerFirstDayOfWeekNumberInput
      >,
    } satisfies Partial<NgpDatePicker<Date>>),
  };
}

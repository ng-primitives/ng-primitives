import { BooleanInput } from '@angular/cdk/coercion';
import {
  Component,
  InputSignal,
  InputSignalWithTransform,
  Provider,
  signal,
  WritableSignal,
  viewChild,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgpNativeDateAdapter } from 'ng-primitives/date-time';
import { NgpDatePicker } from '../date-picker/date-picker';
import { NgpDatePickerStateToken } from '../date-picker/date-picker-state';
import { NgpDatePickerPreviousMonth } from './date-picker-previous-month';

describe('NgpDatePickerPreviousMonth', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;
  let focusedDateSignal: WritableSignal<Date>;
  let disabledSignal: WritableSignal<boolean>;
  let minSignal: WritableSignal<Date | undefined>;
  let dateAdapter: NgpNativeDateAdapter;

  beforeEach(() => {
    dateAdapter = new NgpNativeDateAdapter();
    focusedDateSignal = signal(new Date());
    disabledSignal = signal(false);
    minSignal = signal(undefined);

    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideMockDatePickerState(focusedDateSignal, disabledSignal, minSignal)],
    });
    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    host = fixture.componentInstance;
  });

  it('should create', () => {
    expect(host.previousMonth()).toBeTruthy();
  });

  it('should navigate to previous month when clicked', () => {
    const currentDate = new Date(2025, 2, 15); // March 15, 2025
    focusedDateSignal.set(currentDate);

    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();

    const newDate = focusedDateSignal();
    expect(dateAdapter.getMonth(newDate)).toBe(1); // February
    expect(dateAdapter.getYear(newDate)).toBe(2025);
    expect(dateAdapter.getDate(newDate)).toBe(1); // First day of the month
  });

  it('should handle navigation from 31st of month to previous month without 31 days', () => {
    const currentDate = new Date(2025, 2, 31); // March 31, 2025
    focusedDateSignal.set(currentDate);

    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();

    const newDate = focusedDateSignal();
    // Should navigate to February 1, 2025 (February only has 28 days in 2025)
    expect(dateAdapter.getMonth(newDate)).toBe(1); // February
    expect(dateAdapter.getYear(newDate)).toBe(2025);
    expect(dateAdapter.getDate(newDate)).toBe(1); // First day of February
  });

  it('should handle navigation from January to December of previous year', () => {
    const currentDate = new Date(2025, 0, 15); // January 15, 2025
    focusedDateSignal.set(currentDate);

    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();

    const newDate = focusedDateSignal();
    expect(dateAdapter.getMonth(newDate)).toBe(11); // December
    expect(dateAdapter.getYear(newDate)).toBe(2024);
    expect(dateAdapter.getDate(newDate)).toBe(1);
  });

  it('should not navigate when disabled', () => {
    const currentDate = new Date(2025, 2, 15); // March 15, 2025
    focusedDateSignal.set(currentDate);
    disabledSignal.set(true);

    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();

    const newDate = focusedDateSignal();
    expect(dateAdapter.getMonth(newDate)).toBe(2); // Still March
    expect(dateAdapter.getDate(newDate)).toBe(15);
  });

  it('should be disabled when min date is in current month', () => {
    const currentDate = new Date(2025, 2, 15); // March 15, 2025
    const minDate = new Date(2025, 2, 1); // March 1, 2025
    focusedDateSignal.set(currentDate);
    minSignal.set(minDate);

    fixture.detectChanges();

    expect(host.previousMonth().disabled()).toBe(true);
  });

  it('should not be disabled when min date is in previous month', () => {
    const currentDate = new Date(2025, 2, 15); // March 15, 2025
    const minDate = new Date(2025, 1, 1); // February 1, 2025
    focusedDateSignal.set(currentDate);
    minSignal.set(minDate);

    fixture.detectChanges();

    expect(host.previousMonth().disabled()).toBe(false);
  });

  it('should set time to midnight when navigating', () => {
    const currentDate = new Date(2025, 2, 15, 14, 30, 45, 500); // March 15, 2025, 2:30:45.500 PM
    focusedDateSignal.set(currentDate);

    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();

    const newDate = focusedDateSignal();
    expect(dateAdapter.getHours(newDate)).toBe(0);
    expect(dateAdapter.getMinutes(newDate)).toBe(0);
    expect(dateAdapter.getSeconds(newDate)).toBe(0);
    expect(dateAdapter.getMilliseconds(newDate)).toBe(0);
  });

  it('should have correct aria-disabled attribute when disabled', () => {
    disabledSignal.set(true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.hasAttribute('aria-disabled')).toBe(true);
  });

  it('should have correct aria-disabled attribute when not disabled', () => {
    disabledSignal.set(false);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.hasAttribute('aria-disabled')).toBe(false);
  });

  it('should have type="button" attribute for button elements', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('type')).toBe('button');
  });
});

@Component({
  template: `
    <button ngpDatePickerPreviousMonth>Go to Previous Month</button>
  `,
  imports: [NgpDatePickerPreviousMonth],
})
class TestHost {
  public previousMonth = viewChild.required<NgpDatePickerPreviousMonth<Date>>(
    NgpDatePickerPreviousMonth,
  );
}

function provideMockDatePickerState(
  focusedDate: WritableSignal<Date>,
  disabled: WritableSignal<boolean>,
  min: WritableSignal<Date | undefined>,
): Provider {
  return {
    provide: NgpDatePickerStateToken,
    useValue: signal({
      focusedDate: focusedDate as unknown as InputSignal<Date>,
      disabled: disabled as unknown as InputSignalWithTransform<boolean, BooleanInput>,
      min: min as unknown as InputSignal<Date | undefined>,
      max: signal(undefined) as unknown as InputSignal<Date | undefined>,
      setFocusedDate: jest.fn((date: Date) => {
        focusedDate.set(date);
      }),
    } satisfies Partial<NgpDatePicker<Date>>),
  };
}

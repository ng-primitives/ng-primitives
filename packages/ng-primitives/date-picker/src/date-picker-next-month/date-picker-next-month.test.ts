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
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { NgpDatePicker } from '../date-picker/date-picker';
import { NgpDatePickerStateToken } from '../date-picker/date-picker-state';
import { NgpDatePickerNextMonth } from './date-picker-next-month';

describe('NgpDatePickerNextMonth', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;
  let focusedDateSignal: WritableSignal<Date>;
  let disabledSignal: WritableSignal<boolean>;
  let maxSignal: WritableSignal<Date | undefined>;
  let dateAdapter: NgpNativeDateAdapter;

  beforeEach(() => {
    dateAdapter = new NgpNativeDateAdapter();
    focusedDateSignal = signal(new Date());
    disabledSignal = signal(false);
    maxSignal = signal(undefined);

    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideMockDatePickerState(focusedDateSignal, disabledSignal, maxSignal)],
    });
    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    host = fixture.componentInstance;
  });

  it('should create', () => {
    expect(host.nextMonth()).toBeTruthy();
  });

  it('should navigate to next month when clicked', () => {
    const currentDate = new Date(2025, 2, 15); // March 15, 2025
    focusedDateSignal.set(currentDate);

    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();

    const newDate = focusedDateSignal();
    expect(dateAdapter.getMonth(newDate)).toBe(3); // April
    expect(dateAdapter.getYear(newDate)).toBe(2025);
    expect(dateAdapter.getDate(newDate)).toBe(15); // Focused day is preserved
  });

  it('should advance exactly one month from the 31st of a month into a shorter month', () => {
    const currentDate = new Date(2026, 4, 31); // May 31, 2026 (June has 30 days)
    focusedDateSignal.set(currentDate);

    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();

    const newDate = focusedDateSignal();
    // Should navigate to June 30, 2026 - clamped to the last day, not skip to July.
    expect(dateAdapter.getMonth(newDate)).toBe(5); // June
    expect(dateAdapter.getYear(newDate)).toBe(2026);
    expect(dateAdapter.getDate(newDate)).toBe(30); // Clamped to the last day of June
  });

  it('should handle navigation from December to January of next year', () => {
    const currentDate = new Date(2025, 11, 15); // December 15, 2025
    focusedDateSignal.set(currentDate);

    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();

    const newDate = focusedDateSignal();
    expect(dateAdapter.getMonth(newDate)).toBe(0); // January
    expect(dateAdapter.getYear(newDate)).toBe(2026);
    expect(dateAdapter.getDate(newDate)).toBe(15); // Focused day is preserved
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

  it('should be disabled when max date is in current month', () => {
    const currentDate = new Date(2025, 2, 15); // March 15, 2025
    const maxDate = new Date(2025, 2, 31); // March 31, 2025
    focusedDateSignal.set(currentDate);
    maxSignal.set(maxDate);

    fixture.detectChanges();

    expect(host.nextMonth().disabled()).toBe(true);
  });

  it('should not be disabled when max date is in next month', () => {
    const currentDate = new Date(2025, 2, 15); // March 15, 2025
    const maxDate = new Date(2025, 3, 1); // April 1, 2025
    focusedDateSignal.set(currentDate);
    maxSignal.set(maxDate);

    fixture.detectChanges();

    expect(host.nextMonth().disabled()).toBe(false);
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
    expect(button.getAttribute('aria-disabled')).toBe('true');
  });

  it('should have correct aria-disabled attribute when not disabled', () => {
    disabledSignal.set(false);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button).not.toHaveAttribute('aria-disabled');
  });

  it('should have type="button" attribute for button elements', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('type')).toBe('button');
  });
});

@Component({
  template: `
    <button ngpDatePickerNextMonth>Go to Next Month</button>
  `,
  imports: [NgpDatePickerNextMonth],
})
class TestHost {
  public nextMonth = viewChild.required<NgpDatePickerNextMonth<Date>>(NgpDatePickerNextMonth);
}

function provideMockDatePickerState(
  focusedDate: WritableSignal<Date>,
  disabled: WritableSignal<boolean>,
  max: WritableSignal<Date | undefined>,
): Provider {
  return {
    provide: NgpDatePickerStateToken,
    useValue: signal({
      focusedDate: focusedDate as unknown as InputSignal<Date>,
      disabled: disabled as unknown as InputSignalWithTransform<boolean, BooleanInput>,
      min: signal(undefined) as unknown as InputSignal<Date | undefined>,
      max: max as unknown as InputSignal<Date | undefined>,
      setFocusedDate: vi.fn((date: Date) => {
        focusedDate.set(date);
      }),
    } satisfies Partial<NgpDatePicker<Date>>),
  };
}

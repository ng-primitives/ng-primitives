import { Component, InputSignal, Provider, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InjectedState } from 'ng-primitives/state';
import { NgpDateRangePicker } from './date-range-picker';
import {
  injectDateRangePickerState,
  NgpDateRangePickerStateToken,
} from './date-range-picker-state';

describe('NgpDatePickerRowRender', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;
  let state: InjectedState<NgpDateRangePicker<Date>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideMockDateRangePickerState()],
    });
    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    host = fixture.componentInstance;
    state = TestBed.runInInjectionContext(() => injectDateRangePickerState());
  });

  it('should create', () => {
    expect(host.rangePicker()).toBeTruthy();
  });

  describe('when selecting a date', () => {
    it('should select a start date when neither a start date nor an end date is selected', () => {
      const testStartDate = new Date(2025, 7, 1);
      host.rangePicker().select(testStartDate);
      expect(state().startDate()).toBe(testStartDate);
      expect(state().endDate()).toBe(undefined);
    });

    it('should select an end date when a start date is selected and the selected date is after the start date', () => {
      const testStartDate = new Date(2025, 7, 1);
      const testEndDate = new Date(2025, 7, 2);
      host.rangePicker().select(testStartDate);
      host.rangePicker().select(testEndDate);
      expect(state().startDate()).toBe(testStartDate);
      expect(state().endDate()).toBe(testEndDate);
    });

    it('should select a start date when a start date is selected and the selected date is before the start date', () => {
      const testStartDate = new Date(2025, 7, 1);
      const testEndDate = new Date(2025, 6, 31);
      host.rangePicker().select(testStartDate);
      host.rangePicker().select(testEndDate);
      expect(state().startDate()).toBe(testEndDate);
      expect(state().endDate()).toBe(testStartDate);
    });

    it('should select a single date when the selected date is the same as the start date', () => {
      const testStartDate = new Date(2025, 7, 1);
      host.rangePicker().select(testStartDate);
      host.rangePicker().select(testStartDate);
      expect(state().startDate()).toBe(testStartDate);
      expect(state().endDate()).toBe(testStartDate);
    });
  });
});

@Component({
  template: `
    <div ngpDateRangePicker></div>
  `,
  imports: [NgpDateRangePicker],
})
class TestHost {
  public rangePicker = viewChild.required<NgpDateRangePicker<Date>>(NgpDateRangePicker);
}

/** Provide a partial mock date picker state. */
function provideMockDateRangePickerState(): Provider {
  return {
    provide: NgpDateRangePickerStateToken,
    useValue: signal({
      startDate: signal(undefined) as unknown as InputSignal<Date | undefined>,
      endDate: signal(undefined) as unknown as InputSignal<Date | undefined>,
    } satisfies Partial<NgpDateRangePicker<Date>>),
  };
}

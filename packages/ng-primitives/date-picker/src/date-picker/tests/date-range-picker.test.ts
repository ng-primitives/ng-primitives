import { Component, Type, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import {
  injectDateRangePickerState,
  NgpDateRangePicker,
  provideDateRangePickerState,
} from 'ng-primitives/date-picker';
import { InjectedState } from 'ng-primitives/state';
import { beforeEach, describe, expect, it } from 'vitest';

@Component({
  template: `
    <div ngpDateRangePicker></div>
  `,
  imports: [NgpDateRangePicker],
})
class TestHost {
  readonly rangePicker = viewChild.required<NgpDateRangePicker<Date>>(NgpDateRangePicker);
}

@Component({
  template: `
    <div [ngpDateRangePickerStartDate]="startDate" ngpDateRangePicker></div>
  `,
  imports: [NgpDateRangePicker],
})
class ControlledStartHost {
  startDate: Date | undefined = new Date(2025, 7, 10);
  readonly rangePicker = viewChild.required<NgpDateRangePicker<Date>>(NgpDateRangePicker);
}

@Component({
  template: `
    <div [ngpDateRangePickerDefaultStartDate]="defaultStartDate" ngpDateRangePicker></div>
  `,
  imports: [NgpDateRangePicker],
})
class DefaultStartHost {
  defaultStartDate: Date | undefined = new Date(2025, 7, 10);
  readonly rangePicker = viewChild.required<NgpDateRangePicker<Date>>(NgpDateRangePicker);
}

async function renderRangeHost<T>(component: Type<T>) {
  // Provide the range picker state at the module level so the directive (which
  // inherits it via skipSelf) and the test share the same state signal.
  const view = await render(component, { providers: [provideDateRangePickerState()] });
  await view.fixture.whenStable();
  const state = TestBed.runInInjectionContext(() => injectDateRangePickerState<Date>());
  return { host: view.fixture.componentInstance, state, view };
}

describe('NgpDateRangePicker', () => {
  let host: TestHost;
  let state: InjectedState<NgpDateRangePicker<Date>>;

  beforeEach(async () => {
    // Provide the range picker state at the module level so the directive (which
    // inherits it via skipSelf) and the test share the same state signal.
    const view = await render(TestHost, { providers: [provideDateRangePickerState()] });
    await view.fixture.whenStable();
    host = view.fixture.componentInstance;
    state = TestBed.runInInjectionContext(() => injectDateRangePickerState<Date>());
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

  describe('when preserving time', () => {
    it('should preserve time components from start date when resetting selection with preserveTime=true', () => {
      // Set initial start and end dates
      const startDate = new Date(2025, 7, 1, 14, 30, 45, 123);
      const endDate = new Date(2025, 7, 10);
      host.rangePicker().select(startDate);
      host.rangePicker().select(endDate);

      // Both dates are now selected. Select a new date with preserveTime=true (this resets selection)
      const newDate = new Date(2025, 7, 5); // Different day, default time (00:00:00)
      host.rangePicker().select(newDate, true);

      const resultStartDate = state().startDate();
      expect(resultStartDate?.getFullYear()).toBe(2025);
      expect(resultStartDate?.getMonth()).toBe(7);
      expect(resultStartDate?.getDate()).toBe(5);
      expect(resultStartDate?.getHours()).toBe(14); // Preserved from original start
      expect(resultStartDate?.getMinutes()).toBe(30);
      expect(resultStartDate?.getSeconds()).toBe(45);
      expect(resultStartDate?.getMilliseconds()).toBe(123);

      expect(state().endDate()).toBeUndefined(); // End date should be cleared
    });

    it('should preserve time components when swapping start/end dates with preserveTime=true', () => {
      // Set initial start date with specific time
      const initialStartDate = new Date(2025, 7, 5, 9, 15, 30);
      host.rangePicker().select(initialStartDate);

      // Select an earlier date with preserveTime=true (this will swap the dates)
      const earlierDate = new Date(2025, 7, 3); // Default time (00:00:00)
      host.rangePicker().select(earlierDate, true);

      // The earlier date becomes start with preserved time from original start
      const resultStartDate = state().startDate();
      expect(resultStartDate?.getFullYear()).toBe(2025);
      expect(resultStartDate?.getMonth()).toBe(7);
      expect(resultStartDate?.getDate()).toBe(3);
      expect(resultStartDate?.getHours()).toBe(9);
      expect(resultStartDate?.getMinutes()).toBe(15);
      expect(resultStartDate?.getSeconds()).toBe(30);

      // The original start becomes end (unchanged)
      const resultEndDate = state().endDate();
      expect(resultEndDate).toBe(initialStartDate);
    });

    it('should preserve midnight (00:00:00) time when preserveTime=true', () => {
      // Set initial start and end dates (start with midnight)
      const startDate = new Date(2025, 7, 1, 0, 0, 0, 0);
      const endDate = new Date(2025, 7, 10);
      host.rangePicker().select(startDate);
      host.rangePicker().select(endDate);

      // Both dates are selected. Select a new date with preserveTime=true (resets selection)
      const newDate = new Date(2025, 7, 5, 12, 30); // Different day with afternoon time
      host.rangePicker().select(newDate, true);

      const resultStartDate = state().startDate();
      expect(resultStartDate?.getFullYear()).toBe(2025);
      expect(resultStartDate?.getMonth()).toBe(7);
      expect(resultStartDate?.getDate()).toBe(5);
      expect(resultStartDate?.getHours()).toBe(0); // Preserved midnight from original start
      expect(resultStartDate?.getMinutes()).toBe(0);
      expect(resultStartDate?.getSeconds()).toBe(0);
      expect(resultStartDate?.getMilliseconds()).toBe(0);

      expect(state().endDate()).toBeUndefined(); // End date should be cleared
    });

    it('should not preserve time when preserveTime=false (default)', () => {
      // Set initial start and end dates
      const startDate = new Date(2025, 7, 1, 14, 30, 45);
      const endDate = new Date(2025, 7, 10);
      host.rangePicker().select(startDate);
      host.rangePicker().select(endDate);

      // Both dates are selected. Select a new date without preserveTime (resets selection)
      const newDate = new Date(2025, 7, 5, 10, 20, 15);
      host.rangePicker().select(newDate);

      const resultStartDate = state().startDate();
      expect(resultStartDate).toBe(newDate); // Should be exactly the new date object
      expect(state().endDate()).toBeUndefined(); // End date should be cleared
    });

    it('should use original date when no existing date to preserve time from', () => {
      // Select date with preserveTime=true but no existing date
      const newDate = new Date(2025, 7, 1, 14, 30);
      host.rangePicker().select(newDate, true);

      const resultStartDate = state().startDate();
      expect(resultStartDate).toBe(newDate); // Should be exactly the original date
    });

    it('should preserve time when setting end date with preserveTime=true', () => {
      // Set start date first
      const startDate = new Date(2025, 7, 1);
      host.rangePicker().select(startDate);

      // Set end date with specific time
      const endDate = new Date(2025, 7, 10, 16, 45, 30);
      host.rangePicker().select(endDate);

      // Both dates selected, now select new date with preserveTime=true (resets to start)
      const resetDate = new Date(2025, 7, 15); // New start date
      host.rangePicker().select(resetDate, true);

      // Should preserve time from the original start date (which had default time)
      const resultStartDate = state().startDate();
      expect(resultStartDate?.getFullYear()).toBe(2025);
      expect(resultStartDate?.getMonth()).toBe(7);
      expect(resultStartDate?.getDate()).toBe(15);
      // Time should be preserved from original start date (00:00:00 by default)
      expect(resultStartDate?.getHours()).toBe(0);
      expect(resultStartDate?.getMinutes()).toBe(0);
      expect(resultStartDate?.getSeconds()).toBe(0);

      expect(state().endDate()).toBeUndefined(); // End date should be cleared
    });
  });
});

describe('NgpDateRangePicker controlled/uncontrolled value', () => {
  describe('controlled startDate', () => {
    it('should reflect a controlled startDate binding', async () => {
      const { host, state } = await renderRangeHost(ControlledStartHost);
      expect(state().startDate()).toBe(host.startDate);
    });

    it('should keep a controlled startDate pinned when an internal reset would change it', async () => {
      const { host, state } = await renderRangeHost(ControlledStartHost);
      const controlled = host.startDate;

      // Build a full range, then select again to hit the reset branch, which calls
      // setStart — on a controlled start that must latch rather than move.
      host.rangePicker().select(new Date(2025, 7, 15));
      host.rangePicker().select(new Date(2025, 7, 20));

      expect(state().startDate()).toBe(controlled);
    });
  });

  describe('defaultStartDate (uncontrolled)', () => {
    it('should use the default start date on init', async () => {
      const { host, state } = await renderRangeHost(DefaultStartHost);
      expect(state().startDate()).toBe(host.defaultStartDate);
    });

    it('should let an internal reset change the start date (uncontrolled)', async () => {
      const { host, state } = await renderRangeHost(DefaultStartHost);

      // Mirror of the controlled latch test: build a full range then select again
      // to hit the reset branch. Uncontrolled, so setStart actually moves it.
      host.rangePicker().select(new Date(2025, 7, 15));
      host.rangePicker().select(new Date(2025, 7, 20));

      expect(state().startDate()?.getDate()).toBe(20);
    });
  });
});

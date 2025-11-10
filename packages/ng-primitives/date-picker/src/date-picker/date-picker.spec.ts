import { Component, InputSignal, Provider, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import { InjectedState } from 'ng-primitives/state';
import { NgpDatePicker } from './date-picker';
import { injectDatePickerState, NgpDatePickerStateToken } from './date-picker-state';

describe('NgpDatePicker', () => {
  it('should initialise correctly', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const container = await render(`<div ngpDatePicker></div>`, {
      imports: [NgpDatePicker],
    });
  });

  describe('with component test setup', () => {
    let fixture: ComponentFixture<TestHost>;
    let host: TestHost;
    let state: InjectedState<NgpDatePicker<Date>>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestHost],
        providers: [provideMockDatePickerState()],
      });
      fixture = TestBed.createComponent(TestHost);
      fixture.detectChanges();
      host = fixture.componentInstance;
      state = TestBed.runInInjectionContext(() => injectDatePickerState());
    });

    it('should create', () => {
      expect(host.datePicker()).toBeTruthy();
    });

    describe('when preserving time', () => {
      it('should preserve time components from existing date when selecting with preserveTime=true', () => {
        // Set initial date with specific time
        const initialDate = new Date(2025, 7, 1, 14, 30, 45, 123);
        host.datePicker().select(initialDate);

        // Select a new date with preserveTime=true
        const newDate = new Date(2025, 7, 5); // Different day, default time (00:00:00)
        host.datePicker().select(newDate, true);

        const resultDate = state().date();
        expect(resultDate?.getFullYear()).toBe(2025);
        expect(resultDate?.getMonth()).toBe(7);
        expect(resultDate?.getDate()).toBe(5);
        expect(resultDate?.getHours()).toBe(14);
        expect(resultDate?.getMinutes()).toBe(30);
        expect(resultDate?.getSeconds()).toBe(45);
        expect(resultDate?.getMilliseconds()).toBe(123);
      });

      it('should preserve midnight (00:00:00) time when preserveTime=true', () => {
        // Set initial date with midnight time
        const initialDate = new Date(2025, 7, 1, 0, 0, 0, 0);
        host.datePicker().select(initialDate);

        // Select a new date with preserveTime=true
        const newDate = new Date(2025, 7, 5, 12, 30); // Different day with afternoon time
        host.datePicker().select(newDate, true);

        const resultDate = state().date();
        expect(resultDate?.getFullYear()).toBe(2025);
        expect(resultDate?.getMonth()).toBe(7);
        expect(resultDate?.getDate()).toBe(5);
        expect(resultDate?.getHours()).toBe(0); // Preserved midnight
        expect(resultDate?.getMinutes()).toBe(0);
        expect(resultDate?.getSeconds()).toBe(0);
        expect(resultDate?.getMilliseconds()).toBe(0);
      });

      it('should not preserve time when preserveTime=false (default)', () => {
        // Set initial date with specific time
        const initialDate = new Date(2025, 7, 1, 14, 30, 45);
        host.datePicker().select(initialDate);

        // Select a new date without preserveTime (default false)
        const newDate = new Date(2025, 7, 5, 10, 20, 15);
        host.datePicker().select(newDate);

        const resultDate = state().date();
        expect(resultDate).toBe(newDate); // Should be exactly the new date object
      });

      it('should use original date when no existing date to preserve time from', () => {
        // Select date with preserveTime=true but no existing date
        const newDate = new Date(2025, 7, 1, 14, 30);
        host.datePicker().select(newDate, true);

        const resultDate = state().date();
        expect(resultDate).toBe(newDate); // Should be exactly the original date
      });

      it('should preserve all time components including milliseconds', () => {
        // Set initial date with precise time including milliseconds
        const initialDate = new Date(2025, 6, 15, 23, 59, 59, 999);
        host.datePicker().select(initialDate);

        // Select a new date with preserveTime=true
        const newDate = new Date(2025, 11, 25, 1, 1, 1, 1); // Different everything
        host.datePicker().select(newDate, true);

        const resultDate = state().date();
        expect(resultDate?.getFullYear()).toBe(2025);
        expect(resultDate?.getMonth()).toBe(11); // December
        expect(resultDate?.getDate()).toBe(25);
        expect(resultDate?.getHours()).toBe(23); // Preserved from initial
        expect(resultDate?.getMinutes()).toBe(59);
        expect(resultDate?.getSeconds()).toBe(59);
        expect(resultDate?.getMilliseconds()).toBe(999);
      });
    });
  });
});

@Component({
  template: `
    <div ngpDatePicker></div>
  `,
  imports: [NgpDatePicker],
})
class TestHost {
  public datePicker = viewChild.required<NgpDatePicker<Date>>(NgpDatePicker);
}

/** Provide a partial mock date picker state. */
function provideMockDatePickerState(): Provider {
  return {
    provide: NgpDatePickerStateToken,
    useValue: signal({
      date: signal(undefined) as unknown as InputSignal<Date | undefined>,
    } satisfies Partial<NgpDatePicker<Date>>),
  };
}

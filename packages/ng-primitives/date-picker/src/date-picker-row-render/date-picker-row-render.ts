import {
  computed,
  Directive,
  EmbeddedViewRef,
  inject,
  Injector,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { injectDateAdapter } from 'ng-primitives/date-time';
import { explicitEffect } from 'ng-primitives/internal';
import { injectDateControllerState } from '../date-picker/date-picker-state';
import {
  NgpDatePickerRowRenderToken,
  NgpDatePickerWeekToken,
} from './date-picker-row-render-token';

/**
 * The number of days in a week.
 * @internal
 */
const DAYS_PER_WEEK = 7;

/**
 * A structural directive that renders a row of weekdays in the date picker grid.
 */
@Directive({
  selector: '[ngpDatePickerRowRender]',
  exportAs: 'ngpDatePickerRowRender',
  providers: [{ provide: NgpDatePickerRowRenderToken, useExisting: NgpDatePickerRowRender }],
})
export class NgpDatePickerRowRender<T> implements OnDestroy {
  /**
   * Access the date adapter.
   */
  private readonly dateAdapter = injectDateAdapter<T>();

  /**
   * Access the date picker.
   */
  private readonly state = injectDateControllerState<T>();

  /**
   * Access the template ref for the cell.
   */
  private readonly templateRef = inject(TemplateRef);

  /**
   * Access the view container ref.
   */
  private readonly viewContainerRef = inject(ViewContainerRef);

  /**
   * Get all the days to display, this is the days of the current month
   * and the days of the previous and next month to fill the grid.
   */
  protected readonly days = computed(() => {
    const month = this.state().focusedDate();
    const days: T[] = [];

    // Get the first and last day of the month.
    let firstDay = this.dateAdapter.startOfMonth(month);
    let lastDay = this.dateAdapter.endOfMonth(month);

    // calculate the offset of the first day of the week.
    const firstDayOfWeekOffset = this.getFirstDayOfWeekOffset(firstDay);

    // find the first and last day of visible in the grid.
    firstDay = this.dateAdapter.subtract(firstDay, {
      days: firstDayOfWeekOffset,
    });
    lastDay = this.dateAdapter.add(lastDay, {
      days: 6 - this.dateAdapter.getDay(lastDay),
    });

    // collect all the days to display.
    while (firstDay <= lastDay) {
      days.push(firstDay);
      firstDay = this.dateAdapter.add(firstDay, { days: 1 });
    }

    return days;
  });

  // get the weeks to display.
  protected readonly weeks = computed(() => {
    const days = this.days();
    const weeks = [];

    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  });

  /**
   * Store the embedded view refs of each rendered row.
   */
  private readonly viewRefs: EmbeddedViewRef<void>[] = [];

  /**
   * Store the previously rendered month.
   */
  private previousMonth: T | null = null;

  constructor() {
    // Wait for the inputs of the containing picker to be initialized.
    explicitEffect([this.state().focusedDate, this.state().firstDayOfWeek], () =>
      this.renderRows(),
    );
  }

  ngOnDestroy(): void {
    this.destroyRows();
  }

  /**
   * Render the row.
   */
  private renderRows(): void {
    // If the focused date has not changed, do not re-render.
    if (
      this.previousMonth &&
      this.dateAdapter.isSameMonth(this.previousMonth, this.state().focusedDate())
    ) {
      return;
    }

    // Store the current focused month.
    this.previousMonth = this.state().focusedDate();

    const weeks = this.weeks();

    // clear the view container.
    this.destroyRows();

    // render the weeks.
    for (const week of weeks) {
      const viewRef = this.viewContainerRef.createEmbeddedView(this.templateRef, null, {
        injector: Injector.create({
          parent: this.viewContainerRef.injector,
          providers: [{ provide: NgpDatePickerWeekToken, useValue: week }],
        }),
      });
      this.viewRefs.push(viewRef);
    }
  }

  /**
   * Destroy the row.
   */
  private destroyRows(): void {
    for (const viewRef of this.viewRefs) {
      viewRef.destroy();
    }
  }

  /**
   * Get the offset of the first day of the week.
   * @param firstCalendarDay The first day of the calendar without the offset.
   * @returns The offset of the first day of the week.
   */
  getFirstDayOfWeekOffset(firstCalendarDay: T): number {
    return (
      (DAYS_PER_WEEK + this.dateAdapter.getDay(firstCalendarDay) - this.state().firstDayOfWeek()) %
      DAYS_PER_WEEK
    );
  }
}

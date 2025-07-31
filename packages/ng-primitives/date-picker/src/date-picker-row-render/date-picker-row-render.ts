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
import { onChange } from 'ng-primitives/utils';
import { injectDateControllerState } from '../date-picker/date-picker-state';
import {
  NgpDatePickerRowRenderToken,
  NgpDatePickerWeekToken,
} from './date-picker-row-render-token';

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

    // find the first and last day of visible in the grid.
    firstDay = this.dateAdapter.subtract(firstDay, {
      days: this.dateAdapter.getDay(firstDay),
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

  constructor() {
    // re-render the rows when the month changes.
    onChange(this.state().focusedDate, (date, previousDate) => {
      if (!date || !previousDate || !this.dateAdapter.isSameMonth(date, previousDate)) {
        this.renderRows();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyRows();
  }

  /**
   * Render the row.
   */
  private renderRows(): void {
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
}

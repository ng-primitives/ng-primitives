/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
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
import { onChange } from 'ng-primitives/utils';
import { injectDatePicker } from '../date-picker/date-picker.token';
import { NgpDatePickerRowToken, NgpDatePickerWeekToken } from './date-picker-row.token';

@Directive({
  standalone: true,
  selector: '[ngpDatePickerRow]',
  exportAs: 'ngpDatePickerRow',
  providers: [{ provide: NgpDatePickerRowToken, useExisting: NgpDatePickerRow }],
})
export class NgpDatePickerRow implements OnDestroy {
  /**
   * Access the date picker.
   */
  private readonly datePicker = injectDatePicker();

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
    const month = this.datePicker.focusedDate();
    const days = [];

    // Get the first and last day of the month.
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // find the first and last day of visible in the grid.
    firstDay.setDate(-firstDay.getDay() + 1);
    lastDay.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    // collect all the days to display.
    while (firstDay <= lastDay) {
      days.push(new Date(firstDay));
      firstDay.setDate(firstDay.getDate() + 1);
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
    this.renderRows();
    onChange(this.datePicker.focusedDate, () => this.renderRows());
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

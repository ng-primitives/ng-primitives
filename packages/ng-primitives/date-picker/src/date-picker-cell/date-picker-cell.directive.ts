/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
  Directive,
  EmbeddedViewRef,
  inject,
  Injector,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { injectDatePickerWeek } from '../date-picker-row/date-picker-row.token';
import { NgpDatePickerCellDateToken, NgpDatePickerCellToken } from './date-picker-cell.token';

@Directive({
  standalone: true,
  selector: '[ngpDatePickerCell]',
  exportAs: 'ngpDatePickerCell',
  providers: [{ provide: NgpDatePickerCellToken, useExisting: NgpDatePickerCell }],
})
export class NgpDatePickerCell<T> implements OnDestroy {
  /**
   * Access the template ref for the cell.
   */
  private readonly templateRef = inject(TemplateRef);

  /**
   * Access the view container ref.
   */
  private readonly viewContainerRef = inject(ViewContainerRef);

  /**
   * Access the dates in the week.
   */
  private readonly dates = injectDatePickerWeek<T>();

  /**
   * Store the view refs for the dates.
   */
  private readonly viewRefs: EmbeddedViewRef<NgpDatePickerCellContext>[] = [];

  // Make sure the template checker knows the type of the context with which the
  // template of this directive will be rendered
  static ngTemplateContextGuard<T>(
    _: NgpDatePickerCell<T>,
    context: unknown,
  ): context is NgpDatePickerCellContext {
    return true;
  }

  constructor() {
    this.renderDates();
  }

  /**
   * Render the dates in the week.
   */
  private renderDates(): void {
    this.viewRefs.forEach(viewRef => viewRef.destroy());

    for (const date of this.dates) {
      const viewRef = this.viewContainerRef.createEmbeddedView(
        this.templateRef,
        {
          $implicit: date,
        },
        {
          injector: Injector.create({
            parent: this.viewContainerRef.injector,
            providers: [{ provide: NgpDatePickerCellDateToken, useValue: date }],
          }),
        },
      );
      this.viewRefs.push(viewRef);
    }
  }

  /**
   * Destroy the view refs.
   */
  ngOnDestroy(): void {
    this.viewRefs.forEach(viewRef => viewRef.destroy());
  }
}

interface NgpDatePickerCellContext {
  $implicit: Date;
}

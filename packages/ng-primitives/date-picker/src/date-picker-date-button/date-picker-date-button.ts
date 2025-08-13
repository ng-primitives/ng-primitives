import { FocusMonitor } from '@angular/cdk/a11y';
import { computed, Directive, ElementRef, HostListener, inject, OnDestroy } from '@angular/core';
import { injectDateAdapter } from 'ng-primitives/date-time';
import { setupButton } from 'ng-primitives/internal';
import { injectDatePickerCellDate } from '../date-picker-cell-render/date-picker-cell-render-token';
import { injectDateControllerState } from '../date-picker/date-picker-state';
import { NgpDatePickerDateButtonToken } from './date-picker-date-button-token';

/**
 * A button that represents a date in the date picker grid.
 */
@Directive({
  selector: '[ngpDatePickerDateButton]',
  exportAs: 'ngpDatePickerDateButton',
  providers: [{ provide: NgpDatePickerDateButtonToken, useExisting: NgpDatePickerDateButton }],
  host: {
    '[attr.role]': '!isButton ? "button" : null',
    '[attr.tabindex]': 'focused() ? 0 : -1',
    '[attr.data-selected]': 'selected() ? "" : null',
    '[attr.aria-disabled]': 'disabled()',
    '[attr.data-outside-month]': 'outside() ? "" : null',
    '[attr.data-today]': 'today() ? "" : null',
    '[attr.data-range-start]': 'start() ? "" : null',
    '[attr.data-range-end]': 'end() ? "" : null',
    '[attr.data-range-between]': 'betweenRange() ? "" : null',
  },
})
export class NgpDatePickerDateButton<T> implements OnDestroy {
  /**
   * Access the element ref.
   */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Access the focus monitor.
   */
  private readonly focusMonitor = inject(FocusMonitor);

  /**
   * Access the date picker state.
   */
  private readonly state = injectDateControllerState<T>();

  /**
   * Access the date adapter.
   */
  private readonly dateAdapter = injectDateAdapter<T>();

  /**
   * The date this cell represents.
   */
  private readonly date = injectDatePickerCellDate<T>();

  /**
   * Determine if this is the focused date.
   */
  protected readonly focused = computed(() =>
    this.dateAdapter.isSameDay(this.date, this.state().focusedDate()),
  );

  /**
   * Determine if this is the selected date.
   */
  protected readonly selected = computed(() => this.state().isSelected(this.date));

  /**
   * Determine if this is the start date of the range.
   */
  protected readonly start = computed(() => this.state().isStartOfRange(this.date));

  /**
   * Determine if this is the end date of the range.
   */
  protected readonly end = computed(() => this.state().isEndOfRange(this.date));

  /**
   * Determine if this is between the start and end dates of the range.
   */
  protected readonly betweenRange = computed(() => this.state().isBetweenRange(this.date));

  /**
   * Determine if this date is outside the current month.
   */
  protected readonly outside = computed(
    () => !this.dateAdapter.isSameMonth(this.date, this.state().focusedDate()),
  );

  /**
   * Determine if this date is today.
   */
  protected readonly today = computed(() =>
    this.dateAdapter.isSameDay(this.date, this.dateAdapter.now()),
  );

  /**
   * Determine if this date is disabled.
   * @internal
   */
  readonly disabled = computed(() => {
    const min = this.state().min();
    const max = this.state().max();

    if (this.state().disabled() || this.state().dateDisabled()(this.date)) {
      return true;
    }

    if (min && this.dateAdapter.compare(this.dateAdapter.startOfDay(this.date), min) < 0) {
      return true;
    }

    if (max && this.dateAdapter.compare(this.dateAdapter.startOfDay(this.date), max) > 0) {
      return true;
    }

    return false;
  });

  /**
   * Determine if the element is a button.
   */
  protected readonly isButton = this.elementRef.nativeElement.tagName === 'BUTTON';

  constructor() {
    this.state().registerButton(this);
    setupButton({ disabled: this.disabled });
  }

  ngOnDestroy(): void {
    this.state().unregisterButton(this);
  }

  /**
   * When the button is clicked, select the date.
   */
  @HostListener('click')
  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  protected select(event?: KeyboardEvent): void {
    // if the button is disabled, do nothing.
    if (this.disabled()) {
      return;
    }

    // because this may not be a button, we should stop the event from firing twice due to
    // us listening to both the click and the keydown.enter event.
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.state().select(this.date);
    this.state().setFocusedDate(this.date, 'mouse', 'forward');
  }

  /**
   * Focus if this is the current focused date.
   * @internal
   */
  focus(): void {
    if (this.dateAdapter.isSameDay(this.date, this.state().focusedDate())) {
      this.focusMonitor.focusVia(this.elementRef, 'keyboard');
    }
  }

  /**
   * Focus the previous cell.
   */
  @HostListener('keydown.arrowLeft', ['$event'])
  protected focusPrevious(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();

    // in rtl, the arrow keys are reversed.
    if (this.getDirection() === 'rtl') {
      this.focusDate(this.dateAdapter.add(this.state().focusedDate(), { days: 1 }), 'forward');
    } else {
      this.focusDate(
        this.dateAdapter.subtract(this.state().focusedDate(), { days: 1 }),
        'backward',
      );
    }
  }

  /**
   * Focus the next cell.
   */
  @HostListener('keydown.arrowRight', ['$event'])
  protected focusNext(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();

    // in rtl, the arrow keys are reversed.
    if (this.getDirection() === 'rtl') {
      this.focusDate(
        this.dateAdapter.subtract(this.state().focusedDate(), { days: 1 }),
        'backward',
      );
    } else {
      this.focusDate(this.dateAdapter.add(this.state().focusedDate(), { days: 1 }), 'forward');
    }
  }

  /**
   * Focus the above cell.
   */
  @HostListener('keydown.arrowUp', ['$event'])
  protected focusAbove(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.focusDate(this.dateAdapter.subtract(this.state().focusedDate(), { days: 7 }), 'backward');
  }

  /**
   * Focus the below cell.
   */
  @HostListener('keydown.arrowDown', ['$event'])
  protected focusBelow(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.focusDate(this.dateAdapter.add(this.state().focusedDate(), { days: 7 }), 'forward');
  }

  /**
   * Focus the first date of the month.
   */
  @HostListener('keydown.home', ['$event'])
  protected focusFirst(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.focusDate(this.dateAdapter.startOfMonth(this.state().focusedDate()), 'forward');
  }

  /**
   * Focus the last date of the month.
   */
  @HostListener('keydown.end', ['$event'])
  protected focusLast(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.focusDate(this.dateAdapter.endOfMonth(this.state().focusedDate()), 'backward');
  }

  /**
   * Focus the same date in the previous month.
   */
  @HostListener('keydown.pageUp', ['$event'])
  protected focusPreviousMonth(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const date = this.dateAdapter.getDate(this.state().focusedDate());

    let previousMonthTarget = this.dateAdapter.startOfMonth(this.state().focusedDate());
    previousMonthTarget = this.dateAdapter.subtract(previousMonthTarget, { months: 1 });

    const lastDay = this.dateAdapter.endOfMonth(previousMonthTarget);

    // if we are on a date that does not exist in the previous month, we should focus the last day of the month.
    if (date > this.dateAdapter.getDate(lastDay)) {
      this.focusDate(lastDay, 'forward');
      return;
    } else {
      this.focusDate(this.dateAdapter.set(previousMonthTarget, { day: date }), 'forward');
    }
  }

  /**
   * Focus the same date in the next month.
   */
  @HostListener('keydown.pageDown', ['$event'])
  protected focusNextMonth(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const date = this.dateAdapter.getDate(this.state().focusedDate());

    let nextMonthTarget = this.dateAdapter.startOfMonth(this.state().focusedDate());
    nextMonthTarget = this.dateAdapter.add(nextMonthTarget, { months: 1 });

    const lastDay = this.dateAdapter.endOfMonth(nextMonthTarget);

    // if we are on a date that does not exist in the next month, we should focus the last day of the month.
    if (date > this.dateAdapter.getDate(lastDay)) {
      this.focusDate(lastDay, 'backward');
      return;
    } else {
      this.focusDate(this.dateAdapter.set(nextMonthTarget, { day: date }), 'backward');
    }
  }

  private focusDate(date: T, direction: 'forward' | 'backward'): void {
    this.state().setFocusedDate(date, 'keyboard', direction);
  }

  /**
   * Get the direction of the element.
   */
  private getDirection(): 'ltr' | 'rtl' {
    return getComputedStyle(this.elementRef.nativeElement).direction === 'rtl' ? 'rtl' : 'ltr';
  }
}

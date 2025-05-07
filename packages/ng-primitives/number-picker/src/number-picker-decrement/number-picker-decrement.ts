import { computed, Directive, HostListener } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { injectNumberPickerState } from '../number-picker/number-picker-state';
import { setupPressAndHold } from '../utils/pointer';

@Directive({
  selector: 'button[ngpNumberPickerDecrement]',
  exportAs: 'ngpNumberPickerDecrement',
  host: {
    type: 'button',
    '[attr.disabled]': 'disabled() ? "" : undefined',
    '[attr.aria-readonly]': 'state().readonly() ? "true" : undefined',
    'aria-label': 'Decrease',
    '[attr.aria-controls]': 'state().id()',
    '[attr.tabindex]': '-1',
    '[style.user-select]': '"none"',
  },
})
export class NgpNumberPickerDecrement {
  /** Access the number picker state */
  protected readonly state = injectNumberPickerState();

  /** Whether the decrement button is disabled */
  protected readonly disabled = computed(
    () =>
      this.state().disabled() ||
      (this.state().value() !== undefined && this.state().value()! <= this.state().min()),
  );

  /** Listen for press and hold events */
  private readonly pressAndHold = setupPressAndHold();

  constructor() {
    this.pressAndHold.pipe(takeUntilDestroyed()).subscribe(this.decrement.bind(this));
  }

  /** Decrement the value */
  @HostListener('click', ['$event'])
  protected decrement(event?: PointerEvent): void {
    if (this.disabled() || this.state().readonly()) {
      return;
    }

    this.state().decrement(event);
  }
}

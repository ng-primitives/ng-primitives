import { Directive, HostListener } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { injectSliderState } from '../slider/slider-state';

type SliderKey = 'ArrowLeft' | 'ArrowDown' | 'ArrowRight' | 'ArrowUp' | 'Home' | 'End';

/**
 * Apply the `ngpSliderThumb` directive to an element that represents the thumb of the slider.
 */
@Directive({
  selector: '[ngpSliderThumb]',
  exportAs: 'ngpSliderThumb',
  host: {
    role: 'slider',
    '[attr.aria-valuemin]': 'state().min()',
    '[attr.aria-valuemax]': 'state().max()',
    '[attr.aria-valuenow]': 'state().value()',
    '[attr.aria-orientation]': 'state().orientation()',
    '[tabindex]': 'state().disabled() ? -1 : 0',
    '[attr.data-orientation]': 'state().orientation()',
    '[attr.data-disabled]': 'state().disabled() ? "" : null',
    '[style.inset-inline-start.%]':
      'state().orientation() === "horizontal" ? state().percentage() : undefined',
    '[style.inset-block-start.%]':
      'state().orientation() === "vertical" ? state().percentage() : undefined',
  },
})
export class NgpSliderThumb {
  /**
   * Access the slider state.
   */
  protected readonly state = injectSliderState();

  /**
   * Access the thumb element.
   */
  private readonly elementRef = injectElementRef();

  /**
   * Store the dragging state.
   */
  protected dragging = false;

  constructor() {
    ngpInteractions({
      hover: true,
      focusVisible: true,
      press: true,
      disabled: this.state().disabled,
    });
  }

  @HostListener('pointerdown', ['$event'])
  protected handlePointerDown(event: PointerEvent): void {
    event.preventDefault();

    if (this.state().disabled()) {
      return;
    }

    this.dragging = true;
  }

  @HostListener('document:pointerup')
  protected handlePointerUp(): void {
    if (this.state().disabled()) {
      return;
    }

    this.dragging = false;
  }

  @HostListener('document:pointermove', ['$event'])
  protected handlePointerMove(event: PointerEvent): void {
    if (this.state().disabled() || !this.dragging) {
      return;
    }

    const rect = this.state().track()?.element.nativeElement.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const percentage =
      this.state().orientation() === 'horizontal'
        ? (event.clientX - rect.left) / rect.width
        : 1 - (event.clientY - rect.top) / rect.height;

    const value =
      this.state().min() +
      (this.state().max() - this.state().min()) * Math.max(0, Math.min(1, percentage));

    this.state().value.set(value);
    this.state().valueChange.emit(value);
  }

  /**
   * Handle keyboard events.
   * @param event
   */
  @HostListener('keydown', ['$event'])
  protected handleKeydown(event: KeyboardEvent): void {
    const multiplier = event.shiftKey ? 10 : 1;
    const step = this.state().step() * multiplier;
    const currentValue = this.state().value();

    // determine the document direction
    const isRTL = getComputedStyle(this.elementRef.nativeElement).direction === 'rtl';

    let newValue: number;

    switch (event.key as SliderKey) {
      case 'ArrowLeft':
        newValue = isRTL
          ? Math.min(currentValue + step, this.state().max())
          : Math.max(currentValue - step, this.state().min());
        break;
      case 'ArrowDown':
        newValue = Math.max(currentValue - step, this.state().min());
        break;
      case 'ArrowRight':
        newValue = isRTL
          ? Math.max(currentValue - step, this.state().min())
          : Math.min(currentValue + step, this.state().max());
        break;
      case 'ArrowUp':
        newValue = Math.min(currentValue + step, this.state().max());
        break;
      case 'Home':
        newValue = isRTL ? this.state().max() : this.state().min();
        break;
      case 'End':
        newValue = isRTL ? this.state().min() : this.state().max();
        break;
      default:
        return;
    }

    // if the value is the same, do not emit an event
    if (newValue === currentValue) {
      return;
    }

    this.state().value.set(newValue);
    this.state().valueChange.emit(newValue);
    event.preventDefault();
  }
}

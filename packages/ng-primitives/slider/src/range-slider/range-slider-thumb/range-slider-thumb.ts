import { computed, Directive, HostListener, model } from '@angular/core';
import { setupInteractions } from 'ng-primitives/internal';
import { injectRangeSliderState } from '../range-slider/range-slider-state';

/**
 * Apply the `ngpRangeSliderThumb` directive to an element that represents a thumb of the range slider.
 * Each thumb can be configured to control either the 'low' or 'high' value.
 */
@Directive({
  selector: '[ngpRangeSliderThumb]',
  exportAs: 'ngpRangeSliderThumb',
  host: {
    role: 'slider',
    '[attr.aria-valuemin]': 'state().min()',
    '[attr.aria-valuemax]': 'state().max()',
    '[attr.aria-valuenow]': 'currentValue()',
    '[attr.aria-orientation]': 'state().orientation()',
    '[tabindex]': 'state().disabled() ? -1 : 0',
    '[attr.data-orientation]': 'state().orientation()',
    '[attr.data-disabled]': 'state().disabled() ? "" : null',
    '[attr.data-thumb]': 'thumbType()',
    '[style.inset-inline-start.%]':
      'state().orientation() === "horizontal" ? currentPercentage() : undefined',
    '[style.inset-block-start.%]':
      'state().orientation() === "vertical" ? currentPercentage() : undefined',
  },
})
export class NgpRangeSliderThumb {
  /**
   * Specifies which value this thumb controls ('low' or 'high').
   * If not specified, it will be automatically determined based on the order in the DOM.
   */
  readonly thumbType = model<'low' | 'high'>('low', {
    alias: 'ngpRangeSliderThumbType',
  });

  /**
   * Access the range slider state.
   */
  protected readonly state = injectRangeSliderState();

  /**
   * Store the dragging state.
   */
  protected dragging = false;

  /**
   * Get the current value for this thumb.
   */
  protected currentValue = computed(() => {
    return this.thumbType() === 'low' ? this.state().low() : this.state().high();
  });

  /**
   * Get the current percentage for this thumb.
   */
  protected currentPercentage = computed(() => {
    return this.thumbType() === 'low'
      ? this.state().lowPercentage()
      : this.state().highPercentage();
  });

  constructor() {
    setupInteractions({
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
        : (event.clientY - rect.top) / rect.height;

    const value =
      this.state().min() +
      (this.state().max() - this.state().min()) * Math.max(0, Math.min(1, percentage));

    // Update the appropriate value based on thumb type
    if (this.thumbType() === 'low') {
      this.state().updateLowValue(value);
    } else {
      this.state().updateHighValue(value);
    }
  }

  /**
   * Handle keyboard events.
   * @param event
   */
  @HostListener('keydown', ['$event'])
  protected handleKeydown(event: KeyboardEvent): void {
    const multiplier = event.shiftKey ? 10 : 1;
    const currentValue = this.currentValue();
    const step = this.state().step() * multiplier;

    let newValue: number;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        newValue = Math.max(currentValue - step, this.state().min());
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        newValue = Math.min(currentValue + step, this.state().max());
        break;
      case 'Home':
        newValue = this.state().min();
        break;
      case 'End':
        newValue = this.state().max();
        break;
      default:
        return;
    }

    // Update the appropriate value based on thumb type
    if (this.thumbType() === 'low') {
      this.state().updateLowValue(newValue);
    } else {
      this.state().updateHighValue(newValue);
    }

    event.preventDefault();
  }
}

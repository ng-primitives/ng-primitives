import { Directive, HostListener } from '@angular/core';
import { setupInteractions } from 'ng-primitives/internal';
import { injectSliderState } from '../slider/slider-state';

/**
 * Apply the `ngpSliderThumb` directive to an element that represents the thumb of the slider.
 */
@Directive({
  selector: '[ngpSliderThumb]',
  exportAs: 'ngpSliderThumb',
  host: {
    role: 'slider',
    '[attr.aria-valuemin]': 'sliderState().min()',
    '[attr.aria-valuemax]': 'sliderState().max()',
    '[attr.aria-valuenow]': 'sliderState().value()',
    '[attr.aria-orientation]': 'sliderState().orientation()',
    '[tabindex]': 'sliderState().disabled() ? -1 : 0',
    '[attr.data-orientation]': 'sliderState().orientation()',
    '[attr.data-disabled]': 'sliderState().disabled() ? "" : null',
    '[style.inset-inline-start.%]':
      'sliderState().orientation() === "horizontal" ? sliderState().percentage() : undefined',
    '[style.inset-block-start.%]':
      'sliderState().orientation() === "vertical" ? sliderState().percentage() : undefined',
  },
})
export class NgpSliderThumb {
  /**
   * Access the slider state.
   */
  protected readonly sliderState = injectSliderState();

  /**
   * Store the dragging state.
   */
  protected dragging = false;

  constructor() {
    setupInteractions({
      hover: true,
      focusVisible: true,
      press: true,
      disabled: this.sliderState().disabled,
    });
  }

  @HostListener('pointerdown', ['$event'])
  protected handlePointerDown(event: PointerEvent): void {
    event.preventDefault();

    if (this.sliderState().disabled()) {
      return;
    }

    this.dragging = true;
  }

  @HostListener('document:pointerup')
  protected handlePointerUp(): void {
    if (this.sliderState().disabled()) {
      return;
    }

    this.dragging = false;
  }

  @HostListener('document:pointermove', ['$event'])
  protected handlePointerMove(event: PointerEvent): void {
    if (this.sliderState().disabled() || !this.dragging) {
      return;
    }

    const rect = this.sliderState().track()?.element.nativeElement.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const percentage =
      this.sliderState().orientation() === 'horizontal'
        ? (event.clientX - rect.left) / rect.width
        : 1 - (event.clientY - rect.top) / rect.height;

    this.sliderState().value.set(
      this.sliderState().min() +
        (this.sliderState().max() - this.sliderState().min()) *
          Math.max(0, Math.min(1, percentage)),
    );
    this.sliderState().valueChange.emit(this.sliderState().value());
  }

  /**
   * Handle keyboard events.
   * @param event
   */
  @HostListener('keydown', ['$event'])
  protected handleKeydown(event: KeyboardEvent): void {
    const multiplier = event.shiftKey ? 10 : 1;
    const value = this.sliderState().value();

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        this.sliderState().value.set(
          Math.max(value - this.sliderState().step() * multiplier, this.sliderState().min()),
        );
        this.sliderState().valueChange.emit(this.sliderState().value());
        event.preventDefault();
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        this.sliderState().value.set(
          Math.min(value + this.sliderState().step() * multiplier, this.sliderState().max()),
        );
        this.sliderState().valueChange.emit(this.sliderState().value());
        event.preventDefault();
        break;
      case 'Home':
        this.sliderState().value.set(this.sliderState().min());
        this.sliderState().valueChange.emit(this.sliderState().value());
        event.preventDefault();
        break;
      case 'End':
        this.sliderState().value.set(this.sliderState().max());
        this.sliderState().valueChange.emit(this.sliderState().value());
        event.preventDefault();
        break;
    }
  }
}

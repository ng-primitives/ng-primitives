import { computed, Directive, HostListener, OnDestroy } from '@angular/core';
import { injectElementRef, setupInteractions } from 'ng-primitives/internal';
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
    '[attr.aria-valuenow]': 'value()',
    '[attr.aria-orientation]': 'state().orientation()',
    '[tabindex]': 'state().disabled() ? -1 : 0',
    '[attr.data-orientation]': 'state().orientation()',
    '[attr.data-disabled]': 'state().disabled() ? "" : null',
    '[attr.data-thumb]': 'thumb()',
    '[style.inset-inline-start.%]':
      'state().orientation() === "horizontal" ? percentage() : undefined',
    '[style.inset-block-start.%]':
      'state().orientation() === "vertical" ? percentage() : undefined',
  },
})
export class NgpRangeSliderThumb implements OnDestroy {
  /**
   * Access the range slider state.
   */
  protected readonly state = injectRangeSliderState();

  /**
   * Access the thumb element.
   */
  private readonly elementRef = injectElementRef();

  /**
   * Determines which value this thumb controls ('low' or 'high').
   */
  protected readonly thumb = computed(() =>
    this.state().thumbs().indexOf(this) === 0 ? 'low' : 'high',
  );

  /**
   * Store the dragging state.
   */
  protected dragging = false;

  /**
   * Get the current value for this thumb.
   */
  protected readonly value = computed(() =>
    this.thumb() === 'low' ? this.state().low() : this.state().high(),
  );

  /**
   * Get the current percentage for this thumb.
   */
  protected readonly percentage = computed(() =>
    this.thumb() === 'low' ? this.state().lowPercentage() : this.state().highPercentage(),
  );

  constructor() {
    setupInteractions({
      hover: true,
      focusVisible: true,
      press: true,
      disabled: this.state().disabled,
    });

    this.state().addThumb(this);
  }

  ngOnDestroy(): void {
    this.state().removeThumb(this);
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
    if (this.thumb() === 'low') {
      this.state().setLowValue(value);
    } else {
      this.state().setHighValue(value);
    }
  }

  /**
   * Handle keyboard events.
   * @param event
   */
  @HostListener('keydown', ['$event'])
  protected handleKeydown(event: KeyboardEvent): void {
    const multiplier = event.shiftKey ? 10 : 1;
    const currentValue = this.value();
    const step = this.state().step() * multiplier;

    // determine the document direction
    const isRTL = getComputedStyle(this.elementRef.nativeElement).direction === 'rtl';

    let newValue: number;

    switch (event.key) {
      case 'ArrowLeft':
        newValue = isRTL
          ? Math.min(currentValue - step, this.state().max())
          : Math.max(currentValue - step, this.state().min());
        break;
      case 'ArrowDown':
        newValue = Math.max(currentValue - step, this.state().min());
        break;
      case 'ArrowRight':
        newValue = isRTL
          ? Math.max(currentValue + step, this.state().min())
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

    // Update the appropriate value based on thumb type
    if (this.thumb() === 'low') {
      this.state().setLowValue(newValue);
    } else {
      this.state().setHighValue(newValue);
    }

    event.preventDefault();
  }
}

import { Directive, HostListener } from '@angular/core';
import { NgpFocusVisible, NgpHover, NgpPress } from 'ng-primitives/interactions';
import { injectSliderState } from '../slider/slider-state';
import { injectSlider } from '../slider/slider-token';
import { provideSliderThumb } from './slider-thumb-token';

@Directive({
  selector: '[ngpSliderThumb]',
  exportAs: 'ngpSliderThumb',
  providers: [provideSliderThumb(NgpSliderThumb)],
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
  hostDirectives: [NgpHover, NgpFocusVisible, NgpPress],
})
export class NgpSliderThumb {
  /**
   * Access the slider.
   */
  protected readonly slider = injectSlider();

  /**
   * Access the slider state.
   */
  protected readonly state = injectSliderState();

  /**
   * Store the dragging state.
   */
  protected dragging = false;

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

    const rect = this.slider.track()?.element.nativeElement.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const percentage =
      this.state().orientation() === 'horizontal'
        ? (event.clientX - rect.left) / rect.width
        : 1 - (event.clientY - rect.top) / rect.height;

    this.state().value.set(
      this.state().min() +
        (this.state().max() - this.state().min()) * Math.max(0, Math.min(1, percentage)),
    );
    this.state().valueChange.emit(this.state().value());
  }

  /**
   * Handle keyboard events.
   * @param event
   */
  @HostListener('keydown', ['$event'])
  protected handleKeydown(event: KeyboardEvent): void {
    const multiplier = event.shiftKey ? 10 : 1;
    const value = this.state().value();

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        this.state().value.set(
          Math.max(value - this.state().step() * multiplier, this.state().min()),
        );
        this.state().valueChange.emit(this.state().value());
        event.preventDefault();
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        this.state().value.set(
          Math.min(value + this.state().step() * multiplier, this.state().max()),
        );
        this.state().valueChange.emit(this.state().value());
        event.preventDefault();
        break;
      case 'Home':
        this.state().value.set(this.state().min());
        this.state().valueChange.emit(this.state().value());
        event.preventDefault();
        break;
      case 'End':
        this.state().value.set(this.state().max());
        this.state().valueChange.emit(this.state().value());
        event.preventDefault();
        break;
    }
  }
}

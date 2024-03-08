import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  Output,
  booleanAttribute,
} from '@angular/core';

@Directive({
  selector: 'button[ngpToggle]',
  standalone: true,
  host: {
    type: 'button',
    '[attr.aria-pressed]': 'pressed',
    '[attr.data-state]': 'pressed ? "on" : "off"',
    '[attr.data-disabled]': 'disabled',
  },
})
export class NgpToggleDirective {
  /**
   * Whether the toggle is pressed.
   * @default false
   */
  @Input({ alias: 'ngpTogglePressed', transform: booleanAttribute }) pressed: boolean = false;

  /**
   * Whether the toggle is disabled.
   * @default false
   */
  @Input({ alias: 'ngpToggleDisabled', transform: booleanAttribute }) disabled: boolean = false;

  /**
   * Event emitted when the toggle is pressed.
   */
  @Output('ngpTogglePressedChange') readonly pressedChange = new EventEmitter<boolean>();

  /**
   * Toggle the pressed state.
   */
  @HostListener('click')
  toggle(): void {
    if (this.disabled) {
      return;
    }

    this.pressed = !this.pressed;
    this.pressedChange.emit(this.pressed);
  }
}

import { BooleanInput } from '@angular/cdk/coercion';
import {
  Directive,
  ElementRef,
  HostListener,
  booleanAttribute,
  inject,
  input,
  output,
} from '@angular/core';
import { provideToggleState, toggleState } from './toggle-state';

/**
 * Apply the `ngpToggle` directive to an element to manage the toggle state. This must be applied to a `button` element.
 */
@Directive({
  selector: '[ngpToggle]',
  exportAs: 'ngpToggle',
  providers: [provideToggleState()],
  host: {
    '[attr.type]': 'isButton ? "button" : null',
    '[attr.aria-pressed]': 'state.selected()',
    '[attr.data-selected]': 'state.selected() ? "" : null',
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
  },
})
export class NgpToggle {
  /**
   * Access the element.
   */
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Whether the toggle is selected.
   * @default false
   */
  readonly selected = input<boolean, BooleanInput>(false, {
    alias: 'ngpToggleSelected',
    transform: booleanAttribute,
  });

  /**
   * Emits when the selected state changes.
   */
  readonly selectedChange = output<boolean>({
    alias: 'ngpToggleSelectedChange',
  });

  /**
   * Whether the toggle is disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpToggleDisabled',
    transform: booleanAttribute,
  });

  /**
   * Determine if the element is a button.
   */
  protected isButton = this.element.nativeElement.tagName === 'BUTTON';

  /**
   * The state for the toggle primitive.
   * @internal
   */
  protected readonly state = toggleState<NgpToggle>(this);

  /**
   * Toggle the selected state.
   */
  @HostListener('click')
  toggle(): void {
    if (this.state.disabled()) {
      return;
    }

    const isSelected = !this.state.selected();

    this.state.selected.set(isSelected);
    this.selectedChange.emit(isSelected);
  }

  /**
   * If the element is not a button or a link the space key should toggle the selected state.
   */
  @HostListener('keydown.space', ['$event'])
  protected onKeyDown(event: Event): void {
    if (!this.isButton && this.element.nativeElement.tagName !== 'A') {
      event.preventDefault();
      this.toggle();
    }
  }
}

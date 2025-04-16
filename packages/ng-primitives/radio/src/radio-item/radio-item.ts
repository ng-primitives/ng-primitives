import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, HostListener, booleanAttribute, computed, input } from '@angular/core';
import { NgpFocusVisible, NgpHover, NgpPress } from 'ng-primitives/interactions';
import { NgpRovingFocusItem } from 'ng-primitives/roving-focus';
import { injectRadioGroupState } from '../radio-group/radio-group-state';
import { provideRadioItemState, radioItemState } from './radio-item-state';

/**
 * Apply the `ngpRadioItem` directive to an element that represents a radio item. This would typically be a `button` element.
 */
@Directive({
  selector: '[ngpRadioItem]',
  hostDirectives: [NgpRovingFocusItem, NgpHover, NgpFocusVisible, NgpPress],
  providers: [provideRadioItemState()],
  host: {
    role: 'radio',
    '[attr.aria-checked]': 'checked() ? "true" : "false"',
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
    '[attr.data-checked]': 'checked() ? "" : null',
  },
})
export class NgpRadioItem<T> {
  /**
   * Access the radio group state.
   */
  private readonly radioGroupState = injectRadioGroupState<T>();

  /**
   * The value of the radio item.
   */
  readonly value = input.required<T>({ alias: 'ngpRadioItemValue' });

  /**
   * Whether the radio item is disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpRadioItemDisabled',
    transform: booleanAttribute,
  });

  /**
   * Whether the radio item is checked.
   */
  readonly checked = computed(() =>
    this.radioGroupState().compareWith()(this.radioGroupState().value(), this.value()),
  );

  /**
   * The state of the radio item.
   */
  protected readonly state = radioItemState<NgpRadioItem<T>>(this);

  /**
   * When the item receives focus, select it.
   * @internal
   */
  @HostListener('focus')
  protected onFocus(): void {
    this.radioGroupState().select(this.value());
  }

  /**
   * When the item receives a click, select it.
   * @internal
   */
  @HostListener('click')
  protected onClick(): void {
    this.radioGroupState().select(this.value());
  }
}

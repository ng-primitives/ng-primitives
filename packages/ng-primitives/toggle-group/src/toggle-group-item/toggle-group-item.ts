import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, input, OnInit } from '@angular/core';
import { NgpRovingFocusItem } from 'ng-primitives/roving-focus';
import { injectToggleGroupState } from '../toggle-group/toggle-group-state';
import { provideToggleGroupItemState, toggleGroupItemState } from './toggle-group-item-state';

@Directive({
  selector: '[ngpToggleGroupItem]',
  exportAs: 'ngpToggleGroupItem',
  providers: [provideToggleGroupItemState()],
  hostDirectives: [
    {
      directive: NgpRovingFocusItem,
      inputs: ['ngpRovingFocusItemDisabled: ngpToggleGroupItemDisabled'],
    },
  ],
  host: {
    role: 'radio',
    '[attr.aria-checked]': 'selected()',
    '[attr.data-selected]': 'selected() ? "" : null',
    '[attr.aria-disabled]': 'state.disabled()',
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
    '(click)': 'toggle()',
  },
})
export class NgpToggleGroupItem implements OnInit {
  /**
   * Access the group that the item belongs to.
   */
  private readonly toggleGroup = injectToggleGroupState();

  /**
   * The value of the item.
   */
  readonly value = input<string>(undefined, {
    alias: 'ngpToggleGroupItemValue',
  });

  /**
   * Whether the item is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpToggleGroupItemDisabled',
    transform: booleanAttribute,
  });

  /**
   * Whether the item is selected.
   */
  protected readonly selected = computed(() => this.toggleGroup().isSelected(this.state.value()!));

  /**
   * The state of the item.
   */
  protected readonly state = toggleGroupItemState<NgpToggleGroupItem>(this);

  ngOnInit(): void {
    // we can't use a required input for value as it is used in a computed property before the input is set
    if (this.state.value() === undefined) {
      throw new Error('The value input is required for the toggle group item.');
    }
  }

  /**
   * Toggle the item.
   */
  protected toggle(): void {
    if (this.state.disabled()) {
      return;
    }

    this.toggleGroup().toggle(this.state.value()!);
  }
}

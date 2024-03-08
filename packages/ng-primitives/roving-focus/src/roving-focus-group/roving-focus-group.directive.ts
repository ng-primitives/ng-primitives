import { Directionality } from '@angular/cdk/bidi';
import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, inject, input, signal } from '@angular/core';
import { NgpRovingFocusItemDirective } from '../roving-focus-item/roving-focus-item.directive';
import { NgpRovingFocusGroupToken } from './roving-focus-group.token';

@Directive({
  standalone: true,
  selector: '[ngpRovingFocusGroup]',
  exportAs: 'ngpRovingFocusGroup',
  providers: [{ provide: NgpRovingFocusGroupToken, useExisting: NgpRovingFocusGroupDirective }],
})
export class NgpRovingFocusGroupDirective {
  /**
   * Access the directionality service.
   */
  private readonly directionality = inject(Directionality);

  /**
   * Determine the orientation of the roving focus group.
   */
  readonly orientation = input<'horizontal' | 'vertical'>('vertical', {
    alias: 'ngpRovingFocusGroupOrientation',
  });

  /**
   * Determine if focus should wrap when the end or beginning is reached.
   */
  readonly wrap = input<boolean>(true, {
    alias: 'ngpRovingFocusGroupWrap',
  });

  /**
   * Determine if the roving focus group is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpRovingFocusGroupDisabled',
    transform: booleanAttribute,
  });

  /**
   * Store the items in the roving focus group.
   */
  private readonly items = signal<NgpRovingFocusItemDirective[]>([]);

  /**
   * Store the active item in the roving focus group.
   */
  private readonly activeItem = signal<NgpRovingFocusItemDirective | null>(null);

  /**
   * Register an item with the roving focus group.
   * @param item The item to register
   * @internal
   */
  register(item: NgpRovingFocusItemDirective): void {
    this.items.update(items => [...items, item]);
  }

  /**
   * Unregister an item with the roving focus group.
   * @param item The item to unregister
   * @internal
   */
  unregister(item: NgpRovingFocusItemDirective): void {
    this.items.update(items => items.filter(i => i !== item));
  }

  /**
   * Handle keyboard navigation for the roving focus group.
   * @param event The keyboard event
   * @internal
   */
  onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }
  }
}

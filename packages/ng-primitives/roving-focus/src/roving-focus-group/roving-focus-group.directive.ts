/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { FocusOrigin } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, inject, input, model, signal } from '@angular/core';
import { injectOrientation, NgpCanOrientate, NgpOrientation } from 'ng-primitives/internal';
import { NgpRovingFocusItem } from '../roving-focus-item/roving-focus-item.directive';
import { NgpRovingFocusGroupToken } from './roving-focus-group.token';

@Directive({
  standalone: true,
  selector: '[ngpRovingFocusGroup]',
  exportAs: 'ngpRovingFocusGroup',
  providers: [{ provide: NgpRovingFocusGroupToken, useExisting: NgpRovingFocusGroup }],
})
export class NgpRovingFocusGroup implements NgpCanOrientate {
  /**
   * Access the directionality service.
   */
  private readonly directionality = inject(Directionality);

  /**
   * Determine the orientation of the roving focus group.
   * @default 'vertical'
   */
  readonly orientation = model<NgpOrientation>('vertical', {
    alias: 'ngpRovingFocusGroupOrientation',
  });

  /**
   * Determine the orientation of the roving focus group.
   */
  readonly groupOrientation = injectOrientation(this.orientation);

  /**
   * Determine if focus should wrap when the end or beginning is reached.
   */
  readonly wrap = input<boolean, BooleanInput>(true, {
    alias: 'ngpRovingFocusGroupWrap',
    transform: booleanAttribute,
  });

  /**
   * Determine if the home and end keys should navigate to the first and last items.
   */
  readonly homeEnd = input<boolean, BooleanInput>(true, {
    alias: 'ngpRovingFocusGroupHomeEnd',
    transform: booleanAttribute,
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
  private readonly items = signal<NgpRovingFocusItem[]>([]);

  /**
   * Get the items in the roving focus group sorted by order.
   */
  private get sortedItems() {
    // sort the items by their position in the document
    return this.items().sort((a, b) =>
      a.elementRef.nativeElement.compareDocumentPosition(b.elementRef.nativeElement) &
      Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1,
    );
  }

  /**
   * Store the active item in the roving focus group.
   * @internal
   */
  readonly activeItem = signal<NgpRovingFocusItem | null>(null);

  /**
   * Register an item with the roving focus group.
   * @param item The item to register
   * @internal
   */
  register(item: NgpRovingFocusItem): void {
    this.items.update(items => [...items, item]);

    // if there is no active item, make the first item the tabbable item
    if (!this.activeItem()) {
      this.activeItem.set(item);
    }
  }

  /**
   * Unregister an item with the roving focus group.
   * @param item The item to unregister
   * @internal
   */
  unregister(item: NgpRovingFocusItem): void {
    this.items.update(items => items.filter(i => i !== item));

    // check if the unregistered item is the active item
    if (this.activeItem() === item) {
      // if the active item is unregistered, activate the first item
      this.activeItem.set(this.items()[0] ?? null);
    }
  }

  /**
   * Activate an item in the roving focus group.
   * @param item The item to activate
   * @param origin The origin of the focus change
   */
  setActiveItem(item: NgpRovingFocusItem | null, origin: FocusOrigin = 'program'): void {
    this.activeItem.set(item);
    item?.focus(origin);
  }

  /**
   * Activate the first item in the roving focus group.
   * @param origin The origin of the focus change
   */
  private activateFirstItem(origin: FocusOrigin): void {
    // find the first item that is not disabled
    const item = this.sortedItems.find(i => !i.disabled()) ?? null;

    // set the first item as the active item
    this.setActiveItem(item, origin);
  }

  /**
   * Activate the last item in the roving focus group.
   * @param origin The origin of the focus change
   */
  private activateLastItem(origin: FocusOrigin): void {
    // find the last item that is not disabled
    const item = [...this.sortedItems].reverse().find(i => !i.disabled()) ?? null;

    // set the last item as the active item
    this.setActiveItem(item, origin);
  }

  /**
   * Activate the next item in the roving focus group.
   * @param origin The origin of the focus change
   */
  private activateNextItem(origin: FocusOrigin): void {
    const activeItem = this.activeItem();

    // if there is no active item, activate the first item
    if (!activeItem) {
      this.activateFirstItem(origin);
      return;
    }

    // find the index of the active item
    const index = this.sortedItems.indexOf(activeItem);

    // find the next item that is not disabled
    const item = this.sortedItems.slice(index + 1).find(i => !i.disabled()) ?? null;

    // if we are at the end of the list, wrap to the beginning
    if (!item && this.wrap()) {
      this.activateFirstItem(origin);
      return;
    }

    // if there is no next item, do nothing
    if (!item) {
      return;
    }

    // set the next item as the active item
    this.setActiveItem(item, origin);
  }

  /**
   * Activate the previous item in the roving focus group.
   * @param origin The origin of the focus change
   */
  private activatePreviousItem(origin: FocusOrigin): void {
    const activeItem = this.activeItem();

    // if there is no active item, activate the last item
    if (!activeItem) {
      this.activateLastItem(origin);
      return;
    }

    // find the index of the active item
    const index = this.sortedItems.indexOf(activeItem);

    // find the previous item that is not disabled
    const item =
      this.sortedItems
        .slice(0, index)
        .reverse()
        .find(i => !i.disabled()) ?? null;

    // if we are at the beginning of the list, wrap to the end
    if (!item && this.wrap()) {
      this.activateLastItem(origin);
      return;
    }

    // if there is no previous item, do nothing
    if (!item) {
      return;
    }

    // set the previous item as the active item
    this.setActiveItem(item, origin);
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

    switch (event.key) {
      case 'ArrowUp':
        if (this.groupOrientation() === 'vertical') {
          event.preventDefault();
          this.activatePreviousItem('keyboard');
        }
        break;
      case 'ArrowDown':
        if (this.groupOrientation() === 'vertical') {
          event.preventDefault();
          this.activateNextItem('keyboard');
        }
        break;
      case 'ArrowLeft':
        if (this.groupOrientation() === 'horizontal') {
          event.preventDefault();

          if (this.directionality.value === 'ltr') {
            this.activatePreviousItem('keyboard');
          } else {
            this.activateNextItem('keyboard');
          }
        }
        break;
      case 'ArrowRight':
        if (this.groupOrientation() === 'horizontal') {
          event.preventDefault();

          if (this.directionality.value === 'ltr') {
            this.activateNextItem('keyboard');
          } else {
            this.activatePreviousItem('keyboard');
          }
        }
        break;
      case 'Home':
        if (this.homeEnd()) {
          event.preventDefault();
          this.activateFirstItem('keyboard');
        }
        break;
      case 'End':
        if (this.homeEnd()) {
          event.preventDefault();
          this.activateLastItem('keyboard');
        }
        break;
    }
  }
}

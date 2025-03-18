/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import {
  Directive,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { injectRovingFocusGroup } from '../roving-focus-group/roving-focus-group.token';
import { NgpRovingFocusItemToken } from './roving-focus-item.token';

@Directive({
  selector: '[ngpRovingFocusItem]',
  exportAs: 'ngpRovingFocusItem',
  providers: [{ provide: NgpRovingFocusItemToken, useExisting: NgpRovingFocusItem }],
  host: {
    '[attr.tabindex]': 'tabindex()',
  },
})
export class NgpRovingFocusItem implements OnInit, OnDestroy {
  /**
   * Access the group the roving focus item belongs to.
   */
  private readonly group = injectRovingFocusGroup();

  /**
   * Access the focus monitor service.
   */
  private readonly focusMonitor = inject(FocusMonitor);

  /**
   * Access the element the roving focus item is attached to.
   */
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Define if the item is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpRovingFocusItemDisabled',
    transform: booleanAttribute,
  });

  /**
   * Derive the tabindex of the roving focus item.
   */
  readonly tabindex = computed(() =>
    !this.group.disabled() && this.group.activeItem() === this ? 0 : -1,
  );

  /**
   * Initialize the roving focus item.
   */
  ngOnInit(): void {
    this.group.register(this);
  }

  /**
   * Clean up the roving focus item.
   */
  ngOnDestroy(): void {
    this.group.unregister(this);
  }

  /**
   * Forward the keydown event to the roving focus group.
   * @param event The keyboard event
   */
  @HostListener('keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }

    this.group.onKeydown(event);
  }

  /**
   * Activate the roving focus item on click.
   */
  @HostListener('click')
  protected activate(): void {
    if (this.disabled()) {
      return;
    }

    this.group.setActiveItem(this, 'mouse');
  }

  /**
   * Focus the roving focus item.
   * @param origin The origin of the focus
   */
  focus(origin: FocusOrigin): void {
    this.focusMonitor.focusVia(this.elementRef, origin);
  }
}

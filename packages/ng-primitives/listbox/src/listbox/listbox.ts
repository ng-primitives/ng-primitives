/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ActiveDescendantKeyManager, FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import {
  AfterContentInit,
  booleanAttribute,
  computed,
  contentChildren,
  DestroyRef,
  Directive,
  HostListener,
  inject,
  Injector,
  input,
  model,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { explicitEffect, setupFocusVisible } from 'ng-primitives/internal';
import { NgpPopoverTriggerToken } from 'ng-primitives/popover';
import { uniqueId } from 'ng-primitives/utils';
import type { NgpListboxOption } from '../listbox-option/listbox-option';
import { NgpListboxOptionToken } from '../listbox-option/listbox-option-token';
import { NgpListboxToken } from './listbox-token';

@Directive({
  selector: '[ngpListbox]',
  exportAs: 'ngpListbox',
  providers: [{ provide: NgpListboxToken, useExisting: NgpListbox }],
  host: {
    '[id]': 'id()',
    role: 'listbox',
    '[attr.tabindex]': 'tabindex()',
    '[attr.aria-disabled]': 'disabled()',
    '[attr.aria-multiselectable]': 'mode() === "multiple"',
    '[attr.aria-activedescendant]': 'activeDescendant()',
    '(focusin)': 'isFocused.set(true)',
    '(focusout)': 'isFocused.set(false)',
  },
})
export class NgpListbox<T> implements AfterContentInit {
  /**
   * Access the injector.
   */
  private readonly injector = inject(Injector);

  /**
   * Access the destroy ref.
   */
  private readonly destroyRef = inject(DestroyRef);

  /**
   * The listbox may be used within a popover, which we may want to close on selection.
   */
  private readonly popoverTrigger = inject(NgpPopoverTriggerToken, { optional: true });

  /**
   * The id of the listbox.
   */
  readonly id = input(uniqueId('ngp-listbox'));

  /**
   * The listbox selection mode.
   */
  readonly mode = input<NgpSelectionMode>('single', {
    alias: 'ngpListboxMode',
  });

  /**
   * The listbox selection.
   */
  readonly value = model<T[]>([], {
    alias: 'ngpListboxValue',
  });

  /**
   * The listbox disabled state.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpListboxDisabled',
    transform: booleanAttribute,
  });

  /**
   * The comparator function to use when comparing values.
   * If not provided, strict equality (===) is used.
   */
  readonly compareWith = input<(a: T, b: T) => boolean>((a, b) => a === b, {
    alias: 'ngpListboxCompareWith',
  });

  /**
   * The tabindex of the listbox.
   */
  protected readonly tabindex = computed(() => (this.disabled() ? -1 : 0));

  /**
   * Access the options in the listbox.
   */
  protected readonly options = contentChildren<NgpListboxOption<T>>(NgpListboxOptionToken, {
    descendants: true,
  });

  /**
   * The active descendant of the listbox.
   */
  protected readonly keyManager = new ActiveDescendantKeyManager(this.options, this.injector);

  /**
   * Gets the active descendant of the listbox.
   */
  protected readonly activeDescendant = signal<string | undefined>(undefined);

  /**
   * @internal
   * Whether the listbox is focused.
   */
  readonly isFocused = signal(false);

  constructor() {
    setupFocusVisible({ disabled: this.disabled });
  }

  ngAfterContentInit(): void {
    this.keyManager.withHomeAndEnd().withTypeAhead().withVerticalOrientation();

    this.keyManager.change
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.activeDescendant.set(this.keyManager.activeItem?.id()));

    // On initialization, set the first selected option as the active descendant if there is one.
    this.updateActiveItem();

    // if the options change, update the active item, for example the item that was previously active may have been removed
    // any time the value changes we should make sure that the active item is updated
    explicitEffect([this.options], () => this.updateActiveItem(), {
      injector: this.injector,
    });
  }

  private updateActiveItem(): void {
    const selectedOption = this.options().find(o => o.selected());

    if (selectedOption) {
      this.keyManager.setActiveItem(selectedOption);
    } else {
      this.keyManager.setFirstItemActive();
    }
  }

  @HostListener('keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    this.keyManager.onKeydown(event);

    // if the keydown was enter or space, select the active descendant if there is one
    if (event.key === 'Enter' || event.key === ' ') {
      this.keyManager.activeItem?.select('keyboard');
    }

    // if this is an arrow key or selection key, prevent the default action to prevent the page from scrolling
    if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
    }
  }

  /**
   * @internal
   * Selects an option in the listbox.
   */
  selectOption(value: T, origin: FocusOrigin): void {
    if (this.mode() === 'single') {
      this.value.set([value]);
    } else {
      // if the value is already selected, remove it, otherwise add it
      if (this.isSelected(value)) {
        this.value.set(this.value().filter(v => !this.compareWith()(v, value)));
      } else {
        this.value.set([...this.value(), value]);
      }
    }

    // Set the active descendant to the selected option.
    const option = this.options().find(o => this.compareWith()(o.value(), value));

    if (option) {
      this.keyManager.setActiveItem(option);
    }

    // If the listbox is within a popover, close the popover on selection if it is not in a multiple selection mode.
    if (this.mode() !== 'multiple') {
      this.popoverTrigger?.hide(origin);
    }
  }

  /**
   * @internal
   * Determine if an option is selected using the compareWith function.
   */
  isSelected(value: T): boolean {
    return this.value().some(v => this.compareWith()(v, value));
  }

  /**
   * @internal
   * Activate an option in the listbox.
   */
  activateOption(value: T) {
    const option = this.options().find(o => this.compareWith()(o.value(), value));

    if (option) {
      this.keyManager.setActiveItem(option);
    }
  }
}

export type NgpSelectionMode = 'single' | 'multiple';

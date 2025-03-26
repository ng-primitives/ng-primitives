/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  computed,
  Directive,
  effect,
  input,
  OnDestroy,
  signal,
} from '@angular/core';
import {
  injectElementRef,
  onDomRemoval,
  scrollIntoViewIfNeeded,
  setupInteractions,
} from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import type { NgpListbox } from '../listbox/listbox';
import { injectListboxState } from '../listbox/listbox-state';
import { NgpListboxOptionToken } from './listbox-option-token';

@Directive({
  selector: '[ngpListboxOption]',
  exportAs: 'ngpListboxOption',
  providers: [{ provide: NgpListboxOptionToken, useExisting: NgpListboxOption }],
  host: {
    role: 'option',
    '[attr.id]': 'id()',
    '[attr.aria-disabled]': 'optionDisabled()',
    '[attr.data-active]': 'listbox()?.isFocused() && active() ? "" : undefined',
    '[attr.data-selected]': 'selected() ? "" : undefined',
    '[attr.data-disabled]': 'optionDisabled() ? "" : undefined',
    '(click)': 'select("mouse")',
    '(mouseenter)': 'activate()',
    '(keydown.enter)': 'select("keyboard")',
    '(keydown.space)': 'select("keyboard")',
  },
})
export class NgpListboxOption<T> implements OnDestroy {
  protected readonly listbox = injectListboxState<NgpListbox<T>>();
  private readonly elementRef = injectElementRef();

  /**
   * The id of the listbox.
   */
  readonly id = input(uniqueId('ngp-listbox-option'));

  /**
   * The value of the option.
   */
  readonly value = input.required<T>({
    alias: 'ngpListboxOptionValue',
  });

  /**
   * Whether the option is disabled.
   */
  readonly optionDisabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpListboxOptionDisabled',
    transform: booleanAttribute,
  });

  /**
   * Whether the option is active.
   */
  protected readonly active = signal<boolean>(false);

  /**
   * @internal
   * Whether the option is selected.
   */
  readonly selected = computed(() => this.listbox()?.isSelected(this.value()));

  /**
   * @internal
   * Whether the option is disabled - this is used by the `Highlightable` interface.
   */
  get disabled(): boolean {
    return this.optionDisabled();
  }

  constructor() {
    setupInteractions({ disabled: this.optionDisabled });

    // the listbox may not be available when the option is initialized
    // so we need to add the option when the listbox is available
    effect(() => this.listbox()?.addOption(this));

    // any time the element is removed from the dom, we need to remove the option from the listbox
    // and we also want to reset the active state
    onDomRemoval(this.elementRef.nativeElement, () => {
      this.listbox()?.removeOption(this);
      this.setInactiveStyles();
    });
  }

  ngOnDestroy(): void {
    this.listbox()?.removeOption(this);
  }

  /**
   * @internal
   * Sets the active state of the option.
   */
  setActiveStyles(): void {
    this.active.set(true);
    scrollIntoViewIfNeeded(this.elementRef.nativeElement);
  }

  /**
   * @internal
   * Sets the inactive state of the option.
   */
  setInactiveStyles(): void {
    this.active.set(false);
  }

  /**
   * @internal
   * Gets the label of the option, used by the `Highlightable` interface.
   */
  getLabel(): string {
    return this.elementRef.nativeElement.textContent ?? '';
  }

  /**
   * @internal
   * Selects the option.
   */
  select(origin: FocusOrigin): void {
    this.listbox()?.selectOption(this.value(), origin);
  }

  /**
   * @internal
   * Activate the current options.
   */
  activate(): void {
    this.listbox()?.activateOption(this.value());
  }
}

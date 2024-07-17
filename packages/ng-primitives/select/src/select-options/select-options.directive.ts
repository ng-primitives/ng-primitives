/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ActiveDescendantKeyManager, FocusOrigin } from '@angular/cdk/a11y';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Injector,
  Signal,
  contentChildren,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { uniqueId } from 'ng-primitives/utils';
import { NgpSelectOption } from '../select-option/select-option.directive';
import { NgpSelectOptionToken } from '../select-option/select-option.token';
import { injectSelect } from '../select/select.token';
import { NgpSelectOptionsToken } from './select-options.token';

@Directive({
  standalone: true,
  selector: '[ngpSelectOptions]',
  exportAs: 'ngpSelectOptions',
  providers: [{ provide: NgpSelectOptionsToken, useExisting: NgpSelectOptions }],
  host: {
    role: 'listbox',
    '[attr.id]': 'id()',
    '[attr.aria-labelledby]': 'select.button().id()',
    '[attr.tabindex]': '0',
    '[attr.aria-activedescendant]': 'activeDescendant()',
    '[attr.data-state]': 'select.open() ? "open" : "closed"',
    '[style.top.px]': 'select.dropdownBounds().y',
    '[style.inset-inline-start.px]': 'select.dropdownBounds().x',
    '[style.width.px]': 'select.dropdownBounds().width',
    '(keydown)': 'keydown($event)',
    '(document:click)': 'closeOnOutsideClick($event)',
  },
})
export class NgpSelectOptions<T> implements AfterViewInit {
  /**
   * Access the parent select component.
   */
  protected readonly select = injectSelect<T>();

  /**
   * Access the injector.
   */
  private readonly injector = inject(Injector);

  /**
   * Access the element reference.
   */
  protected readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Access the change detector.
   */
  protected readonly changeDetector = inject(ChangeDetectorRef);

  /**
   * Access all the options in the list.
   */
  private readonly options = contentChildren<NgpSelectOption<T>>(NgpSelectOptionToken, {
    descendants: true,
  });

  /**
   * Optionally define an id for the options list. By default, the id is generated.
   */
  readonly id = input(uniqueId('select-options'));

  /**
   * Handle the active descendant.
   */
  private readonly activeDescendantKeyManager = new ActiveDescendantKeyManager(
    this.options as Signal<NgpSelectOption<T>[]>,
    this.injector,
  );

  /**
   * Get the active descendant id
   */
  private readonly activeDescendant = signal<string | null>(null);

  /**
   * Focus the options list when it becomes visible.
   */
  constructor() {
    // update the mounted state when the select dropdown is opened or closed
    effect(() => (this.select.open() ? this.open() : this.close()), { allowSignalWrites: true });

    // whenever the active descendant changes update the active descendant id
    this.activeDescendantKeyManager.change
      .pipe(takeUntilDestroyed())
      .subscribe(() =>
        this.activeDescendant.set(this.activeDescendantKeyManager.activeItem?.id() ?? null),
      );
  }

  ngAfterViewInit(): void {
    // by default the selected option should be active when the options list is opened.
    // if there is no selected option, the first option should be active.
    if (this.select.value() === null) {
      this.activeDescendantKeyManager.setFirstItemActive();
    } else {
      const selectedOption = this.options().find(option => option.value() === this.select.value());
      this.activeDescendantKeyManager.setActiveItem(selectedOption ?? this.options()[0]);
    }
  }

  /**
   * Handle the opening of the options list.
   */
  private open(): void {
    // force change detection to ensure the options list is visible before focusing
    this.changeDetector.detectChanges();
    this.element.nativeElement.focus();
  }

  /**
   * Handle the closing of the options list.
   * @param origin
   */
  private close(origin?: FocusOrigin): void {
    // if the options list is already closed, do nothing
    if (!this.select.open()) {
      return;
    }

    this.select.open.set(false);
    this.select.button().focus(origin);
  }

  /**
   * If the user clicks outside of the options list, close the dropdown.
   * @param event
   */
  protected closeOnOutsideClick(event: MouseEvent): void {
    // if the user performs a click that is not within the options list or the slect button, close the dropdown
    if (
      this.select.open() &&
      !this.element.nativeElement.contains(event.target as Node) &&
      !this.select.button().element.nativeElement.contains(event.target as Node)
    ) {
      this.close();
    }
  }

  /**
   * Handle keyboard events.
   *
   * - If the user presses the tab key keep focus on the dropdown.
   * - If the user presses the escape key, close the dropdown.
   * @param event
   */
  protected keydown(event: KeyboardEvent) {
    // forward the keyboard event to the active descendant key manager
    this.activeDescendantKeyManager.onKeydown(event);

    // prevent the default tab behavior - this is essentially a focus trap
    if (event.key === 'Tab') {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // if the escape key is pressed, close the dropdown
    if (event.key === 'Escape') {
      this.close('keyboard');
      return;
    }

    // if the space or enter key is pressed, select the active option
    if (event.key === ' ' || event.key === 'Enter') {
      const activeItem = this.activeDescendantKeyManager.activeItem;

      if (activeItem && !activeItem.isDisabled()) {
        this.select.value.set(activeItem.value());
        this.close('keyboard');
      }
    }
  }
}

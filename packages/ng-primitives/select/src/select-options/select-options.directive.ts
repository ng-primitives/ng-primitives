/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  contentChildren,
  effect,
  inject,
  input,
} from '@angular/core';
import { uniqueId } from '@ng-primitives/ng-primitives/utils';
import { NgpSelectOptionToken } from '../select-option/select-option.token';
import { injectSelect } from '../select/select.token';
import { NgpSelectOptionsToken } from './select-options.token';

@Directive({
  standalone: true,
  selector: '[ngpSelectOptions]',
  exportAs: 'ngpSelectOptions',
  providers: [{ provide: NgpSelectOptionsToken, useExisting: NgpSelectOptionsDirective }],
  host: {
    role: 'listbox',
    '[attr.id]': 'id()',
    '[attr.aria-labelledby]': 'select.button().id()',
    '[attr.tabindex]': '0',
    '[attr.data-state]': 'select.open() ? "open" : "closed"',
    '(keydown)': 'keydown($event)',
    '(document:click)': 'closeOnOutsideClick($event)',
  },
})
export class NgpSelectOptionsDirective {
  /**
   * Access the parent select component.
   */
  protected readonly select = injectSelect<unknown>();

  /**
   * Access the element reference.
   */
  protected readonly element = inject(ElementRef<HTMLElement>);

  /**
   * Access the change detector.
   */
  protected readonly changeDetector = inject(ChangeDetectorRef);

  /**
   * Access all the options in the list.
   */
  private readonly options = contentChildren(NgpSelectOptionToken, { descendants: true });

  /**
   * Optionally define an id for the options list. By default, the id is generated.
   */
  readonly id = input(uniqueId('select-options'));

  /**
   * Handle the active descendant.
   */
  private readonly activeDescendantKeyManager = new ActiveDescendantKeyManager(this.options);

  /**
   * Focus the options list when it becomes visible.
   */
  constructor() {
    // update the mounted state when the select dropdown is opened or closed
    effect(() => (this.select.open() ? this.open() : this.close()), { allowSignalWrites: true });
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
   */
  private close(): void {
    this.select.open.set(false);
  }

  /**
   * If the user clicks outside of the options list, close the dropdown.
   * @param event
   */
  protected closeOnOutsideClick(event: MouseEvent): void {
    // if the user performs a click that is not within the options list or the slect button, close the dropdown
    if (
      !this.element.nativeElement.contains(event.target) &&
      !this.select.button().element.nativeElement.contains(event.target)
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
    // prevent the default tab behavior - this is essentially a focus trap
    if (event.key === 'Tab') {
      event.preventDefault();
      event.stopPropagation();
    }

    // if the escape key is pressed, close the dropdown
    if (event.key === 'Escape') {
      this.close();
    }
  }
}

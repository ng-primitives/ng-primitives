/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, ElementRef, inject, input } from '@angular/core';
import { uniqueId } from '@ng-primitives/ng-primitives/utils';
import { injectSelect } from '../select/select.token';
import { NgpSelectButtonToken } from './select-button.token';

@Directive({
  standalone: true,
  selector: 'button[ngpSelectButton]',
  exportAs: 'ngpSelectButton',
  providers: [{ provide: NgpSelectButtonToken, useExisting: NgpSelectButtonDirective }],
  host: {
    type: 'button',
    'aria-haspopup': 'listbox',
    '[attr.id]': 'id()',
    '[attr.aria-expanded]': 'select.open()',
    '[attr.aria-controls]': 'select.open() ? select.options()?.id() : null',
    '[attr.data-state]': 'select.open() ? "open" : "closed"',
    '(click)': 'toggle()',
    '(keydown)': 'keydown($event)',
  },
})
export class NgpSelectButtonDirective {
  /**
   * Access the parent select component.
   */
  protected readonly select = injectSelect<unknown>();

  /**
   * Access the element reference.
   * @internal
   */
  readonly element = inject(ElementRef<HTMLElement>);

  /**
   * Optionally define an id for the button. By default, the id is generated.
   */
  readonly id = input(uniqueId('select-button'));

  /**
   * Toggle the select open state.
   */
  protected toggle() {
    this.select.open.update(open => !open);
  }

  /**
   * Handle keyboard events. If the list is closed, open it when the user presses the arrow keys.
   * If the list is open then we navigate using active descendant.
   * @param event
   */
  protected keydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      this.select.open.set(true);
    }

    // if the escape key is pressed, close the dropdown
    if (event.key === 'Escape') {
      this.select.open.set(false);
    }
  }
}

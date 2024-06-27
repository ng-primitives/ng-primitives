/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, computed, signal } from '@angular/core';
import { NgpVisuallyHiddenToken } from './visually-hidden.token';

@Directive({
  standalone: true,
  selector: '[ngpVisuallyHidden]',
  exportAs: 'ngpVisuallyHidden',
  providers: [{ provide: NgpVisuallyHiddenToken, useExisting: NgpVisuallyHidden }],
  host: {
    '[style]': 'style()',
  },
})
export class NgpVisuallyHidden {
  /**
   * Whether the element is hidden.
   */
  protected readonly hidden = signal<boolean>(true);

  protected readonly style = computed(() => {
    if (!this.hidden()) {
      return {};
    }

    return {
      position: 'absolute',
      width: '1px',
      height: '1px',
      margin: '-1px',
      padding: '0',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
      wordWrap: 'normal',
      outline: '0',
      '-webkit-appearance': 'none',
      '-moz-appearance': 'none',
      'inset-inline-start': '0',
    };
  });

  /**
   * Set the element visibility.
   */
  setVisibility(visible: boolean): void {
    this.hidden.set(!visible);
  }
}

/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, HostListener, output, signal } from '@angular/core';
import { injectStyleInjector } from 'ng-primitives/internal';
import { NgpAutofillToken } from './autofill.token';

@Directive({
  standalone: true,
  selector: '[ngpAutofill]',
  exportAs: 'ngpAutofill',
  providers: [{ provide: NgpAutofillToken, useExisting: NgpAutofill }],
  host: {
    '[attr.data-autofill]': 'autofilled() ? "" : null',
  },
})
export class NgpAutofill {
  /**
   * Access the style injector.
   */
  private readonly styleInjector = injectStyleInjector();

  /**
   * Store the autofill state.
   */
  protected readonly autofilled = signal(false);

  /**
   * Emit when the autofill state changes.
   */
  readonly autofillChange = output<boolean>({
    alias: 'ngpAutofill',
  });

  constructor() {
    // This technique is based on that used by the Angular CDK
    // https://github.com/angular/components/blob/main/src/cdk/text-field/_index.scss
    this.styleInjector.add(
      'ngp-autofill',
      `
        @keyframes ngp-autofill-start { }
        @keyframes ngp-autofill-end {}

        [data-autofill]:-webkit-autofill {
          animation: ngp-autofill-start 0s 1ms;
        }

        [data-autofill]:not(:-webkit-autofill) {
          animation: ngp-autofill-end 0s 1ms;
        }
      `,
    );
  }

  @HostListener('animationstart', ['$event'])
  protected onAnimationStart(event: AnimationEvent): void {
    if (event.animationName === 'ngp-autofill-start') {
      this.autofilled.set(true);
      this.autofillChange.emit(true);
    }

    if (event.animationName === 'ngp-autofill-end') {
      this.autofilled.set(false);
      this.autofillChange.emit(false);
    }
  }
}

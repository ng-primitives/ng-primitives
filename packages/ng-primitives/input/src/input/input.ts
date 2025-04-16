import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { NgpAutofill } from 'ng-primitives/autofill';
import { NgpFormControl } from 'ng-primitives/form-field';
import { NgpFocus, NgpHover, NgpPress } from 'ng-primitives/interactions';
import { injectElementRef, NgpCanDisable, NgpDisabledToken } from 'ng-primitives/internal';
import { injectSearchState } from 'ng-primitives/search';
import { NgpInputToken } from './input-token';

@Directive({
  selector: 'input[ngpInput]',
  exportAs: 'ngpInput',
  providers: [
    { provide: NgpInputToken, useExisting: NgpInput },
    { provide: NgpDisabledToken, useExisting: NgpInput },
  ],
  hostDirectives: [NgpFormControl, NgpHover, NgpFocus, NgpPress, NgpAutofill],
})
export class NgpInput implements NgpCanDisable {
  /**
   * The input may be used within a search field, if so we need to register it.
   */
  private readonly searchState = injectSearchState({ optional: true });

  /**
   * Access the element reference.
   */
  private readonly elementRef = injectElementRef<HTMLInputElement>();

  /**
   * Whether the element is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  constructor() {
    this.searchState()?.registerInput(this.elementRef.nativeElement);
  }
}

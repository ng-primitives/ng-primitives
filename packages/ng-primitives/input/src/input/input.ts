import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { NgpAutofill } from 'ng-primitives/autofill';
import { setupFormControl } from 'ng-primitives/form-field';
import { injectElementRef, setupInteractions } from 'ng-primitives/internal';
import { injectSearchState } from 'ng-primitives/search';
import { inputState, provideInputState } from './input-state';

@Directive({
  selector: 'input[ngpInput]',
  exportAs: 'ngpInput',
  providers: [provideInputState()],
  hostDirectives: [NgpAutofill],
  host: {
    '[attr.disabled]': 'disabled() ? "" : null',
  },
})
export class NgpInput {
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

  /**
   * The input state.
   */
  protected readonly state = inputState<NgpInput>(this);

  constructor() {
    setupInteractions({
      hover: true,
      press: true,
      focus: true,
      disabled: this.state.disabled,
    });
    setupFormControl({ disabled: this.state.disabled });

    this.searchState()?.registerInput(this.elementRef.nativeElement);
  }
}

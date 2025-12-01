import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpTextarea, provideTextareaState } from './textarea-state';

@Directive({
  selector: '[ngpTextarea]',
  exportAs: 'ngpTextarea',
  providers: [provideTextareaState({ inherit: false })],
})
export class NgpTextarea {
  /**
   * The id of the textarea. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-textarea'));

  /**
   * Whether the element is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * The state of the textarea.
   */
  protected readonly state = ngpTextarea({
    id: this.id,
    disabled: this.disabled,
  });
}

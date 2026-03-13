import { Directive } from '@angular/core';

/**
 * Apply the `ngpNumberFieldGroup` directive to an element that groups the input and buttons.
 */
@Directive({
  selector: '[ngpNumberFieldGroup]',
  exportAs: 'ngpNumberFieldGroup',
  host: {
    role: 'group',
  },
})
export class NgpNumberFieldGroup {}

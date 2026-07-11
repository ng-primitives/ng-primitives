import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpDialogDescription } from './dialog-description-state';

@Directive({
  selector: '[ngpDialogDescription]',
  exportAs: 'ngpDialogDescription',
})
export class NgpDialogDescription {
  /** The id of the descriptions. */
  readonly id = input<string>(uniqueId('ngp-dialog-description'));

  protected readonly state = ngpDialogDescription({
    id: this.id,
  });
}

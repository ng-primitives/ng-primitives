import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpDialogTitle } from './dialog-title-state';

@Directive({
  selector: '[ngpDialogTitle]',
  exportAs: 'ngpDialogTitle',
})
export class NgpDialogTitle {
  /** The id of the title. */
  readonly id = input<string>(uniqueId('ngp-dialog-title'));

  protected readonly state = ngpDialogTitle({
    id: this.id,
  });
}

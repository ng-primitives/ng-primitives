import { Directive, input, OnDestroy } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpDialogDescription } from './dialog-description-state';

@Directive({
  selector: '[ngpDialogDescription]',
  exportAs: 'ngpDialogDescription',
  host: {
    '[id]': 'id()',
  },
})
export class NgpDialogDescription implements OnDestroy {
  /** The id of the descriptions. */
  readonly id = input<string>(uniqueId('ngp-dialog-description'));

  protected readonly state = ngpDialogDescription({
    id: this.id,
  });

  ngOnDestroy(): void {
    return this.state.destroy();
  }
}

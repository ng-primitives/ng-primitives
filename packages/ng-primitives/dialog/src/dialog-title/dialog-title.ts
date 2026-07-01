import { Directive, input, OnDestroy } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpDialogTitle } from './dialog-title-state';

@Directive({
  selector: '[ngpDialogTitle]',
  exportAs: 'ngpDialogTitle',
  host: {
    '[id]': 'id()',
  },
})
export class NgpDialogTitle implements OnDestroy {
  /** The id of the title. */
  readonly id = input<string>(uniqueId('ngp-dialog-title'));

  protected readonly state = ngpDialogTitle({
    id: this.id,
  });

  ngOnDestroy(): void {
    return this.state.destroy();
  }
}

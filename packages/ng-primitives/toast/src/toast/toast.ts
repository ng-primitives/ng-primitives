import { Directive } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { injectToastConfig } from '../config/toast-config';

@Directive({
  selector: '[ngpToast]',
  exportAs: 'ngpToast',
})
export class NgpToast {
  private readonly config = injectToastConfig();

  /** The unique identifier for the toast */
  readonly id = uniqueId('ngp-toast');

  constructor() {
    debugger;
  }
}

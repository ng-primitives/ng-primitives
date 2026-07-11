import { Directive } from '@angular/core';
import { ngpDialogPanel } from './dialog-panel-state';

@Directive({
  selector: '[ngpDialogPanel]',
  exportAs: 'ngpDialogPanel',
})
export class NgpDialogPanel {
  protected readonly state = ngpDialogPanel({});
}

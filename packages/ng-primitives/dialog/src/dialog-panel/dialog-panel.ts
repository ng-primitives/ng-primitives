import { Directive } from '@angular/core';
import { NgpDialogPanelToken } from './dialog-panel-token';

@Directive({
  selector: '[ngpDialogPanel]',
  exportAs: 'ngpDialogPanel',
  providers: [{ provide: NgpDialogPanelToken, useExisting: NgpDialogPanel }],
})
export class NgpDialogPanel {}

import { Directive } from '@angular/core';
import { ngpTreeNodeCheckbox, provideTreeNodeCheckboxState } from './tree-node-checkbox-state';

/**
 * A tri-state checkbox for a tree node. Reflects the node's checked / indeterminate
 * state (`aria-checked` = `true` | `false` | `mixed`) and toggles it on click,
 * propagating to the node's leaf descendants.
 */
@Directive({
  selector: '[ngpTreeNodeCheckbox]',
  exportAs: 'ngpTreeNodeCheckbox',
  providers: [provideTreeNodeCheckboxState()],
})
export class NgpTreeNodeCheckbox {
  protected readonly state = ngpTreeNodeCheckbox();
}

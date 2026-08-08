import { Directive } from '@angular/core';
import { ngpTreeNodeCheckbox, provideTreeNodeCheckboxState } from './tree-node-checkbox-state';

/**
 * A tri-state checkbox for a tree node. Toggles the node's checked state on click,
 * propagating to the node's leaf descendants, and reflects it via `data-checked` /
 * `data-indeterminate` for styling. The `treeitem` row itself carries `aria-checked`
 * (`true` | `false` | `mixed`), so this element is decorative for assistive tech.
 */
@Directive({
  selector: '[ngpTreeNodeCheckbox]',
  exportAs: 'ngpTreeNodeCheckbox',
  providers: [provideTreeNodeCheckboxState()],
})
export class NgpTreeNodeCheckbox {
  protected readonly state = ngpTreeNodeCheckbox();
}

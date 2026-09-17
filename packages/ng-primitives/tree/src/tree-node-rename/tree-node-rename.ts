import { Directive } from '@angular/core';
import { ngpTreeNodeRename, provideTreeNodeRenameState } from './tree-node-rename-state';

/**
 * Place on the `<input>` rendered while a node is being renamed. It focuses and
 * selects the field, commits on Enter or blur, and cancels on Escape.
 */
@Directive({
  selector: '[ngpTreeNodeRename]',
  exportAs: 'ngpTreeNodeRename',
  providers: [provideTreeNodeRenameState()],
})
export class NgpTreeNodeRename {
  protected readonly state = ngpTreeNodeRename();
}

import { Directive } from '@angular/core';
import { ngpTreeNodeToggle, provideTreeNodeToggleState } from './tree-node-toggle-state';

/**
 * The chevron / expand-collapse control for a tree node.
 */
@Directive({
  selector: '[ngpTreeNodeToggle]',
  exportAs: 'ngpTreeNodeToggle',
  providers: [provideTreeNodeToggleState()],
})
export class NgpTreeNodeToggle {
  protected readonly state = ngpTreeNodeToggle();
}

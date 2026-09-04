import { DestroyRef, Directive, inject, TemplateRef } from '@angular/core';
import { injectTreeState } from '../tree/tree-state';

/**
 * Marks an `<ng-template>` as the tree's drag preview. When present, the
 * floating preview shown while dragging renders this template - with the
 * dragged node exposed as the implicit context - instead of the default clone
 * of the dragged row.
 *
 * ```html
 * <ng-template ngpTreeDragPreview let-node>{{ node.name }}</ng-template>
 * ```
 */
@Directive({
  selector: '[ngpTreeDragPreview]',
})
export class NgpTreeDragPreview {
  private readonly tree = injectTreeState();
  private readonly template = inject(TemplateRef);

  constructor() {
    this.tree().registerDragPreview(this.template);
    inject(DestroyRef).onDestroy(() => this.tree().registerDragPreview(null));
  }
}

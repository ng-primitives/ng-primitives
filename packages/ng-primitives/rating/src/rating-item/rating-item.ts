import { Directive, TemplateRef, ViewContainerRef, computed, inject } from '@angular/core';
import { renderList } from 'ng-primitives/internal';
import { NgpRatingItemState, injectRatingState } from '../rating/rating-state';
import { ngpRatingItem, provideRatingItemState } from './rating-item-state';

/**
 * The render context exposed to the `*ngpRatingItem` template. Every field is
 * derived reactively from the rating value / hover state, so the template
 * updates automatically as the rating changes.
 */
export interface NgpRatingItemContext {
  $implicit: NgpRatingItemState;
}

/**
 * A structural directive that renders one item (star) per `count`, driven by the
 * parent `ngpRating`. Each generated element automatically receives the
 * `data-checked`, `data-half` and `data-highlighted` attributes and has its
 * pointer interactions wired up via the `ngpRatingItem` state function.
 */
@Directive({
  selector: '[ngpRatingItem]',
  exportAs: 'ngpRatingItem',
})
export class NgpRatingItem {
  private readonly template = inject<TemplateRef<NgpRatingItemContext>>(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly state = injectRatingState();

  // Make sure the template checker knows the type of the context.
  static ngTemplateContextGuard(
    _: NgpRatingItem,
    context: unknown,
  ): context is NgpRatingItemContext {
    return true;
  }

  constructor() {
    renderList<number>({
      viewContainer: this.viewContainer,
      template: this.template,
      items: () => Array.from({ length: this.state().count() }, (_, i) => i + 1),
      // Register each item's state so it can be injected within the item view.
      providers: () => [provideRatingItemState()],
      // The item factory's returned state becomes the `let star` context.
      setup: index => {
        const item = computed(() => this.state().itemState(index));
        return ngpRatingItem({
          index,
          checked: computed(() => item().checked),
          half: computed(() => item().half),
          fraction: computed(() => item().fraction),
          highlighted: computed(() => item().highlighted),
          allowHalf: this.state().allowHalf,
          preview: value => this.state().preview(value),
          commit: value => this.state().commit(value),
        });
      },
    });
  }
}

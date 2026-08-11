import { signal, Signal } from '@angular/core';
import { injectCollapsibleState, ngpCollapsibleContent } from 'ng-primitives/collapsible';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';

export interface NgpAccordionContentState {
  /**
   * The id of the content region
   */
  readonly id: Signal<string>;
}

export interface NgpAccordionContentProps {
  /**
   * The id of the content region
   */
  readonly id?: Signal<string>;
}

export const [
  NgpAccordionContentStateToken,
  ngpAccordionContent,
  injectAccordionContentState,
  provideAccordionContentState,
] = createPrimitive(
  'NgpAccordionContent',
  ({ id = signal(uniqueId('ngp-accordion-content')) }: NgpAccordionContentProps) => {
    const element = injectElementRef();
    const collapsible = injectCollapsibleState();

    // Compose the shared collapsible content engine (dimensions, hidden
    // until-found + beforematch, enter/exit animation attrs), but emit the
    // accordion-namespaced CSS variables so existing consumer styles keep working.
    const content = ngpCollapsibleContent({ id, cssVarPrefix: 'ngp-accordion-content' });

    // Unlike a standalone collapsible, an accordion panel is a labelled region.
    attrBinding(element, 'role', 'region');
    attrBinding(element, 'aria-labelledby', collapsible().triggerId);

    return { id: content.id } satisfies NgpAccordionContentState;
  },
);

import { signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive } from 'ng-primitives/state';

export interface NgpListboxSectionState {
  /**
   * @internal
   * Registers the id of the header that labels this section.
   */
  setLabelledBy: (id: string) => void;
  /**
   * @internal
   * Removes the id of the header that labels this section.
   */
  removeLabelledBy: (id: string) => void;
}

export type NgpListboxSectionProps = Record<string, never>;

export const [
  NgpListboxSectionStateToken,
  ngpListboxSection,
  injectListboxSectionState,
  provideListboxSectionState,
] = createPrimitive('NgpListboxSection', () => {
  const elementRef = injectElementRef();

  // The id of the header that labels this section, if one is present.
  const labelledBy = signal<string | undefined>(undefined);

  // Host binding
  attrBinding(elementRef, 'role', 'group');
  attrBinding(elementRef, 'aria-labelledby', labelledBy);

  function setLabelledBy(id: string): void {
    labelledBy.set(id);
  }

  function removeLabelledBy(id: string): void {
    // only clear if this header is still the active one, so a newer header that
    // has taken over isn't clobbered when an old one is torn down
    if (labelledBy() === id) {
      labelledBy.set(undefined);
    }
  }

  return { setLabelledBy, removeLabelledBy } satisfies NgpListboxSectionState;
});

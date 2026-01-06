import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, attrBinding } from 'ng-primitives/state';

export interface NgpBreadcrumbSeparatorState {}

export interface NgpBreadcrumbSeparatorProps {}

export const [
  NgpBreadcrumbSeparatorStateToken,
  ngpBreadcrumbSeparator,
  injectBreadcrumbSeparatorState,
  provideBreadcrumbSeparatorState,
] = createPrimitive('NgpBreadcrumbSeparator', ({}: NgpBreadcrumbSeparatorProps) => {
  const element = injectElementRef();

  // Host bindings
  attrBinding(element, 'role', 'presentation');
  attrBinding(element, 'aria-hidden', 'true');

  return {} satisfies NgpBreadcrumbSeparatorState;
});

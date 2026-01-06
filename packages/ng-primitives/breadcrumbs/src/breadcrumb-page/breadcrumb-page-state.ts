import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, attrBinding } from 'ng-primitives/state';

export interface NgpBreadcrumbPageState {}

export interface NgpBreadcrumbPageProps {}

export const [
  NgpBreadcrumbPageStateToken,
  ngpBreadcrumbPage,
  injectBreadcrumbPageState,
  provideBreadcrumbPageState,
] = createPrimitive('NgpBreadcrumbPage', ({}: NgpBreadcrumbPageProps) => {
  const element = injectElementRef();

  // Host bindings
  attrBinding(element, 'aria-current', 'page');

  return {} satisfies NgpBreadcrumbPageState;
});

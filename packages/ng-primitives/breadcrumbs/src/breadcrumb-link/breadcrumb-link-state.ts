import { ngpInteractions } from 'ng-primitives/interactions';
import { createPrimitive } from 'ng-primitives/state';

export interface NgpBreadcrumbLinkState {}

export interface NgpBreadcrumbLinkProps {}

export const [
  NgpBreadcrumbLinkStateToken,
  ngpBreadcrumbLink,
  injectBreadcrumbLinkState,
  provideBreadcrumbLinkState,
] = createPrimitive('NgpBreadcrumbLink', ({}: NgpBreadcrumbLinkProps) => {
  // Set up interactions for hover, press, and focus-visible
  ngpInteractions({ hover: true, press: true, focusVisible: true });

  return {} satisfies NgpBreadcrumbLinkState;
});

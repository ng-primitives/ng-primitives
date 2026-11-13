import { inject, Injector, Signal, signal, TemplateRef, ViewContainerRef } from '@angular/core';
import { createOverlay, NgpOverlay, NgpOverlayConfig } from 'ng-primitives/portal';
import { createPrimitive, onDestroy } from 'ng-primitives/state';
import { injectAutocompleteState } from '../autocomplete/autocomplete-state';

export interface NgpAutocompletePortalState {
  /**
   * The overlay that manages the dropdown.
   * @internal
   */
  readonly overlay: Signal<NgpOverlay<void> | null>;

  /**
   * Show the portal.
   * @internal
   */
  show(): Promise<void>;

  /**
   * Hide the portal.
   * @internal
   */
  hide(): void;

  /**
   * Destroy the overlay. Called from the directive's ngOnDestroy, so the overlay's onClose
   * still reaches the autocomplete's openChange output, which is torn down before
   * DestroyRef callbacks run.
   * @internal
   */
  destroy(): void;
}

export interface NgpAutocompletePortalProps {
  // No props needed, injected from context
}

export const [
  NgpAutocompletePortalStateToken,
  ngpAutocompletePortal,
  injectAutocompletePortalState,
  provideAutocompletePortalState,
] = createPrimitive(
  'NgpAutocompletePortal',
  ({}: NgpAutocompletePortalProps): NgpAutocompletePortalState => {
    // the portal renders its own template, which never changes
    const templateRef = signal(inject(TemplateRef));
    const viewContainerRef = inject(ViewContainerRef);
    const injector = inject(Injector);
    const state = injectAutocompleteState();
    const overlay = signal<NgpOverlay<void> | null>(null);

    function show(): Promise<void> {
      if (!overlay()) {
        createOverlayInstance();
      }

      return overlay()!.show();
    }

    function hide(): void {
      overlay()?.hide();
    }

    function destroy(): void {
      overlay()?.destroy();
    }

    function createOverlayInstance(): void {
      const config: NgpOverlayConfig<void> = {
        content: templateRef,
        viewContainerRef,
        triggerElement: state().elementRef.nativeElement,
        injector,
        placement: state().placement,
        offset: state().offset(),
        flip: state().flip(),
        // a signal, so a container change applies on the next open
        container: state().container,
        // set while a fragment is searched, so the dropdown follows its caret
        position: state().position,
        closeOnOutsideClick: true,
        closeOnEscape: true,
        restoreFocus: false,
        scrollBehaviour: 'reposition',
        onClose: () => state().onOverlayClose(),
      };

      overlay.set(createOverlay(config));
    }

    const portalState = {
      overlay,
      show,
      hide,
      destroy,
    } satisfies NgpAutocompletePortalState;

    state().registerPortal(portalState);
    onDestroy(() => state().unregisterPortal(portalState));

    return portalState;
  },
);

import { inject, Injector, Signal, signal, TemplateRef, ViewContainerRef } from '@angular/core';
import { createOverlay, NgpOverlay, NgpOverlayConfig } from 'ng-primitives/portal';
import { createPrimitive, PrimitiveStateInjectionOptions } from 'ng-primitives/state';
import { injectSelectState } from '../select/select-state';

export interface NgpSelectPortalState {
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
   * Destroy the overlay. The directive class calls this from ngOnDestroy so
   * the overlay's onClose callback fires while the parent NgpSelect's output
   * bindings are still attached — destroyRef.onDestroy callbacks fire after
   * Angular has already torn those bindings down, which would prevent
   * openChange(false) from reaching the consumer on fixture.destroy().
   * @internal
   */
  destroy(): void;
}

export interface NgpSelectPortalProps {
  // No props needed, injected from context
}

export const [
  NgpSelectPortalStateToken,
  ngpSelectPortal,
  _injectSelectPortalState,
  provideSelectPortalState,
] = createPrimitive('NgpSelectPortal', ({}: NgpSelectPortalProps): NgpSelectPortalState => {
  const templateRef = inject(TemplateRef);
  const viewContainerRef = inject(ViewContainerRef);
  const injector = inject(Injector);
  const selectState = injectSelectState();
  const overlay = signal<NgpOverlay<void> | null>(null);

  // Methods
  async function show(): Promise<void> {
    if (!overlay()) {
      createOverlayInstance();
    }

    return overlay()?.show();
  }

  function hide(): void {
    overlay()?.hide();
  }

  function destroy(): void {
    overlay()?.destroy();
  }

  function createOverlayInstance(): void {
    const overlayConfig: NgpOverlayConfig<void> = {
      content: templateRef,
      viewContainerRef,
      triggerElement: selectState().elementRef.nativeElement,
      injector,
      placement: selectState().placement,
      offset: selectState().offset(),
      flip: selectState().flip(),
      container: selectState().container(),
      closeOnOutsideClick: true,
      closeOnEscape: true,
      restoreFocus: false,
      scrollBehaviour: 'reposition',
      onClose: () => selectState().onOverlayClose(),
    };

    overlay.set(createOverlay(overlayConfig));
  }

  const state = {
    overlay,
    show,
    hide,
    destroy,
  } satisfies NgpSelectPortalState;

  selectState().registerPortal(state);

  return state;
});

export function injectSelectPortalState(
  options?: PrimitiveStateInjectionOptions,
): Signal<NgpSelectPortalState> {
  return _injectSelectPortalState(options) as Signal<NgpSelectPortalState>;
}

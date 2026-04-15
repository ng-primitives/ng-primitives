import { inject, Injector, Signal, signal, TemplateRef, ViewContainerRef } from '@angular/core';
import { createOverlay, NgpOverlay, NgpOverlayConfig } from 'ng-primitives/portal';
import { createPrimitive, onDestroy } from 'ng-primitives/state';
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

  function createOverlayInstance(): void {
    const overlayConfig: NgpOverlayConfig<void> = {
      content: templateRef,
      viewContainerRef,
      triggerElement: selectState().elementRef.nativeElement,
      injector,
      placement: selectState().placement,
      flip: selectState().flip(),
      container: selectState().container(),
      closeOnOutsideClick: true,
      closeOnEscape: true,
      restoreFocus: false,
      scrollBehaviour: 'reposition',
    };

    overlay.set(createOverlay(overlayConfig));
  }

  const state = {
    overlay,
    show,
    hide,
  } satisfies NgpSelectPortalState;

  selectState().registerPortal(state);

  onDestroy(() => {
    overlay()?.destroy();
  });

  return state;
});

export function injectSelectPortalState(): Signal<NgpSelectPortalState> {
  return _injectSelectPortalState() as Signal<NgpSelectPortalState>;
}

import {
  signal,
  WritableSignal,
  ViewContainerRef,
  inject,
  Injector,
  TemplateRef,
} from '@angular/core';
import { createOverlay, NgpOverlay, NgpOverlayConfig } from 'ng-primitives/portal';
import { createPrimitive } from 'ng-primitives/state';
import { injectComboboxState } from '../combobox/combobox-state';

export interface NgpComboboxPortalState {
  /** @internal The overlay that manages the popover. */
  readonly overlay: WritableSignal<NgpOverlay<void> | null>;
  /** @internal Attach the portal. */
  show(): Promise<void>;
  /** @internal Cleanup the portal. */
  destroy(): void;
  /** @internal Detach the portal. */
  detach(): Promise<void>;
}

export interface NgpComboboxPortalProps {}

export const [
  NgpComboboxPortalStateToken,
  ngpComboboxPortal,
  injectComboboxPortalState,
  provideComboboxPortalState,
] = createPrimitive('NgpComboboxPortal', ({}: NgpComboboxPortalProps) => {
  const templateRef = inject(TemplateRef);
  const viewContainerRef = inject(ViewContainerRef);
  const injector = inject(Injector);
  const comboboxState = injectComboboxState();

  const overlay = signal<NgpOverlay<void> | null>(null);

  function show(): Promise<void> {
    // Create the overlay if it doesn't exist yet
    if (!overlay()) {
      createOverlayInstance();
    }

    // Show the overlay
    return overlay()!.show();
  }

  async function detach(): Promise<void> {
    overlay()?.hide();
  }

  function destroy(): void {
    overlay()?.destroy();
  }

  /**
   * Create the overlay that will contain the dropdown
   */
  function createOverlayInstance(): void {
    // Create config for the overlay
    const config: NgpOverlayConfig<void> = {
      content: templateRef,
      viewContainerRef: viewContainerRef,
      triggerElement: comboboxState().elementRef.nativeElement,
      injector: injector,
      placement: comboboxState().placement,
      offset: comboboxState().offset(),
      flip: comboboxState().flip(),
      closeOnOutsideClick: true,
      closeOnEscape: true,
      restoreFocus: false,
      scrollBehaviour: 'reposition',
      container: comboboxState().container(),
      onClose: () => comboboxState().onOverlayClosed(),
    };

    overlay.set(createOverlay(config));
  }

  const state = {
    overlay,
    destroy,
    show,
    detach,
  } satisfies NgpComboboxPortalState;

  comboboxState().registerPortal(state);

  return state;
});

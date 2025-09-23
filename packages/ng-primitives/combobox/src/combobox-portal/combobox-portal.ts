import {
  Directive,
  inject,
  Injector,
  OnDestroy,
  signal,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { createOverlay, NgpOverlay, NgpOverlayConfig } from 'ng-primitives/portal';
import { injectComboboxState } from '../combobox/combobox-state';

@Directive({
  selector: '[ngpComboboxPortal]',
  exportAs: 'ngpComboboxPortal',
})
export class NgpComboboxPortal implements OnDestroy {
  /** Access the combobox state. */
  private readonly state = injectComboboxState();
  /** Access the view container reference. */
  private readonly viewContainerRef = inject(ViewContainerRef);

  /** Access the template reference. */
  private readonly templateRef = inject(TemplateRef);

  /** Access the injector. */
  private readonly injector = inject(Injector);

  /**
   * The overlay that manages the popover
   * @internal
   */
  readonly overlay = signal<NgpOverlay<void> | null>(null);

  constructor() {
    this.state().registerPortal(this);
  }

  /** Cleanup the portal. */
  ngOnDestroy(): void {
    this.overlay()?.destroy();
  }

  /**
   * Attach the portal.
   * @internal
   */
  show(): Promise<void> {
    // Create the overlay if it doesn't exist yet
    if (!this.overlay()) {
      this.createOverlay();
    }

    // Show the overlay
    return this.overlay()!.show();
  }

  /**
   * Detach the portal.
   * @internal
   */
  async detach(): Promise<void> {
    this.overlay()?.hide();
  }

  /**
   * Create the overlay that will contain the dropdown
   */
  private createOverlay(): void {
    // Create config for the overlay
    const config: NgpOverlayConfig<void> = {
      content: this.templateRef,
      viewContainerRef: this.viewContainerRef,
      triggerElement: this.state().elementRef.nativeElement,
      injector: this.injector,
      placement: this.state().placement,
      closeOnOutsideClick: true,
      closeOnEscape: true,
      restoreFocus: false,
      scrollBehaviour: 'reposition',
      container: this.state().container(),
    };

    this.overlay.set(createOverlay(config));
  }
}

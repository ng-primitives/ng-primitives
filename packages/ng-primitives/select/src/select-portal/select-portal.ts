import { computed, Directive, OnDestroy } from '@angular/core';
import { injectSelectState } from '../select/select-state';
import { ngpSelectPortal } from './select-portal-state';

@Directive({
  selector: '[ngpSelectPortal]',
  exportAs: 'ngpSelectPortal',
})
export class NgpSelectPortal implements OnDestroy {
  /** Access the select state. */
  private readonly selectState = injectSelectState();

  /** Access the portal state. */
  private readonly portalState = ngpSelectPortal({});

  constructor() {
    this.selectState().registerPortal(this);
  }

  ngOnDestroy(): void {
    this.portalState.overlay()?.destroy();
  }

  /**
   * Show the portal.
   * @internal
   */
  show(): Promise<void> {
    return this.portalState.show();
  }

  /**
   * Hide the portal.
   * @internal
   */
  async hide(): Promise<void> {
    return this.portalState.hide();
  }

  /**
   * The overlay that manages the popover
   * @internal
   */
  overlay = computed(() => this.portalState.overlay());

  /**
   * Detach the portal.
   * @internal
   */
  async detach(): Promise<void> {
    this.overlay()?.hide();
  }
}

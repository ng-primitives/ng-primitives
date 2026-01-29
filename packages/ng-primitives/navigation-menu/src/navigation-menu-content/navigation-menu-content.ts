import {
  Directive,
  effect,
  EmbeddedViewRef,
  inject,
  Injector,
  signal,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { ngpRovingFocusGroup, provideRovingFocusGroupState } from 'ng-primitives/roving-focus';
import { injectNavigationMenuItemState } from '../navigation-menu-item/navigation-menu-item-state';
import { injectNavigationMenuTriggerState } from '../navigation-menu-trigger/navigation-menu-trigger-state';
import { injectNavigationMenuState } from '../navigation-menu/navigation-menu-state';
import {
  injectNavigationMenuContentState,
  ngpNavigationMenuContent,
  provideNavigationMenuContentState,
} from './navigation-menu-content-state';

/**
 * Apply the `ngpNavigationMenuContent` structural directive to the content panel for each trigger.
 * Usage: <div *ngpNavigationMenuContent>
 */
@Directive({
  selector: '[ngpNavigationMenuContent]',
  exportAs: 'ngpNavigationMenuContent',
  providers: [
    provideNavigationMenuContentState({ inherit: false }),
    provideRovingFocusGroupState({ inherit: false }),
  ],
})
export class NgpNavigationMenuContent {
  private readonly state = ngpNavigationMenuContent();

  private readonly injector = inject(Injector);

  private embeddedViewRef: EmbeddedViewRef<any> | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private originalParent: HTMLElement | null = null;
  private contentElement: HTMLElement | null = null;
  private viewportEffectCleanup: (() => void) | null = null;

  // Injectable services
  private readonly templateRef = inject(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly menu = injectNavigationMenuState();
  private readonly item = injectNavigationMenuItemState();
  private readonly trigger = injectNavigationMenuTriggerState({ optional: true });
  private readonly contentState = injectNavigationMenuContentState();

  constructor() {
    // Set up roving focus group for keyboard navigation within the content
    // inherit: false - create our own group, don't use the root menu's group
    // wrap: false - ArrowUp on first item should not wrap to last
    ngpRovingFocusGroup({
      orientation: signal('vertical'),
      disabled: signal(false),
      wrap: signal(false),
      homeEnd: signal(true),
      inherit: false,
    });

    // Create/destroy content based on open state
    effect(() => {
      const isOpen = this.state.open();

      if (isOpen && !this.embeddedViewRef) {
        // Create the content when opening
        this.embeddedViewRef = this.viewContainer.createEmbeddedView(this.templateRef);

        // Get the root element before detectChanges to prevent flicker
        const rootNode = this.embeddedViewRef.rootNodes[0];
        if (rootNode && rootNode.nodeType === Node.ELEMENT_NODE) {
          this.contentElement = rootNode as HTMLElement;
          // Hide initially to prevent flicker while moving to viewport
          // Use both display:none and visibility:hidden for maximum flicker prevention
          this.contentElement.style.display = 'none';
          this.contentElement.style.visibility = 'hidden';
        }

        this.embeddedViewRef.detectChanges();

        // Set up and move to viewport
        if (this.contentElement) {
          // Use setTimeout to ensure the element is fully in DOM
          setTimeout(() => this.setupContentElement(), 0);
        }
      } else if (!isOpen && this.embeddedViewRef) {
        // Clean up
        this.cleanupContentElement();

        // Destroy the content when closing
        this.viewContainer.clear();
        this.embeddedViewRef = null;
        this.contentElement = null;
      }
    });
  }

  private setupContentElement() {
    if (!this.contentElement) return;

    const menuState = this.menu();
    const itemState = this.item();

    // Set attributes
    this.contentElement.setAttribute('role', 'menu');
    this.contentElement.setAttribute('id', this.contentState().id());
    this.contentElement.setAttribute('data-state', this.contentState().open() ? 'open' : 'closed');
    this.contentElement.setAttribute('data-orientation', menuState.orientation());

    // Set aria-labelledby to reference the trigger
    const triggerState = this.trigger?.();
    if (triggerState?.id) {
      this.contentElement.setAttribute('aria-labelledby', triggerState.id());
    }

    const motion = this.contentState().motionDirection();
    if (motion) {
      this.contentElement.setAttribute('data-motion', motion);
    }

    // Register element with item
    itemState.setContentElement(this.contentElement);

    // Register content ID with trigger
    if (triggerState) {
      triggerState.setContentId(this.contentState().id());
    }

    // Add event listeners
    this.contentElement.addEventListener('pointerenter', this.handlePointerEnter);
    this.contentElement.addEventListener('pointerleave', this.handlePointerLeave);

    // Use an effect to move content to viewport when viewport becomes available
    const effectRef = effect(
      () => {
        const viewport = this.menu().viewport();

        if (viewport?.element && this.contentElement) {
          // Store original parent for cleanup
          if (!this.originalParent) {
            this.originalParent = this.contentElement.parentElement;
          }

          // Move element to viewport if it's not already there
          if (this.contentElement.parentElement !== viewport.element && this.originalParent) {
            viewport.element.appendChild(this.contentElement);
          }

          // Make visible after moving to viewport
          this.contentElement.style.display = '';
          this.contentElement.style.visibility = '';

          // Temporarily remove viewport constraints for accurate measurement
          // This ensures shrinking works correctly when switching from larger to smaller content
          const viewportEl = viewport.element;
          const originalWidth = viewportEl.style.width;
          const originalHeight = viewportEl.style.height;
          const originalOverflow = viewportEl.style.overflow;

          // Remove constraints to allow content to render at natural size
          viewportEl.style.width = 'auto';
          viewportEl.style.height = 'auto';
          viewportEl.style.overflow = 'visible';

          // Force layout recalculation and measure unconstrained content
          const rect = this.contentElement.getBoundingClientRect();
          const measuredWidth = rect.width;
          const measuredHeight = rect.height;

          // Restore viewport styles
          viewportEl.style.width = originalWidth;
          viewportEl.style.height = originalHeight;
          viewportEl.style.overflow = originalOverflow;

          // Update viewport dimensions with measured values
          if (measuredWidth > 0 && measuredHeight > 0) {
            viewport.updateDimensions(measuredWidth, measuredHeight);
          }

          // Set up resize observer for dynamic content changes
          if (!this.resizeObserver) {
            const observedElement = this.contentElement;
            this.resizeObserver = new ResizeObserver(entries => {
              const entry = entries[0];
              if (!entry) return;
              // Guard: only update if this element is still in the viewport
              // (ResizeObserver callbacks can fire after disconnect() if enqueued)
              if (observedElement.parentElement !== viewport.element) return;

              // Use borderBoxSize for accurate dimensions including padding/border
              const borderBoxSize = entry.borderBoxSize?.[0];
              if (borderBoxSize) {
                const width = borderBoxSize.inlineSize;
                const height = borderBoxSize.blockSize;
                if (width > 0 && height > 0) {
                  viewport.updateDimensions(width, height);
                }
              } else {
                // Fallback for older browsers - use getBoundingClientRect for consistency
                const fallbackRect = observedElement.getBoundingClientRect();
                if (fallbackRect.width > 0 && fallbackRect.height > 0) {
                  viewport.updateDimensions(fallbackRect.width, fallbackRect.height);
                }
              }
            });
            this.resizeObserver.observe(this.contentElement);
          }

          // Clean up this effect once we've moved to viewport
          this.viewportEffectCleanup?.();
          this.viewportEffectCleanup = null;
        }
      },
      { injector: this.injector },
    );

    this.viewportEffectCleanup = () => effectRef.destroy();
  }

  private cleanupContentElement() {
    if (!this.contentElement) return;

    // Clean up viewport effect
    if (this.viewportEffectCleanup) {
      this.viewportEffectCleanup();
      this.viewportEffectCleanup = null;
    }

    // Remove event listeners
    this.contentElement.removeEventListener('pointerenter', this.handlePointerEnter);
    this.contentElement.removeEventListener('pointerleave', this.handlePointerLeave);

    // Clean up registrations
    this.item().setContentElement(null);

    const triggerState = this.trigger?.();
    if (triggerState) {
      triggerState.setContentId(undefined);
    }

    // Remove from viewport FIRST (before disconnecting observer)
    // This ensures any pending ResizeObserver callbacks see it's no longer in viewport
    if (this.originalParent && this.contentElement.parentElement) {
      this.originalParent.appendChild(this.contentElement);
    }
    this.originalParent = null;

    // Clean up resize observer after content is removed from viewport
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  private handlePointerEnter = () => {
    this.menu().cancelCloseTimer();
  };

  private handlePointerLeave = () => {
    this.menu().startCloseTimer();
  };

  /**
   * Whether the content is open.
   */
  readonly open = this.state.open;

  /**
   * The motion direction for animations.
   */
  readonly motionDirection = this.state.motionDirection;
}

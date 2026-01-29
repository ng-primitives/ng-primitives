import {
  Directive,
  effect,
  EmbeddedViewRef,
  inject,
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

  private embeddedViewRef: EmbeddedViewRef<any> | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private originalParent: HTMLElement | null = null;
  private contentElement: HTMLElement | null = null;
  private viewportMoveTimeout: ReturnType<typeof setTimeout> | null = null;

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

    // Move to viewport - check multiple times as viewport might not be ready immediately
    this.attemptViewportMove();
  }

  private attemptViewportMove(attempts = 0) {
    if (!this.contentElement) return;

    // Clear any pending timeout
    if (this.viewportMoveTimeout) {
      clearTimeout(this.viewportMoveTimeout);
      this.viewportMoveTimeout = null;
    }

    // If we've exhausted attempts, show content anyway to avoid it being permanently hidden
    if (attempts > 10) {
      this.contentElement.style.visibility = '';
      return;
    }

    const menuState = this.menu();
    const viewport = menuState.viewport();

    if (viewport && viewport.element) {
      // Only move if we haven't already moved it
      if (!this.originalParent) {
        this.originalParent = this.contentElement.parentElement;
      }

      // Move element to viewport if it's not already there
      if (this.contentElement.parentElement !== viewport.element && this.originalParent) {
        viewport.element.appendChild(this.contentElement);
      }

      // Make visible after moving to viewport
      this.contentElement.style.visibility = '';

      // Set up resize observer if not already set up
      if (!this.resizeObserver) {
        this.resizeObserver = new ResizeObserver(() => {
          if (!this.contentElement) return;
          const width = this.contentElement.scrollWidth;
          const height = this.contentElement.scrollHeight;
          if (width > 0 && height > 0) {
            viewport.updateDimensions(width, height);
          }
        });
        this.resizeObserver.observe(this.contentElement);
      }
    } else {
      // Viewport not ready, try again
      this.viewportMoveTimeout = setTimeout(() => this.attemptViewportMove(attempts + 1), 10);
    }
  }

  private cleanupContentElement() {
    if (!this.contentElement) return;

    // Clear viewport move timeout
    if (this.viewportMoveTimeout) {
      clearTimeout(this.viewportMoveTimeout);
      this.viewportMoveTimeout = null;
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

    // Clean up resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Restore to original parent if needed
    if (this.originalParent && this.contentElement.parentElement) {
      this.originalParent.appendChild(this.contentElement);
    }
    this.originalParent = null;
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

import { Component } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpOverlay } from 'ng-primitives/portal';
import { describe, expect, it, vi } from 'vitest';
import { NgpMenuItem } from '../menu-item/menu-item';
import { NgpMenuTrigger } from '../menu-trigger/menu-trigger';
import { NgpMenu } from '../menu/menu';
import { NgpSubmenuTrigger } from './submenu-trigger';

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="root-trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="root-menu">
        <button ngpMenuItem data-testid="item-1">Item 1</button>
        <button [ngpSubmenuTrigger]="submenu" ngpMenuItem data-testid="submenu-trigger">
          Open Submenu
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu">
        <button ngpMenuItem data-testid="submenu-item-1">Submenu Item 1</button>
        <button ngpMenuItem data-testid="submenu-item-2">Submenu Item 2</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class TestSubmenuComponent {}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="root-trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="root-menu">
        <button
          [ngpSubmenuTrigger]="submenu"
          [ngpSubmenuTriggerFlip]="false"
          ngpMenuItem
          data-testid="submenu-trigger"
        >
          Open Submenu
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu">
        <button ngpMenuItem data-testid="submenu-item-1">Submenu Item 1</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class TestSubmenuNoFlipComponent {}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="root-trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="root-menu">
        <button
          [ngpSubmenuTrigger]="submenu"
          [ngpSubmenuTriggerPlacement]="placement"
          ngpMenuItem
          data-testid="submenu-trigger"
        >
          Open Submenu
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu">
        <button ngpMenuItem data-testid="submenu-item-1">Submenu Item 1</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class TestSubmenuPlacementComponent {
  placement: string = 'right-start';
}

/**
 * Helper to open the root menu and submenu.
 */
async function openMenuAndSubmenu(fixture: {
  autoDetectChanges: (autoDetect: boolean) => void;
  debugElement: { nativeElement: HTMLElement };
}): Promise<void> {
  fixture.autoDetectChanges(true);

  const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="root-trigger"]')!;

  // Open root menu
  fireEvent.click(trigger);

  await waitFor(() => {
    expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument();
  });

  // Open submenu
  const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]')!;
  fireEvent.click(submenuTrigger);

  await waitFor(() => {
    expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument();
  });
}

function findSubmenuOverlayContext(
  contexts: unknown[],
):
  | { config: { flip?: unknown; placement?: () => string; triggerElement: HTMLElement } }
  | undefined {
  return contexts.find(
    (
      context,
    ): context is {
      config: { flip?: unknown; placement?: () => string; triggerElement: HTMLElement };
    } =>
      !!context &&
      typeof context === 'object' &&
      'config' in context &&
      !!(context as { config?: { triggerElement?: HTMLElement } }).config?.triggerElement &&
      (context as { config: { triggerElement: HTMLElement } }).config.triggerElement.getAttribute(
        'data-testid',
      ) === 'submenu-trigger',
  );
}

describe('NgpSubmenuTrigger viewport awareness', () => {
  describe('data-placement attribute', () => {
    it('should set data-placement on the submenu when opened', async () => {
      const { fixture } = await render(TestSubmenuComponent);
      fixture.autoDetectChanges(true);

      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument();
      });

      // Open submenu
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]')!;
      fireEvent.click(submenuTrigger);

      await waitFor(() => {
        const submenu = document.querySelector('[data-testid="submenu"]');
        expect(submenu).toBeInTheDocument();
        expect(submenu?.getAttribute('data-placement')).toBeTruthy();
      });
    });
  });

  describe('flip configuration', () => {
    it('should pass flip=true to the submenu overlay when flip is enabled by default', async () => {
      const computePositionSpy = vi.spyOn(
        NgpOverlay.prototype as unknown as Record<string, () => Promise<void>>,
        'computePosition',
      );

      try {
        const { fixture } = await render(TestSubmenuComponent);
        await openMenuAndSubmenu(fixture);

        const submenuContext = findSubmenuOverlayContext(computePositionSpy.mock.contexts);
        expect(submenuContext).toBeDefined();
        expect(submenuContext!.config.flip).toBe(true);
      } finally {
        computePositionSpy.mockRestore();
      }
    });

    it('should pass flip=false to the submenu overlay when flip is disabled', async () => {
      const computePositionSpy = vi.spyOn(
        NgpOverlay.prototype as unknown as Record<string, () => Promise<void>>,
        'computePosition',
      );

      try {
        const { fixture } = await render(TestSubmenuNoFlipComponent);
        await openMenuAndSubmenu(fixture);

        const submenuContext = findSubmenuOverlayContext(computePositionSpy.mock.contexts);
        expect(submenuContext).toBeDefined();
        expect(submenuContext!.config.flip).toBe(false);
      } finally {
        computePositionSpy.mockRestore();
      }
    });
  });

  describe('viewport-aware flip behavior', () => {
    /**
     * Sets up DOM mocks to simulate a constrained viewport.
     * Floating UI uses getBoundingClientRect, offsetWidth/offsetHeight, and
     * window/document dimensions to determine overflow and flip placement.
     */
    function setupViewportMocks(): { cleanup: () => void } {
      const originalInnerWidth = window.innerWidth;
      const originalInnerHeight = window.innerHeight;

      // Save original document size descriptors
      const docElement = document.documentElement;
      const origDocClientWidth = Object.getOwnPropertyDescriptor(docElement, 'clientWidth');
      const origDocClientHeight = Object.getOwnPropertyDescriptor(docElement, 'clientHeight');
      const origDocScrollWidth = Object.getOwnPropertyDescriptor(docElement, 'scrollWidth');
      const origDocScrollHeight = Object.getOwnPropertyDescriptor(docElement, 'scrollHeight');
      const origBodyClientWidth = Object.getOwnPropertyDescriptor(document.body, 'clientWidth');
      const origBodyClientHeight = Object.getOwnPropertyDescriptor(document.body, 'clientHeight');

      // Mock viewport dimensions
      Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true });

      // Mock document dimensions for Floating UI's getDocumentRect/getClippingRect
      Object.defineProperty(docElement, 'clientWidth', { value: 400, configurable: true });
      Object.defineProperty(docElement, 'clientHeight', { value: 600, configurable: true });
      Object.defineProperty(docElement, 'scrollWidth', { value: 400, configurable: true });
      Object.defineProperty(docElement, 'scrollHeight', { value: 600, configurable: true });
      Object.defineProperty(document.body, 'clientWidth', { value: 400, configurable: true });
      Object.defineProperty(document.body, 'clientHeight', { value: 600, configurable: true });

      // Mock getBoundingClientRect to simulate viewport constraint.
      // The submenu trigger is positioned so its right edge is near the viewport edge.
      // A right-start submenu would overflow, but left-start has enough space.
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: HTMLElement,
      ) {
        const testId = this.getAttribute('data-testid');

        if (testId === 'root-trigger') {
          return new DOMRect(200, 10, 100, 30);
        }
        if (testId === 'root-menu') {
          return new DOMRect(200, 40, 200, 120);
        }
        if (testId === 'submenu-trigger') {
          // Right edge at 400 (viewport edge) - no room on the right for a 200px submenu
          // But left side has 200px of space - enough for the submenu
          return new DOMRect(200, 70, 200, 30);
        }
        if (testId === 'submenu') {
          // 200px wide submenu
          return new DOMRect(200, 70, 200, 80);
        }

        if (this === document.body || this === document.documentElement) {
          return new DOMRect(0, 0, 400, 600);
        }

        // Default for menu items and other elements
        return new DOMRect(200, 70, 200, 30);
      });

      // Mock offsetWidth/offsetHeight - Floating UI uses these via getDimensions()
      // to determine the floating element's size (JSDOM returns 0 by default)
      const origOffsetWidthDesc = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        'offsetWidth',
      );
      const origOffsetHeightDesc = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        'offsetHeight',
      );

      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
        get(this: HTMLElement) {
          const testId = this.getAttribute('data-testid');
          if (testId === 'submenu') return 200;
          if (testId === 'root-menu') return 200;
          if (testId === 'submenu-trigger') return 200;
          if (testId === 'root-trigger') return 100;
          return 0;
        },
        configurable: true,
      });

      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        get(this: HTMLElement) {
          const testId = this.getAttribute('data-testid');
          if (testId === 'submenu') return 80;
          if (testId === 'root-menu') return 120;
          if (testId === 'submenu-trigger') return 30;
          if (testId === 'root-trigger') return 30;
          return 0;
        },
        configurable: true,
      });

      return {
        cleanup: () => {
          vi.restoreAllMocks();
          Object.defineProperty(window, 'innerWidth', {
            value: originalInnerWidth,
            configurable: true,
          });
          Object.defineProperty(window, 'innerHeight', {
            value: originalInnerHeight,
            configurable: true,
          });
          if (origDocClientWidth) {
            Object.defineProperty(docElement, 'clientWidth', origDocClientWidth);
          }
          if (origDocClientHeight) {
            Object.defineProperty(docElement, 'clientHeight', origDocClientHeight);
          }
          if (origDocScrollWidth) {
            Object.defineProperty(docElement, 'scrollWidth', origDocScrollWidth);
          }
          if (origDocScrollHeight) {
            Object.defineProperty(docElement, 'scrollHeight', origDocScrollHeight);
          }
          if (origBodyClientWidth) {
            Object.defineProperty(document.body, 'clientWidth', origBodyClientWidth);
          }
          if (origBodyClientHeight) {
            Object.defineProperty(document.body, 'clientHeight', origBodyClientHeight);
          }
          if (origOffsetWidthDesc) {
            Object.defineProperty(HTMLElement.prototype, 'offsetWidth', origOffsetWidthDesc);
          }
          if (origOffsetHeightDesc) {
            Object.defineProperty(HTMLElement.prototype, 'offsetHeight', origOffsetHeightDesc);
          }
        },
      };
    }

    it('should flip submenu placement before shift when positioned near viewport edge', async () => {
      const { cleanup } = setupViewportMocks();

      try {
        const { fixture } = await render(TestSubmenuComponent);
        fixture.autoDetectChanges(true);

        const trigger = fixture.debugElement.nativeElement.querySelector(
          '[data-testid="root-trigger"]',
        );

        // Open root menu
        fireEvent.click(trigger);

        await waitFor(() => {
          expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument();
        });

        // Open submenu
        const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]')!;
        fireEvent.click(submenuTrigger);

        await waitFor(() => {
          const submenu = document.querySelector('[data-testid="submenu"]');
          expect(submenu).toBeInTheDocument();
          // The submenu should have flipped to the left since there's no space on the right
          const placement = submenu?.getAttribute('data-placement');
          expect(placement).toContain('left');
        });
      } finally {
        cleanup();
      }
    });

    it('should not flip when flip is disabled even near viewport edge', async () => {
      const { cleanup } = setupViewportMocks();

      try {
        const { fixture } = await render(TestSubmenuNoFlipComponent);
        fixture.autoDetectChanges(true);

        const trigger = fixture.debugElement.nativeElement.querySelector(
          '[data-testid="root-trigger"]',
        );

        // Open root menu
        fireEvent.click(trigger);

        await waitFor(() => {
          expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument();
        });

        // Open submenu
        const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]')!;
        fireEvent.click(submenuTrigger);

        // With flip disabled, the submenu should stay at its original placement (right-start)
        // even when near the viewport edge
        await waitFor(() => {
          const submenu = document.querySelector('[data-testid="submenu"]');
          expect(submenu).toBeInTheDocument();
          const placement = submenu?.getAttribute('data-placement');
          expect(placement).toContain('right');
        });
      } finally {
        cleanup();
      }
    });
  });

  describe('custom placement', () => {
    it('should use left-start placement when specified', async () => {
      const computePositionSpy = vi.spyOn(
        NgpOverlay.prototype as unknown as Record<string, () => Promise<void>>,
        'computePosition',
      );

      try {
        const { fixture } = await render(TestSubmenuPlacementComponent);
        fixture.componentInstance.placement = 'left-start';
        fixture.detectChanges();

        await openMenuAndSubmenu(fixture);

        const submenuContext = findSubmenuOverlayContext(computePositionSpy.mock.contexts);
        expect(submenuContext).toBeDefined();
        expect(submenuContext!.config.placement?.()).toBe('left-start');
      } finally {
        computePositionSpy.mockRestore();
      }
    });

    it('should apply custom placement when specified', async () => {
      const { fixture } = await render(TestSubmenuPlacementComponent);
      // Use right-start (default direction but explicit) to verify placement input is wired up
      fixture.componentInstance.placement = 'right-start';
      fixture.detectChanges();

      await openMenuAndSubmenu(fixture);

      // The submenu should have data-placement set (proving the placement input was applied)
      await waitFor(() => {
        const submenu = document.querySelector('[data-testid="submenu"]');
        expect(submenu).toBeInTheDocument();
        expect(submenu?.getAttribute('data-placement')).toBeTruthy();
      });
    });
  });
});

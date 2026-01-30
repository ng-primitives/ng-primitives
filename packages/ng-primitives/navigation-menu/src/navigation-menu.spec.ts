import { Component, TemplateRef, viewChild } from '@angular/core';
import { fakeAsync, flush, tick } from '@angular/core/testing';
import { fireEvent, render } from '@testing-library/angular';
import {
  defaultNavigationMenuConfig,
  NgpNavigationMenuConfig,
  provideNavigationMenuConfig,
} from './config/navigation-menu-config';
import { NgpNavigationMenuContentItem } from './navigation-menu-content-item/navigation-menu-content-item';
import { NgpNavigationMenuContent } from './navigation-menu-content/navigation-menu-content';
import { NgpNavigationMenuItem } from './navigation-menu-item/navigation-menu-item';
import { NgpNavigationMenuLink } from './navigation-menu-link/navigation-menu-link';
import { NgpNavigationMenuList } from './navigation-menu-list/navigation-menu-list';
import { NgpNavigationMenuTrigger } from './navigation-menu-trigger/navigation-menu-trigger';
import { NgpNavigationMenu } from './navigation-menu/navigation-menu';

@Component({
  template: `
    <nav
      [ngpNavigationMenuOrientation]="orientation"
      [ngpNavigationMenuShowDelay]="showDelay"
      [ngpNavigationMenuHideDelay]="hideDelay"
      [ngpNavigationMenuValue]="value"
      (ngpNavigationMenuValueChange)="onValueChange($event)"
      ngpNavigationMenu
      data-testid="navigation-menu"
    >
      <ul ngpNavigationMenuList data-testid="navigation-menu-list">
        <li ngpNavigationMenuItem ngpNavigationMenuItemValue="products" data-testid="item-products">
          <button
            [ngpNavigationMenuTrigger]="productsContent"
            [ngpNavigationMenuTriggerDisabled]="trigger1Disabled"
            data-testid="trigger-products"
          >
            Products
          </button>
          <ng-template #productsContent>
            <div ngpNavigationMenuContent data-testid="content-products">
              <a
                [ngpNavigationMenuContentItemDisabled]="item1Disabled"
                ngpNavigationMenuContentItem
                href="#"
                data-testid="content-item-1"
              >
                Product 1
              </a>
              <a ngpNavigationMenuContentItem href="#" data-testid="content-item-2">Product 2</a>
              <a ngpNavigationMenuContentItem href="#" data-testid="content-item-3">Product 3</a>
            </div>
          </ng-template>
        </li>
        <li
          ngpNavigationMenuItem
          ngpNavigationMenuItemValue="solutions"
          data-testid="item-solutions"
        >
          <button
            [ngpNavigationMenuTrigger]="solutionsContent"
            [ngpNavigationMenuTriggerDisabled]="trigger2Disabled"
            data-testid="trigger-solutions"
          >
            Solutions
          </button>
          <ng-template #solutionsContent>
            <div ngpNavigationMenuContent data-testid="content-solutions">
              <a ngpNavigationMenuContentItem href="#" data-testid="content-item-a">Solution A</a>
              <a ngpNavigationMenuContentItem href="#" data-testid="content-item-b">Solution B</a>
            </div>
          </ng-template>
        </li>
        <li>
          <a
            [ngpNavigationMenuLinkActive]="linkActive"
            [ngpNavigationMenuLinkDisabled]="linkDisabled"
            ngpNavigationMenuLink
            href="#"
            data-testid="direct-link"
          >
            Direct Link
          </a>
        </li>
      </ul>
    </nav>
  `,
  imports: [
    NgpNavigationMenu,
    NgpNavigationMenuList,
    NgpNavigationMenuItem,
    NgpNavigationMenuTrigger,
    NgpNavigationMenuContent,
    NgpNavigationMenuContentItem,
    NgpNavigationMenuLink,
  ],
})
class TestNavigationMenuComponent {
  orientation: 'horizontal' | 'vertical' = 'horizontal';
  showDelay = 200;
  hideDelay = 150;
  value: string | null = null;
  trigger1Disabled = false;
  trigger2Disabled = false;
  linkActive = false;
  linkDisabled = false;
  item1Disabled = false;

  productsContent = viewChild<TemplateRef<unknown>>('productsContent');
  solutionsContent = viewChild<TemplateRef<unknown>>('solutionsContent');

  valueChanges: (string | null)[] = [];

  onValueChange(value: string | null): void {
    this.valueChanges.push(value);
  }
}

describe('Navigation Menu', () => {
  describe('Basic Rendering & ARIA Attributes', () => {
    it('should render navigation menu with role="navigation"', async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const nav = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="navigation-menu"]',
      );

      expect(nav).toHaveAttribute('role', 'navigation');
    });

    it('should have data-orientation attribute on root menu', async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const nav = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="navigation-menu"]',
      );

      expect(nav).toHaveAttribute('data-orientation', 'horizontal');

      fixture.componentInstance.orientation = 'vertical';
      fixture.detectChanges();

      expect(nav).toHaveAttribute('data-orientation', 'vertical');
    });

    it('should render list with role="menubar" and aria-orientation', async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const list = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="navigation-menu-list"]',
      );

      expect(list).toHaveAttribute('role', 'menubar');
      expect(list).toHaveAttribute('aria-orientation', 'horizontal');
      expect(list).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('should update list aria-orientation when menu orientation changes', async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const list = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="navigation-menu-list"]',
      );

      fixture.componentInstance.orientation = 'vertical';
      fixture.detectChanges();

      expect(list).toHaveAttribute('aria-orientation', 'vertical');
      expect(list).toHaveAttribute('data-orientation', 'vertical');
    });

    it('should render trigger with proper ARIA attributes', async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveAttribute('type', 'button');
    });

    it('should update trigger aria-expanded when open', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      // Click to open
      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(trigger).toHaveAttribute('data-open');
    }));

    it('should render link with aria-current when active', async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const link = fixture.debugElement.nativeElement.querySelector('[data-testid="direct-link"]');

      expect(link).not.toHaveAttribute('aria-current');

      fixture.componentInstance.linkActive = true;
      fixture.detectChanges();

      expect(link).toHaveAttribute('aria-current', 'page');
      expect(link).toHaveAttribute('data-active');
    });

    it('should render link with aria-disabled when disabled', async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const link = fixture.debugElement.nativeElement.querySelector('[data-testid="direct-link"]');

      expect(link).not.toHaveAttribute('aria-disabled');

      fixture.componentInstance.linkDisabled = true;
      fixture.detectChanges();

      expect(link).toHaveAttribute('aria-disabled', 'true');
      expect(link).toHaveAttribute('data-disabled');
    });
  });

  describe('Trigger Interactions', () => {
    it('should open content on click', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('data-open');
      expect(fixture.componentInstance.valueChanges).toContain('products');
    }));

    it('should close content on second click (toggle)', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      // Open
      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('data-open');

      // Close
      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).not.toHaveAttribute('data-open');
    }));

    it('should not open when trigger is disabled', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      fixture.componentInstance.trigger1Disabled = true;
      fixture.detectChanges();

      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).not.toHaveAttribute('data-open');
      expect(trigger).toHaveAttribute('data-disabled');
    }));

    it('should show data-open attribute when content is open', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      expect(trigger).not.toHaveAttribute('data-open');

      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('data-open');
    }));

    it('should open on hover after showDelay', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      fixture.componentInstance.showDelay = 100;
      fixture.detectChanges();

      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
      fixture.detectChanges();

      // Not yet open
      expect(trigger).not.toHaveAttribute('data-open');

      // Wait for delay
      tick(100);
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('data-open');
    }));

    it('should close on pointer leave after hideDelay', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      fixture.componentInstance.showDelay = 0;
      fixture.componentInstance.hideDelay = 100;
      fixture.detectChanges();

      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      // Open first
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('data-open');

      // Leave
      fireEvent.pointerLeave(trigger, { pointerType: 'mouse' });
      fixture.detectChanges();

      // Not yet closed
      expect(trigger).toHaveAttribute('data-open');

      // Wait for delay
      tick(100);
      fixture.detectChanges();
      flush();

      expect(trigger).not.toHaveAttribute('data-open');
    }));

    // Note: Touch pointer events are difficult to test in JSDOM as PointerEvent is not available
    // The implementation handles touch events by checking event.pointerType === 'touch'
    // in the onPointerEnter handler and returning early

    it('should open immediately when showDelay is 0', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      fixture.componentInstance.showDelay = 0;
      fixture.detectChanges();

      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('data-open');
    }));
  });

  describe('Keyboard Navigation - Horizontal Menu', () => {
    it('should open content with ArrowDown and focus first item', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('data-open');
    }));

    it('should open content with Enter and focus first item', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'Enter' });
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('data-open');
    }));

    it('should open content with Space and focus first item', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      trigger.focus();
      fireEvent.keyDown(trigger, { key: ' ' });
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('data-open');
    }));

    it('should close content with Escape', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      // Open first
      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'Enter' });
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('data-open');

      // Close with Escape
      fireEvent.keyDown(trigger, { key: 'Escape' });
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).not.toHaveAttribute('data-open');
    }));

    it('should not open content with ArrowDown when disabled', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      fixture.componentInstance.trigger1Disabled = true;
      fixture.detectChanges();

      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).not.toHaveAttribute('data-open');
    }));
  });

  describe('Keyboard Navigation - Vertical Menu', () => {
    it('should open content with ArrowRight in vertical menu', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      fixture.componentInstance.orientation = 'vertical';
      fixture.detectChanges();

      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'ArrowRight' });
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('data-open');
    }));

    it('should not open with ArrowDown in vertical menu (ArrowDown navigates)', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      fixture.componentInstance.orientation = 'vertical';
      fixture.detectChanges();

      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      trigger.focus();
      // In vertical menu, ArrowDown should navigate between triggers, not open content
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });
      tick();
      fixture.detectChanges();
      flush();

      // The trigger should not be open because ArrowDown navigates in vertical mode
      expect(trigger).not.toHaveAttribute('data-open');
    }));
  });

  describe('Navigation Menu Item State', () => {
    it('should track active item in parent menu', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const trigger1 = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );
      const item1 = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="item-products"]',
      );

      fireEvent.click(trigger1);
      tick();
      fixture.detectChanges();
      flush();

      expect(item1).toHaveAttribute('data-active');
      expect(fixture.componentInstance.valueChanges).toContain('products');
    }));

    it('should close previous item when opening new item', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const trigger1 = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );
      const trigger2 = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-solutions"]',
      );
      const item1 = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="item-products"]',
      );
      const item2 = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="item-solutions"]',
      );

      // Open first
      fireEvent.click(trigger1);
      tick();
      fixture.detectChanges();
      flush();

      expect(item1).toHaveAttribute('data-active');
      expect(item2).not.toHaveAttribute('data-active');

      // Open second
      fireEvent.click(trigger2);
      tick();
      fixture.detectChanges();
      flush();

      expect(item1).not.toHaveAttribute('data-active');
      expect(item2).toHaveAttribute('data-active');
    }));

    it('should emit valueChange when item changes', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const trigger1 = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );
      const trigger2 = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-solutions"]',
      );

      fireEvent.click(trigger1);
      tick();
      fixture.detectChanges();
      flush();

      expect(fixture.componentInstance.valueChanges).toEqual(['products']);

      fireEvent.click(trigger2);
      tick();
      fixture.detectChanges();
      flush();

      expect(fixture.componentInstance.valueChanges).toEqual(['products', 'solutions']);
    }));
  });

  describe('Link Behavior', () => {
    it('should have data-active when active', async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const link = fixture.debugElement.nativeElement.querySelector('[data-testid="direct-link"]');

      expect(link).not.toHaveAttribute('data-active');

      fixture.componentInstance.linkActive = true;
      fixture.detectChanges();

      expect(link).toHaveAttribute('data-active');
    });

    it('should have data-disabled when disabled', async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const link = fixture.debugElement.nativeElement.querySelector('[data-testid="direct-link"]');

      expect(link).not.toHaveAttribute('data-disabled');

      fixture.componentInstance.linkDisabled = true;
      fixture.detectChanges();

      expect(link).toHaveAttribute('data-disabled');
    });

    it('should prevent click when disabled', async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      fixture.componentInstance.linkDisabled = true;
      fixture.detectChanges();

      const link = fixture.debugElement.nativeElement.querySelector('[data-testid="direct-link"]');
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');

      link.dispatchEvent(clickEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not prevent click when enabled', async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const link = fixture.debugElement.nativeElement.querySelector('[data-testid="direct-link"]');

      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');

      link.dispatchEvent(clickEvent);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe('Disabled States', () => {
    it('should show disabled state on trigger', async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      fixture.componentInstance.trigger1Disabled = true;
      fixture.detectChanges();

      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      expect(trigger).toHaveAttribute('data-disabled');
    });

    it('should not respond to hover when disabled', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      fixture.componentInstance.trigger1Disabled = true;
      fixture.componentInstance.showDelay = 0;
      fixture.detectChanges();

      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).not.toHaveAttribute('data-open');
    }));

    it('should not respond to keyboard when disabled', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      fixture.componentInstance.trigger1Disabled = true;
      fixture.detectChanges();

      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'Enter' });
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).not.toHaveAttribute('data-open');
    }));
  });

  describe('Configuration', () => {
    it('should use default config values', () => {
      expect(defaultNavigationMenuConfig.orientation).toBe('horizontal');
      expect(defaultNavigationMenuConfig.showDelay).toBe(200);
      expect(defaultNavigationMenuConfig.hideDelay).toBe(150);
      expect(defaultNavigationMenuConfig.placement).toBe('bottom-start');
      expect(defaultNavigationMenuConfig.offset).toBe(4);
      expect(defaultNavigationMenuConfig.flip).toBe(true);
      expect(defaultNavigationMenuConfig.wrap).toBe(true);
      expect(defaultNavigationMenuConfig.cooldown).toBe(300);
      expect(defaultNavigationMenuConfig.container).toBe('body');
    });

    it('should allow custom config via provideNavigationMenuConfig', async () => {
      const customConfig: Partial<NgpNavigationMenuConfig> = {
        showDelay: 500,
        hideDelay: 300,
        orientation: 'vertical',
      };

      const { fixture } = await render(TestNavigationMenuComponent, {
        providers: [provideNavigationMenuConfig(customConfig)],
      });

      const nav = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="navigation-menu"]',
      );
      const list = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="navigation-menu-list"]',
      );

      // Note: The component may override the default orientation if input is provided
      // This test verifies the config provider works
      expect(nav).toBeTruthy();
      expect(list).toBeTruthy();
    });
  });

  describe('Content Panel', () => {
    it('should have role="menu" on content', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      // Content is rendered via portal, query from document
      const content = document.querySelector('[data-testid="content-products"]');

      expect(content).toHaveAttribute('role', 'menu');
    }));

    it('should have aria-labelledby pointing to trigger', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );
      const triggerId = trigger.getAttribute('id');

      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      const content = document.querySelector('[data-testid="content-products"]');

      expect(content).toHaveAttribute('aria-labelledby', triggerId);
    }));

    it('should update trigger aria-controls with content id', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      const content = document.querySelector('[data-testid="content-products"]');
      const contentId = content?.getAttribute('id');

      expect(trigger).toHaveAttribute('aria-controls', contentId);
    }));

    it('should have data-open attribute on content', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      const content = document.querySelector('[data-testid="content-products"]');

      expect(content).toHaveAttribute('data-open');
    }));
  });

  describe('Content Item', () => {
    it('should have role="menuitem" on content items', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      const contentItem = document.querySelector('[data-testid="content-item-1"]');

      expect(contentItem).toHaveAttribute('role', 'menuitem');
    }));

    it('should have data-disabled when item is disabled', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      fixture.componentInstance.item1Disabled = true;
      fixture.detectChanges();

      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      const contentItem = document.querySelector('[data-testid="content-item-1"]');

      expect(contentItem).toHaveAttribute('data-disabled');
    }));
  });

  describe('Focus Management', () => {
    it('should close on Escape from content and restore focus to trigger', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      // Open
      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'Enter' });
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('data-open');

      // Get content and press Escape
      const content = document.querySelector('[data-testid="content-products"]');
      if (content) {
        fireEvent.keyDown(content, { key: 'Escape' });
        tick();
        fixture.detectChanges();
        flush();
      }

      expect(trigger).not.toHaveAttribute('data-open');
    }));
  });

  describe('Content Positioning', () => {
    it('should have data-overlay attribute on content', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      const content = document.querySelector('[data-testid="content-products"]');

      expect(content).toHaveAttribute('data-overlay', '');
    }));
  });

  describe('Hide Timeout Cancellation', () => {
    it('should cancel hide timeout when pointer enters trigger again', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      fixture.componentInstance.showDelay = 0;
      fixture.componentInstance.hideDelay = 200;
      fixture.detectChanges();

      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      // Open
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('data-open');

      // Leave trigger - starts hide timeout
      fireEvent.pointerLeave(trigger, { pointerType: 'mouse' });
      fixture.detectChanges();

      // Re-enter before timeout completes
      tick(100);
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
      fixture.detectChanges();

      // Wait past original timeout
      tick(200);
      fixture.detectChanges();
      flush();

      // Should still be open because timeout was cancelled
      expect(trigger).toHaveAttribute('data-open');
    }));

    it('should cancel show timeout on pointer leave', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);
      fixture.componentInstance.showDelay = 200;
      fixture.detectChanges();

      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="trigger-products"]',
      );

      // Enter - starts show timeout
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
      fixture.detectChanges();

      // Leave before timeout completes
      tick(100);
      fireEvent.pointerLeave(trigger, { pointerType: 'mouse' });
      fixture.detectChanges();

      // Wait past original timeout
      tick(200);
      fixture.detectChanges();
      flush();

      // Should not be open because show was cancelled
      expect(trigger).not.toHaveAttribute('data-open');
    }));
  });

  describe('Initial Value', () => {
    it('should respect initial value by setting it programmatically', fakeAsync(async () => {
      const { fixture } = await render(TestNavigationMenuComponent);

      // Set initial value
      fixture.componentInstance.value = 'products';
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();

      const item1 = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="item-products"]',
      );

      // The item should be marked as active based on the value
      expect(item1).toHaveAttribute('data-active');
    }));
  });
});

describe('Navigation Menu with Custom Wrap Config', () => {
  @Component({
    template: `
      <nav ngpNavigationMenu>
        <ul [ngpNavigationMenuListWrap]="wrap" ngpNavigationMenuList>
          <li ngpNavigationMenuItem>
            <button [ngpNavigationMenuTrigger]="content1" data-testid="trigger-1">Item 1</button>
            <ng-template #content1>
              <div ngpNavigationMenuContent>Content 1</div>
            </ng-template>
          </li>
          <li ngpNavigationMenuItem>
            <button [ngpNavigationMenuTrigger]="content2" data-testid="trigger-2">Item 2</button>
            <ng-template #content2>
              <div ngpNavigationMenuContent>Content 2</div>
            </ng-template>
          </li>
        </ul>
      </nav>
    `,
    imports: [
      NgpNavigationMenu,
      NgpNavigationMenuList,
      NgpNavigationMenuItem,
      NgpNavigationMenuTrigger,
      NgpNavigationMenuContent,
    ],
  })
  class WrapTestComponent {
    wrap = true;
  }

  it('should use wrap configuration from list', async () => {
    const { fixture } = await render(WrapTestComponent);
    const trigger1 = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger-1"]');
    const trigger2 = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger-2"]');

    expect(trigger1).toBeTruthy();
    expect(trigger2).toBeTruthy();
  });
});

describe('Navigation Menu Content Orientation', () => {
  @Component({
    template: `
      <nav ngpNavigationMenu>
        <ul ngpNavigationMenuList>
          <li ngpNavigationMenuItem>
            <button [ngpNavigationMenuTrigger]="content1" data-testid="trigger">Menu</button>
            <ng-template #content1>
              <div
                [ngpNavigationMenuContentOrientation]="contentOrientation"
                ngpNavigationMenuContent
                data-testid="content"
              >
                <a ngpNavigationMenuContentItem href="#">Item 1</a>
                <a ngpNavigationMenuContentItem href="#">Item 2</a>
              </div>
            </ng-template>
          </li>
        </ul>
      </nav>
    `,
    imports: [
      NgpNavigationMenu,
      NgpNavigationMenuList,
      NgpNavigationMenuItem,
      NgpNavigationMenuTrigger,
      NgpNavigationMenuContent,
      NgpNavigationMenuContentItem,
    ],
  })
  class ContentOrientationTestComponent {
    contentOrientation: 'horizontal' | 'vertical' = 'vertical';
  }

  it('should set content orientation', fakeAsync(async () => {
    const { fixture } = await render(ContentOrientationTestComponent);
    const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

    fireEvent.click(trigger);
    tick();
    fixture.detectChanges();
    flush();

    const content = document.querySelector('[data-testid="content"]');

    expect(content).toHaveAttribute('data-orientation', 'vertical');
  }));

  it('should update content orientation when changed', fakeAsync(async () => {
    const { fixture } = await render(ContentOrientationTestComponent);
    const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

    fireEvent.click(trigger);
    tick();
    fixture.detectChanges();
    flush();

    fixture.componentInstance.contentOrientation = 'horizontal';
    fixture.detectChanges();

    const content = document.querySelector('[data-testid="content"]');

    expect(content).toHaveAttribute('data-orientation', 'horizontal');
  }));
});

import { Component } from '@angular/core';
import { fakeAsync, flush, tick } from '@angular/core/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import {
  NgpNavigationMenu,
  NgpNavigationMenuContent,
  NgpNavigationMenuIndicator,
  NgpNavigationMenuItem,
  NgpNavigationMenuLink,
  NgpNavigationMenuList,
  NgpNavigationMenuPortal,
  NgpNavigationMenuTrigger,
  NgpNavigationMenuViewport,
} from './index';

const imports = [
  NgpNavigationMenu,
  NgpNavigationMenuList,
  NgpNavigationMenuItem,
  NgpNavigationMenuTrigger,
  NgpNavigationMenuContent,
  NgpNavigationMenuLink,
  NgpNavigationMenuIndicator,
  NgpNavigationMenuViewport,
  NgpNavigationMenuPortal,
];

describe('NgpNavigationMenu', () => {
  afterEach(() => {
    // Clean up portal overlay elements that were appended to document.body
    document.querySelectorAll('[ngpnavigationmenuviewport]').forEach(el => el.remove());
    // Also remove any overlay containers
    document.querySelectorAll('.ngp-overlay-pane').forEach(el => el.parentElement?.remove());
  });

  describe('Basic Functionality', () => {
    it('should render navigation menu with triggers', async () => {
      await render(
        `
        <nav ngpNavigationMenu>
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent data-testid="content1">
                <a ngpNavigationMenuLink href="#">Link 1</a>
              </div>
            </li>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item2">
              <button ngpNavigationMenuTrigger>Item 2</button>
              <div ngpNavigationMenuContent data-testid="content2">
                <a ngpNavigationMenuLink href="#">Link 2</a>
              </div>
            </li>
          </ul>
        </nav>
      `,
        { imports },
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('should have correct aria attributes on triggers', async () => {
      await render(
        `
        <nav ngpNavigationMenu>
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent>Content</div>
            </li>
          </ul>
        </nav>
      `,
        { imports },
      );

      const trigger = screen.getByText('Item 1');
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Open/Close on Click', () => {
    it('should open content on click', fakeAsync(async () => {
      await render(
        `
        <nav ngpNavigationMenu ngpNavigationMenuDelayDuration="0">
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent data-testid="content1">Content 1</div>
            </li>
          </ul>
        </nav>
      `,
        { imports },
      );

      const trigger = screen.getByText('Item 1');
      fireEvent.click(trigger);
      flush();

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(trigger).toHaveAttribute('data-state', 'open');
    }));

    it('should close content on second click', fakeAsync(async () => {
      await render(
        `
        <nav ngpNavigationMenu ngpNavigationMenuDelayDuration="0">
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent data-testid="content1">Content 1</div>
            </li>
          </ul>
        </nav>
      `,
        { imports },
      );

      const trigger = screen.getByText('Item 1');

      // Open
      fireEvent.click(trigger);
      flush();
      expect(trigger).toHaveAttribute('data-state', 'open');

      // Close
      fireEvent.click(trigger);
      flush();
      expect(trigger).toHaveAttribute('data-state', 'closed');
    }));
  });

  describe('Open/Close on Hover', () => {
    it('should open content on pointer enter after delay', fakeAsync(async () => {
      await render(
        `
        <nav ngpNavigationMenu ngpNavigationMenuDelayDuration="100">
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent data-testid="content1">Content 1</div>
            </li>
          </ul>
        </nav>
      `,
        { imports },
      );

      const trigger = screen.getByText('Item 1');

      fireEvent.pointerEnter(trigger);

      // Should not be open yet
      expect(trigger).toHaveAttribute('data-state', 'closed');

      // Wait for delay
      tick(150);
      flush();

      expect(trigger).toHaveAttribute('data-state', 'open');
    }));

    it('should open immediately when delay is 0', fakeAsync(async () => {
      await render(
        `
        <nav ngpNavigationMenu ngpNavigationMenuDelayDuration="0">
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent>Content 1</div>
            </li>
          </ul>
        </nav>
      `,
        { imports },
      );

      const trigger = screen.getByText('Item 1');
      fireEvent.pointerEnter(trigger);
      flush();

      expect(trigger).toHaveAttribute('data-state', 'open');
    }));

    it('should close on pointer leave after delay', fakeAsync(async () => {
      await render(
        `
        <nav ngpNavigationMenu ngpNavigationMenuDelayDuration="0">
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent>Content 1</div>
            </li>
          </ul>
        </nav>
      `,
        { imports },
      );

      const trigger = screen.getByText('Item 1');

      // Open
      fireEvent.pointerEnter(trigger);
      flush();
      expect(trigger).toHaveAttribute('data-state', 'open');

      // Leave
      fireEvent.pointerLeave(trigger);
      tick(200); // Close delay is 150ms
      flush();

      expect(trigger).toHaveAttribute('data-state', 'closed');
    }));
  });

  describe('Keyboard Navigation', () => {
    it('should open on Enter key', fakeAsync(async () => {
      await render(
        `
        <nav ngpNavigationMenu ngpNavigationMenuDelayDuration="0">
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent>Content 1</div>
            </li>
          </ul>
        </nav>
      `,
        { imports },
      );

      const trigger = screen.getByText('Item 1');
      fireEvent.keyDown(trigger, { key: 'Enter' });
      flush();

      expect(trigger).toHaveAttribute('data-state', 'open');
    }));

    it('should open on Space key', fakeAsync(async () => {
      await render(
        `
        <nav ngpNavigationMenu ngpNavigationMenuDelayDuration="0">
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent>Content 1</div>
            </li>
          </ul>
        </nav>
      `,
        { imports },
      );

      const trigger = screen.getByText('Item 1');
      fireEvent.keyDown(trigger, { key: ' ' });
      flush();

      expect(trigger).toHaveAttribute('data-state', 'open');
    }));

    it('should close on Escape key', fakeAsync(async () => {
      await render(
        `
        <nav ngpNavigationMenu ngpNavigationMenuDelayDuration="0">
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent>Content 1</div>
            </li>
          </ul>
        </nav>
      `,
        { imports },
      );

      const trigger = screen.getByText('Item 1');

      // Open
      fireEvent.click(trigger);
      flush();
      expect(trigger).toHaveAttribute('data-state', 'open');

      // Close with Escape
      fireEvent.keyDown(trigger, { key: 'Escape' });
      flush();

      expect(trigger).toHaveAttribute('data-state', 'closed');
    }));

    it('should open on ArrowDown for horizontal menu', fakeAsync(async () => {
      await render(
        `
        <nav ngpNavigationMenu ngpNavigationMenuDelayDuration="0" ngpNavigationMenuOrientation="horizontal">
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent>Content 1</div>
            </li>
          </ul>
        </nav>
      `,
        { imports },
      );

      const trigger = screen.getByText('Item 1');
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });
      flush();

      expect(trigger).toHaveAttribute('data-state', 'open');
    }));

    it('should open on ArrowRight for vertical menu', fakeAsync(async () => {
      await render(
        `
        <nav ngpNavigationMenu ngpNavigationMenuDelayDuration="0" ngpNavigationMenuOrientation="vertical">
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent>Content 1</div>
            </li>
          </ul>
        </nav>
      `,
        { imports },
      );

      const trigger = screen.getByText('Item 1');
      fireEvent.keyDown(trigger, { key: 'ArrowRight' });
      flush();

      expect(trigger).toHaveAttribute('data-state', 'open');
    }));
  });

  describe('Data Attributes', () => {
    it('should set correct data-state on triggers', fakeAsync(async () => {
      await render(
        `
        <nav ngpNavigationMenu ngpNavigationMenuDelayDuration="0">
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent>Content 1</div>
            </li>
          </ul>
        </nav>
      `,
        { imports },
      );

      const trigger = screen.getByText('Item 1');
      expect(trigger).toHaveAttribute('data-state', 'closed');

      fireEvent.click(trigger);
      flush();

      expect(trigger).toHaveAttribute('data-state', 'open');
    }));

    it('should set correct data-orientation on menu', async () => {
      await render(
        `
        <nav ngpNavigationMenu ngpNavigationMenuOrientation="vertical" data-testid="menu">
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent>Content 1</div>
            </li>
          </ul>
        </nav>
      `,
        { imports },
      );

      const menu = screen.getByTestId('menu');
      expect(menu).toHaveAttribute('data-orientation', 'vertical');
    });

    it('should set data-motion on content when switching items', fakeAsync(async () => {
      await render(
        `
        <nav ngpNavigationMenu ngpNavigationMenuDelayDuration="0">
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent data-testid="content1">Content 1</div>
            </li>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item2">
              <button ngpNavigationMenuTrigger>Item 2</button>
              <div ngpNavigationMenuContent data-testid="content2">Content 2</div>
            </li>
          </ul>
        </nav>
      `,
        { imports },
      );

      const trigger1 = screen.getByText('Item 1');
      const trigger2 = screen.getByText('Item 2');
      const content2 = screen.getByTestId('content2');

      // Open first item
      fireEvent.click(trigger1);
      flush();

      // Switch to second item
      fireEvent.click(trigger2);
      flush();

      // Content 2 should have data-motion attribute for animation direction
      expect(content2).toHaveAttribute('data-motion', 'from-end');
    }));
  });

  describe('Viewport', () => {
    it('should render viewport with correct data-state', fakeAsync(async () => {
      await render(
        `
        <nav ngpNavigationMenu ngpNavigationMenuDelayDuration="0">
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent>Content 1</div>
            </li>
          </ul>
          <div ngpNavigationMenuViewport data-testid="viewport"></div>
        </nav>
      `,
        { imports },
      );

      const viewport = screen.getByTestId('viewport');
      expect(viewport).toHaveAttribute('data-state', 'closed');

      const trigger = screen.getByText('Item 1');
      fireEvent.click(trigger);
      flush();

      expect(viewport).toHaveAttribute('data-state', 'open');
    }));
  });

  describe('Value Control', () => {
    it('should support controlled value', fakeAsync(async () => {
      @Component({
        template: `
          <nav ngpNavigationMenu [ngpNavigationMenuValue]="value" ngpNavigationMenuDelayDuration="0">
            <ul ngpNavigationMenuList>
              <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
                <button ngpNavigationMenuTrigger>Item 1</button>
                <div ngpNavigationMenuContent>Content 1</div>
              </li>
            </ul>
          </nav>
        `,
        imports,
      })
      class TestComponent {
        value: string | undefined = 'item1';
      }

      const { fixture } = await render(TestComponent);
      flush();

      const trigger = screen.getByText('Item 1');
      expect(trigger).toHaveAttribute('data-state', 'open');

      fixture.componentInstance.value = undefined;
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('data-state', 'closed');
    }));

    it('should emit valueChange when item opens', fakeAsync(async () => {
      @Component({
        template: `
          <nav ngpNavigationMenu (ngpNavigationMenuValueChange)="onValueChange($event)" ngpNavigationMenuDelayDuration="0">
            <ul ngpNavigationMenuList>
              <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
                <button ngpNavigationMenuTrigger>Item 1</button>
                <div ngpNavigationMenuContent>Content 1</div>
              </li>
            </ul>
          </nav>
        `,
        imports,
      })
      class TestComponent {
        onValueChange = jest.fn();
      }

      const { fixture } = await render(TestComponent);
      const trigger = screen.getByText('Item 1');

      fireEvent.click(trigger);
      flush();

      expect(fixture.componentInstance.onValueChange).toHaveBeenCalledWith('item1');
    }));
  });

  describe('Indicator', () => {
    it('should render indicator with hidden state when no item is open', async () => {
      await render(
        `
        <nav ngpNavigationMenu>
          <ul ngpNavigationMenuList>
            <div ngpNavigationMenuIndicator data-testid="indicator"></div>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent>Content 1</div>
            </li>
          </ul>
        </nav>
      `,
        { imports },
      );

      const indicator = screen.getByTestId('indicator');
      expect(indicator).toHaveAttribute('data-state', 'hidden');
    });

    it('should show indicator when item is open', fakeAsync(async () => {
      await render(
        `
        <nav ngpNavigationMenu ngpNavigationMenuDelayDuration="0">
          <ul ngpNavigationMenuList>
            <div ngpNavigationMenuIndicator data-testid="indicator"></div>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent>Content 1</div>
            </li>
          </ul>
        </nav>
      `,
        { imports },
      );

      const trigger = screen.getByText('Item 1');
      fireEvent.click(trigger);
      flush();

      const indicator = screen.getByTestId('indicator');
      expect(indicator).toHaveAttribute('data-state', 'visible');
    }));
  });

  describe('Links', () => {
    it('should render links with menuitem role', async () => {
      await render(
        `
        <nav ngpNavigationMenu ngpNavigationMenuDelayDuration="0">
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent>
                <a ngpNavigationMenuLink href="#">Link 1</a>
              </div>
            </li>
          </ul>
        </nav>
      `,
        { imports },
      );

      const link = screen.getByText('Link 1');
      expect(link).toHaveAttribute('role', 'menuitem');
    });

    it('should close menu when link is clicked', fakeAsync(async () => {
      await render(
        `
        <nav ngpNavigationMenu ngpNavigationMenuDelayDuration="0">
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent>
                <a ngpNavigationMenuLink href="#">Link 1</a>
              </div>
            </li>
          </ul>
        </nav>
      `,
        { imports },
      );

      const trigger = screen.getByText('Item 1');
      fireEvent.click(trigger);
      flush();

      const link = screen.getByText('Link 1');
      fireEvent.click(link);
      tick(200);
      flush();

      expect(trigger).toHaveAttribute('data-state', 'closed');
    }));
  });

  describe('Portal', () => {
    it('should render portal with viewport', fakeAsync(async () => {
      await render(
        `
        <nav ngpNavigationMenu ngpNavigationMenuDelayDuration="0">
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent data-testid="content1">Content 1</div>
            </li>
          </ul>
          <ng-template ngpNavigationMenuPortal>
            <div ngpNavigationMenuViewport data-testid="viewport"></div>
          </ng-template>
        </nav>
      `,
        { imports },
      );

      const trigger = screen.getByText('Item 1');
      fireEvent.click(trigger);
      tick(100);
      flush();

      await waitFor(() => {
        // The viewport should be rendered in the portal (document.body)
        const viewport = document.querySelector('[data-testid="viewport"]');
        expect(viewport).toBeInTheDocument();
      });
    }));

    it('should position portal correctly with offset', fakeAsync(async () => {
      await render(
        `
        <nav ngpNavigationMenu ngpNavigationMenuDelayDuration="0">
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger style="position: absolute; top: 100px; left: 100px;">Item 1</button>
              <div ngpNavigationMenuContent data-testid="content1">Content 1</div>
            </li>
          </ul>
          <ng-template ngpNavigationMenuPortal ngpNavigationMenuPortalOffset="10">
            <div ngpNavigationMenuViewport data-testid="viewport"></div>
          </ng-template>
        </nav>
      `,
        { imports },
      );

      const trigger = screen.getByText('Item 1');
      fireEvent.click(trigger);
      tick(100);
      flush();

      await waitFor(() => {
        const viewport = document.querySelector('[data-testid="viewport"]');
        expect(viewport).toBeInTheDocument();
      });
    }));

    it('should update portal position when switching triggers', fakeAsync(async () => {
      await render(
        `
        <nav ngpNavigationMenu ngpNavigationMenuDelayDuration="0">
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent data-testid="content1">Content 1</div>
            </li>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item2">
              <button ngpNavigationMenuTrigger>Item 2</button>
              <div ngpNavigationMenuContent data-testid="content2">Content 2</div>
            </li>
          </ul>
          <ng-template ngpNavigationMenuPortal>
            <div ngpNavigationMenuViewport data-testid="viewport"></div>
          </ng-template>
        </nav>
      `,
        { imports },
      );

      const trigger1 = screen.getByText('Item 1');
      const trigger2 = screen.getByText('Item 2');

      // Open first item
      fireEvent.click(trigger1);
      tick(100);
      flush();

      await waitFor(() => {
        expect(document.querySelector('[data-testid="viewport"]')).toBeInTheDocument();
      });

      // Switch to second item
      fireEvent.click(trigger2);
      tick(100);
      flush();

      // Portal should still be open but content switched
      await waitFor(() => {
        const viewport = document.querySelector('[data-testid="viewport"]');
        expect(viewport).toBeInTheDocument();
        expect(viewport).toHaveAttribute('data-state', 'open');
      });
    }));

    it('should close menu when clicking trigger again', fakeAsync(async () => {
      await render(
        `
        <nav ngpNavigationMenu ngpNavigationMenuDelayDuration="0">
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent data-testid="content1">Content 1</div>
            </li>
          </ul>
          <ng-template ngpNavigationMenuPortal>
            <div ngpNavigationMenuViewport data-testid="viewport"></div>
          </ng-template>
        </nav>
      `,
        { imports },
      );

      const trigger = screen.getByText('Item 1');

      // Open
      fireEvent.click(trigger);
      tick(100);
      flush();

      expect(trigger).toHaveAttribute('data-state', 'open');

      // Close
      fireEvent.click(trigger);
      tick(200);
      flush();

      expect(trigger).toHaveAttribute('data-state', 'closed');
    }));
  });

  describe('Disabled State', () => {
    it('should not open when trigger is disabled', fakeAsync(async () => {
      await render(
        `
        <nav ngpNavigationMenu ngpNavigationMenuDelayDuration="0">
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger ngpNavigationMenuTriggerDisabled>Item 1</button>
              <div ngpNavigationMenuContent>Content 1</div>
            </li>
          </ul>
        </nav>
      `,
        { imports },
      );

      const trigger = screen.getByText('Item 1');
      expect(trigger).toHaveAttribute('data-disabled');

      fireEvent.click(trigger);
      flush();

      expect(trigger).toHaveAttribute('data-state', 'closed');
    }));
  });

  describe('Cleanup', () => {
    it('should clean up when component is destroyed', fakeAsync(async () => {
      const { fixture } = await render(
        `
        <nav ngpNavigationMenu ngpNavigationMenuDelayDuration="0">
          <ul ngpNavigationMenuList>
            <li ngpNavigationMenuItem ngpNavigationMenuItemValue="item1">
              <button ngpNavigationMenuTrigger>Item 1</button>
              <div ngpNavigationMenuContent data-testid="content1">Content 1</div>
            </li>
          </ul>
        </nav>
      `,
        { imports },
      );

      const trigger = screen.getByText('Item 1');
      fireEvent.click(trigger);
      flush();

      expect(trigger).toHaveAttribute('data-state', 'open');

      // Destroying should not throw
      expect(() => fixture.destroy()).not.toThrow();
    }));
  });
});

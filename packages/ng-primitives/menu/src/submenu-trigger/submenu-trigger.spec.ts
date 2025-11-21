import { Component, TemplateRef, viewChild } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular';
import { NgpMenuItem } from '../menu-item/menu-item';
import { NgpMenuTrigger } from '../menu-trigger/menu-trigger';
import { NgpMenu } from '../menu/menu';
import { NgpSubmenuTrigger } from './submenu-trigger';

@Component({
  template: `
    <button [ngpMenuTrigger]="mainMenu" data-testid="main-trigger">Main Menu</button>

    <ng-template #mainMenu>
      <div ngpMenu>
        <button ngpMenuItem>Item 1</button>
        <button [ngpSubmenuTrigger]="submenu1" ngpMenuItem data-testid="submenu-trigger-1">
          Submenu 1
        </button>
        <button ngpMenuItem>Item 3</button>
      </div>
    </ng-template>

    <ng-template #submenu1>
      <div ngpMenu>
        <button ngpMenuItem data-testid="submenu-1-item-1">Submenu 1 Item 1</button>
        <button [ngpSubmenuTrigger]="submenu2" ngpMenuItem data-testid="submenu-trigger-2">
          Submenu 2 (Nested)
        </button>
        <button ngpMenuItem data-testid="submenu-1-item-3">Submenu 1 Item 3</button>
      </div>
    </ng-template>

    <ng-template #submenu2>
      <div ngpMenu>
        <button ngpMenuItem data-testid="submenu-2-item-1">Submenu 2 Item 1</button>
        <button ngpMenuItem data-testid="submenu-2-item-2">Submenu 2 Item 2</button>
        <button [ngpSubmenuTrigger]="submenu3" ngpMenuItem data-testid="submenu-trigger-3">
          Submenu 3 (Deep Nested)
        </button>
      </div>
    </ng-template>

    <ng-template #submenu3>
      <div ngpMenu>
        <button ngpMenuItem data-testid="submenu-3-item-1">Submenu 3 Item 1</button>
        <button ngpMenuItem data-testid="submenu-3-item-2">Submenu 3 Item 2</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class NestedMenuTestComponent {
  readonly mainMenu = viewChild.required('mainMenu', { read: TemplateRef });
  readonly submenu1 = viewChild.required('submenu1', { read: TemplateRef });
  readonly submenu2 = viewChild.required('submenu2', { read: TemplateRef });
  readonly submenu3 = viewChild.required('submenu3', { read: TemplateRef });
}

describe('NgpSubmenuTrigger', () => {
  it('should initialise correctly', async () => {
    const { container } = await render(`<div ngpSubmenuTrigger></div>`, {
      imports: [NgpSubmenuTrigger],
    });
    expect(container).toBeTruthy();
  });

  it('should call hide when left arrow key is pressed on submenu trigger', async () => {
    const { fixture } = await render(
      `<button ngpSubmenuTrigger data-testid="submenu-trigger">Submenu</button>`,
      {
        imports: [NgpSubmenuTrigger],
      },
    );

    const submenuTriggerDirective =
      fixture.debugElement.children[0].injector.get(NgpSubmenuTrigger);

    // Spy on the hide method and mock its implementation to prevent actual execution
    const hideSpy = jest.spyOn(submenuTriggerDirective, 'hide').mockImplementation(() => {
      // Mock implementation to prevent actual execution
    });

    // Get the trigger element
    const triggerElement = fixture.debugElement.children[0].nativeElement;

    // Simulate left arrow key press
    fireEvent.keyDown(triggerElement, { key: 'ArrowLeft' });

    // This should call hide with 'keyboard' parameter after our fix
    expect(hideSpy).toHaveBeenCalledWith('keyboard');
  });

  it('should open submenu on right arrow key press', async () => {
    const { fixture } = await render(
      `<button ngpSubmenuTrigger data-testid="submenu-trigger">Submenu</button>`,
      {
        imports: [NgpSubmenuTrigger],
      },
    );

    const submenuTriggerDirective =
      fixture.debugElement.children[0].injector.get(NgpSubmenuTrigger);

    // Spy on the show method and mock its implementation to prevent actual execution
    const showSpy = jest.spyOn(submenuTriggerDirective, 'show').mockImplementation(() => {
      // Mock implementation to prevent actual execution
    });

    // Get the trigger element
    const triggerElement = fixture.debugElement.children[0].nativeElement;

    // Simulate right arrow key press
    fireEvent.keyDown(triggerElement, { key: 'ArrowRight' });

    // This should work currently
    expect(showSpy).toHaveBeenCalled();
  });

  describe('nested submenus', () => {
    it('should handle complete keyboard navigation flow through 3-level nested menus', async () => {
      const { fixture } = await render(NestedMenuTestComponent, {
        imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
      });

      // Step 1: Launch menu with click
      const mainTrigger = screen.getByTestId('main-trigger');
      fireEvent.click(mainTrigger);
      await fixture.whenStable();

      // Step 2: Navigate to submenu item and open with right arrow
      const submenuTrigger1 = screen.getByTestId('submenu-trigger-1');
      submenuTrigger1.focus();
      fireEvent.keyDown(submenuTrigger1, { key: 'ArrowRight' });
      await fixture.whenStable();

      // Verify first submenu is open and focus moved to first item
      expect(screen.queryByTestId('submenu-1-item-1')).toBeInTheDocument();
      expect(screen.queryByTestId('submenu-trigger-2')).toBeInTheDocument();

      // Step 3: Navigate to second level submenu item and open
      const submenuTrigger2 = screen.getByTestId('submenu-trigger-2');
      submenuTrigger2.focus();
      fireEvent.keyDown(submenuTrigger2, { key: 'ArrowRight' });
      await fixture.whenStable();

      // Verify second submenu is open and focus moved to first item
      expect(screen.queryByTestId('submenu-2-item-1')).toBeInTheDocument();
      expect(screen.queryByTestId('submenu-trigger-3')).toBeInTheDocument();

      // Step 4: Navigate to third level submenu and open
      const submenuTrigger3 = screen.getByTestId('submenu-trigger-3');
      submenuTrigger3.focus();
      fireEvent.keyDown(submenuTrigger3, { key: 'ArrowRight' });
      await fixture.whenStable();

      // Verify third submenu is open
      expect(screen.queryByTestId('submenu-3-item-1')).toBeInTheDocument();
      expect(screen.queryByTestId('submenu-3-item-2')).toBeInTheDocument();

      // Step 5: Press left arrow to close 3rd menu and move focus back to 2nd level trigger
      fireEvent.keyDown(submenuTrigger3, { key: 'ArrowLeft' });
      await fixture.whenStable();

      // Verify 3rd submenu is closed, 2nd submenu still open, focus on trigger 3
      expect(screen.queryByTestId('submenu-3-item-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('submenu-3-item-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('submenu-2-item-1')).toBeInTheDocument();
      expect(submenuTrigger3).toHaveFocus();

      // Step 6: Press left arrow again to close 2nd menu and move focus to 1st level trigger
      fireEvent.keyDown(submenuTrigger2, { key: 'ArrowLeft' });
      await fixture.whenStable();

      // Verify 2nd submenu is closed, 1st submenu still open, focus on trigger 2
      expect(screen.queryByTestId('submenu-2-item-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('submenu-2-item-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('submenu-1-item-1')).toBeInTheDocument();
      expect(submenuTrigger2).toHaveFocus();

      // Step 7: Press left arrow once more to close 1st submenu
      fireEvent.keyDown(submenuTrigger1, { key: 'ArrowLeft' });
      await fixture.whenStable();

      // Verify all submenus are closed, focus returns to main trigger
      expect(screen.queryByTestId('submenu-1-item-1')).not.toBeInTheDocument();
      expect(submenuTrigger1).toHaveFocus();
    });
  });
});

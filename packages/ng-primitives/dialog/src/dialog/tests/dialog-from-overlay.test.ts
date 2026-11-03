import {
  ApplicationRef,
  Component,
  ComponentRef,
  TemplateRef,
  Type,
  ViewContainerRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import {
  NgpDialog,
  NgpDialogManager,
  NgpDialogOverlay,
  NgpDialogTrigger,
} from 'ng-primitives/dialog';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger, NgpSubmenuTrigger } from 'ng-primitives/menu';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * `NgpDialogManager.open()` renders into the root component's view container. Without one,
 * as in a bare TestBed, it falls back to the trigger's and the dialog dies with the trigger.
 */
@Component({ selector: 'test-app-root', template: '' })
class TestAppRoot {}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="menu-trigger">Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button [ngpDialogTrigger]="dialog" ngpMenuItem data-testid="item">Delete...</button>
        <button
          [ngpDialogTrigger]="dialog"
          [ngpMenuItemCloseOnSelect]="false"
          ngpMenuItem
          data-testid="kept-item"
        >
          Rename...
        </button>
        <button [ngpSubmenuTrigger]="submenu" ngpMenuItem data-testid="submenu-trigger">
          More
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu">
        <button [ngpDialogTrigger]="dialog" ngpMenuItem data-testid="submenu-item">
          Archive...
        </button>
      </div>
    </ng-template>

    <ng-template #dialog let-close="close">
      <div ngpDialogOverlay>
        <div ngpDialog data-testid="dialog">
          <button (click)="close()" data-testid="close">Close</button>
        </div>
      </div>
    </ng-template>
  `,
  imports: [
    NgpDialogTrigger,
    NgpDialog,
    NgpDialogOverlay,
    NgpMenuTrigger,
    NgpMenu,
    NgpMenuItem,
    NgpSubmenuTrigger,
  ],
})
class MenuDialogHost {}

@Component({
  template: `
    <button [ngpPopoverTrigger]="popover" data-testid="popover-trigger">Popover</button>

    <ng-template #popover>
      <div ngpPopover data-testid="popover">
        <button [ngpDialogTrigger]="dialog" data-testid="item">Open</button>
      </div>
    </ng-template>

    <ng-template #dialog let-close="close">
      <div ngpDialogOverlay>
        <div ngpDialog data-testid="dialog">
          <button (click)="close()" data-testid="close">Close</button>
        </div>
      </div>
    </ng-template>
  `,
  imports: [NgpDialogTrigger, NgpDialog, NgpDialogOverlay, NgpPopoverTrigger, NgpPopover],
})
class PopoverDialogHost {}

@Component({
  template: `
    <button [ngpDialogTrigger]="outer" data-testid="outer-trigger">Open</button>

    <ng-template #outer>
      <div ngpDialogOverlay>
        <div ngpDialog data-testid="outer">
          @if (show()) {
            <button [ngpPopoverTrigger]="popover" data-testid="popover-trigger">Popover</button>
          }
        </div>
      </div>
    </ng-template>

    <ng-template #popover>
      <div ngpPopover data-testid="popover">
        <button [ngpDialogTrigger]="inner" data-testid="item">Open nested</button>
      </div>
    </ng-template>

    <ng-template #inner let-close="close">
      <div ngpDialogOverlay>
        <div ngpDialog data-testid="dialog">
          <button (click)="close()" data-testid="close">Close</button>
        </div>
      </div>
    </ng-template>
  `,
  imports: [NgpDialogTrigger, NgpDialog, NgpDialogOverlay, NgpPopoverTrigger, NgpPopover],
})
class PopoverInDialogHost {
  readonly show = signal(true);
}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="menu-trigger">Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button (click)="openDialog()" ngpMenuItem data-testid="item">Delete...</button>
      </div>
    </ng-template>

    <ng-template #dialog let-close="close">
      <div ngpDialogOverlay>
        <div ngpDialog data-testid="dialog">
          <button (click)="close()" data-testid="close">Close</button>
        </div>
      </div>
    </ng-template>
  `,
  imports: [NgpDialog, NgpDialogOverlay, NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class MenuManagerDialogHost {
  private readonly dialogManager = inject(NgpDialogManager);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly dialog = viewChild.required<TemplateRef<unknown>>('dialog');

  openDialog(): void {
    this.dialogManager.open(this.dialog(), { viewContainerRef: this.viewContainerRef });
  }
}

describe('NgpDialog opened from a menu or popover', () => {
  let root: ComponentRef<TestAppRoot> | undefined;

  afterEach(async () => {
    TestBed.inject(NgpDialogManager).closeAll();
    await waitFor(() => expect(document.querySelector('[ngpDialogOverlay]')).toBeNull());
    root?.location.nativeElement.remove();
    root?.destroy();
    root = undefined;
  });

  /** Renders the host, then bootstraps a root component as a real app has. */
  async function renderInApp<T>(host: Type<T>) {
    const result = await render(host);
    const rootElement = document.createElement('test-app-root');
    document.body.appendChild(rootElement);
    root = TestBed.inject(ApplicationRef).bootstrap(TestAppRoot, rootElement);
    return result;
  }

  /** Activates an element with the keyboard: a click with `detail: 0`. */
  function press(element: HTMLElement): void {
    element.focus();
    fireEvent.click(element, { detail: 0 });
  }

  async function closeDialog(): Promise<void> {
    press(screen.getByTestId('close'));
    await waitFor(() => expect(screen.queryByTestId('dialog')).toBeNull());
  }

  it('should keep focus in a dialog opened from a menu item as the menu closes', async () => {
    await renderInApp(MenuDialogHost);
    press(screen.getByTestId('menu-trigger'));
    press(await screen.findByTestId('item'));

    const dialog = await screen.findByTestId('dialog');
    await waitFor(() => expect(screen.queryByTestId('menu')).toBeNull());

    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('should keep the page scroll blocked after the menu closes', async () => {
    const html = document.documentElement;
    // the page must be taller than the viewport for scroll blocking to apply
    document.body.style.height = '200vh';

    try {
      await renderInApp(MenuDialogHost);
      press(screen.getByTestId('menu-trigger'));
      press(await screen.findByTestId('item'));
      await screen.findByTestId('dialog');
      await waitFor(() => expect(screen.queryByTestId('menu')).toBeNull());

      expect(html.hasAttribute('data-scrollblock')).toBe(true);

      await closeDialog();

      expect(html.hasAttribute('data-scrollblock')).toBe(false);
    } finally {
      document.body.style.height = '';
    }
  });

  it('should focus the menu trigger when a dialog opened from a menu item closes', async () => {
    await renderInApp(MenuDialogHost);
    press(screen.getByTestId('menu-trigger'));
    press(await screen.findByTestId('item'));
    await screen.findByTestId('dialog');
    await waitFor(() => expect(screen.queryByTestId('menu')).toBeNull());

    await closeDialog();

    await waitFor(() => expect(screen.getByTestId('menu-trigger')).toHaveFocus());
  });

  it('should focus the menu trigger when a dialog opened with open() from a menu item closes', async () => {
    await renderInApp(MenuManagerDialogHost);
    press(screen.getByTestId('menu-trigger'));
    press(await screen.findByTestId('item'));
    await screen.findByTestId('dialog');
    await waitFor(() => expect(screen.queryByTestId('menu')).toBeNull());

    await closeDialog();

    await waitFor(() => expect(screen.getByTestId('menu-trigger')).toHaveFocus());
  });

  it('should focus the item that opened the dialog while its menu is still open', async () => {
    await renderInApp(MenuDialogHost);
    press(screen.getByTestId('menu-trigger'));
    press(await screen.findByTestId('kept-item'));
    await screen.findByTestId('dialog');

    // the menu's focus trap would pull focus back, so watch for the trigger taking it at all
    let menuTriggerFocused = false;
    screen.getByTestId('menu-trigger').addEventListener('focus', () => (menuTriggerFocused = true));

    await closeDialog();

    await waitFor(() => expect(screen.getByTestId('kept-item')).toHaveFocus());
    expect(menuTriggerFocused).toBe(false);
  });

  it('should focus the root menu trigger when a dialog opened from a submenu item closes', async () => {
    await renderInApp(MenuDialogHost);
    press(screen.getByTestId('menu-trigger'));
    press(await screen.findByTestId('submenu-trigger'));
    press(await screen.findByTestId('submenu-item'));
    await screen.findByTestId('dialog');
    await waitFor(() => expect(screen.queryByTestId('menu')).toBeNull());

    await closeDialog();

    await waitFor(() => expect(screen.getByTestId('menu-trigger')).toHaveFocus());
  });

  it('should focus the popover trigger when the popover closed before the dialog', async () => {
    await renderInApp(PopoverDialogHost);
    press(screen.getByTestId('popover-trigger'));
    press(await screen.findByTestId('item'));
    await screen.findByTestId('dialog');

    fireEvent.click(screen.getByTestId('popover-trigger'));
    await waitFor(() => expect(screen.queryByTestId('popover')).toBeNull());

    await closeDialog();

    await waitFor(() => expect(screen.getByTestId('popover-trigger')).toHaveFocus());
  });

  it('should not focus a trigger outside the dialog the opener sat in', async () => {
    const { fixture } = await renderInApp(PopoverInDialogHost);
    press(screen.getByTestId('outer-trigger'));
    press(await screen.findByTestId('popover-trigger'));
    press(await screen.findByTestId('item'));
    await screen.findByTestId('dialog');

    // the popover and its trigger both leave the page while the nested dialog is open
    fixture.componentInstance.show.set(false);
    fixture.detectChanges();
    await waitFor(() => expect(screen.queryByTestId('popover')).toBeNull());

    // the outer dialog's focus trap would pull focus back, so watch for the trigger taking it
    let outerTriggerFocused = false;
    screen
      .getByTestId('outer-trigger')
      .addEventListener('focus', () => (outerTriggerFocused = true));

    await closeDialog();

    expect(outerTriggerFocused).toBe(false);
  });
});

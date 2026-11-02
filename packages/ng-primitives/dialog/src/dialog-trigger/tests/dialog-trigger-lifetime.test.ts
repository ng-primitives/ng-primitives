import { ApplicationRef, Component, ComponentRef, Provider, Type, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import {
  NgpDialog,
  NgpDialogManager,
  NgpDialogOverlay,
  NgpDialogTrigger,
  provideDialogConfig,
} from 'ng-primitives/dialog';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger, NgpSubmenuTrigger } from 'ng-primitives/menu';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * `NgpDialogManager.open()` renders into the root component's view container. Without one,
 * as in a bare TestBed, it falls back to the trigger's and the dialog dies with the trigger.
 */
@Component({ selector: 'test-app-root', template: '' })
class TestAppRoot {}

@Component({
  template: `
    @if (show()) {
      <button
        [ngpDialogTrigger]="dialog"
        (ngpDialogTriggerClosed)="closedCount = closedCount + 1"
        data-testid="trigger"
      >
        Open
      </button>
    }

    <ng-template #dialog>
      <div ngpDialogOverlay>
        <div ngpDialog data-testid="dialog">Dialog</div>
      </div>
    </ng-template>
  `,
  imports: [NgpDialogTrigger, NgpDialog, NgpDialogOverlay],
})
class PageTriggerHost {
  readonly show = signal(true);
  closedCount = 0;
}

/** A reusable item component, placed on the same element as the trigger. */
@Component({
  selector: 'button[test-menu-item]',
  template: '<ng-content />',
})
class TestMenuItem {}

@Component({
  template: `
    @if (show()) {
      <button [ngpMenuTrigger]="menu" data-testid="menu-trigger">Menu</button>
    }

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button [ngpDialogTrigger]="dialog" ngpMenuItem data-testid="item">Delete...</button>
        <button [ngpDialogTrigger]="dialog" ngpMenuItem test-menu-item data-testid="component-item">
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

    <ng-template #dialog>
      <div ngpDialogOverlay>
        <div ngpDialog data-testid="dialog">Dialog</div>
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
    TestMenuItem,
  ],
})
class MenuTriggerHost {
  readonly show = signal(true);
}

@Component({
  template: `
    @if (show()) {
      <button [ngpPopoverTrigger]="popover" data-testid="popover-trigger">Popover</button>
    }

    <ng-template #popover>
      <div ngpPopover data-testid="popover">
        <button [ngpDialogTrigger]="dialog" data-testid="trigger">Open</button>
      </div>
    </ng-template>

    <ng-template #dialog>
      <div ngpDialogOverlay>
        <div ngpDialog data-testid="dialog">Dialog</div>
      </div>
    </ng-template>
  `,
  imports: [NgpDialogTrigger, NgpDialog, NgpDialogOverlay, NgpPopoverTrigger, NgpPopover],
})
class PopoverTriggerHost {
  readonly show = signal(true);
}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="menu-trigger">Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button [ngpDialogTrigger]="first" ngpMenuItem data-testid="item">Open</button>
      </div>
    </ng-template>

    <ng-template #first>
      <div ngpDialogOverlay>
        <div ngpDialog data-testid="first">
          @if (show()) {
            <button [ngpDialogTrigger]="second" data-testid="nested-trigger">Open nested</button>
          }
        </div>
      </div>
    </ng-template>

    <ng-template #second>
      <div ngpDialogOverlay>
        <div ngpDialog data-testid="second">Nested</div>
      </div>
    </ng-template>
  `,
  imports: [NgpDialogTrigger, NgpDialog, NgpDialogOverlay, NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class DialogFromMenuDialogHost {
  readonly show = signal(true);
}

const triggerLifetime = [provideDialogConfig({ lifetime: 'trigger' })];

describe('NgpDialogTrigger lifetime', () => {
  let root: ComponentRef<TestAppRoot> | undefined;

  afterEach(async () => {
    TestBed.inject(NgpDialogManager).closeAll();
    await waitFor(() => expect(document.querySelector('[ngpDialogOverlay]')).toBeNull());
    root?.location.nativeElement.remove();
    root?.destroy();
    root = undefined;
  });

  /** Renders the host, then bootstraps a root component as a real app has. */
  async function renderInApp<T>(host: Type<T>, providers: Provider[] = []) {
    const result = await render(host, { providers });
    const rootElement = document.createElement('test-app-root');
    document.body.appendChild(rootElement);
    root = TestBed.inject(ApplicationRef).bootstrap(TestAppRoot, rootElement);
    return result;
  }

  function openDialogs() {
    return TestBed.inject(NgpDialogManager).openDialogs;
  }

  async function openMenuDialog(item: string): Promise<void> {
    fireEvent.click(screen.getByTestId('menu-trigger'));
    fireEvent.click(await screen.findByTestId(item));
    await screen.findByTestId('dialog');
    await waitFor(() => expect(screen.queryByTestId('menu')).toBeNull());
  }

  it('should keep the dialog open when its trigger is removed by default', async () => {
    const { fixture } = await renderInApp(PageTriggerHost);
    fireEvent.click(screen.getByTestId('trigger'));
    await screen.findByTestId('dialog');

    fixture.componentInstance.show.set(false);
    fixture.detectChanges();

    expect(openDialogs()).toHaveLength(1);
  });

  it('should close the dialog when its trigger is removed', async () => {
    const { fixture } = await renderInApp(PageTriggerHost, triggerLifetime);
    fireEvent.click(screen.getByTestId('trigger'));
    await screen.findByTestId('dialog');

    fixture.componentInstance.show.set(false);
    fixture.detectChanges();

    expect(openDialogs()).toHaveLength(0);
    await waitFor(() => expect(screen.queryByTestId('dialog')).toBeNull());
  });

  it('should not emit closed on a trigger that is being removed', async () => {
    const warn = vi.spyOn(console, 'warn');
    const { fixture } = await renderInApp(PageTriggerHost, triggerLifetime);
    fireEvent.click(screen.getByTestId('trigger'));
    await screen.findByTestId('dialog');

    fixture.componentInstance.show.set(false);
    fixture.detectChanges();

    expect(openDialogs()).toHaveLength(0);
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('NG0953'));
    warn.mockRestore();
  });

  it('should stop following the trigger once the dialog has closed', async () => {
    const { fixture } = await renderInApp(PageTriggerHost, triggerLifetime);
    fireEvent.click(screen.getByTestId('trigger'));
    await screen.findByTestId('dialog');
    const [dialogRef] = openDialogs();
    await dialogRef.close();
    const close = vi.spyOn(dialogRef, 'close');

    fixture.componentInstance.show.set(false);
    fixture.detectChanges();

    expect(close).not.toHaveBeenCalled();
  });

  it('should keep a dialog opened from a menu item open after the menu closes', async () => {
    await renderInApp(MenuTriggerHost, triggerLifetime);

    await openMenuDialog('item');

    expect(openDialogs()).toHaveLength(1);
  });

  it('should close a dialog opened from a menu item when the menu trigger is removed', async () => {
    const { fixture } = await renderInApp(MenuTriggerHost, triggerLifetime);
    await openMenuDialog('item');

    fixture.componentInstance.show.set(false);
    fixture.detectChanges();

    expect(openDialogs()).toHaveLength(0);
  });

  it('should follow the menu trigger when the item is a component host', async () => {
    const { fixture } = await renderInApp(MenuTriggerHost, triggerLifetime);
    await openMenuDialog('component-item');

    expect(openDialogs()).toHaveLength(1);

    fixture.componentInstance.show.set(false);
    fixture.detectChanges();

    expect(openDialogs()).toHaveLength(0);
  });

  it('should follow the root menu trigger from a submenu item', async () => {
    const { fixture } = await renderInApp(MenuTriggerHost, triggerLifetime);
    fireEvent.click(screen.getByTestId('menu-trigger'));
    fireEvent.click(await screen.findByTestId('submenu-trigger'));
    fireEvent.click(await screen.findByTestId('submenu-item'));
    await screen.findByTestId('dialog');
    await waitFor(() => expect(screen.queryByTestId('menu')).toBeNull());

    expect(openDialogs()).toHaveLength(1);

    fixture.componentInstance.show.set(false);
    fixture.detectChanges();

    expect(openDialogs()).toHaveLength(0);
  });

  it('should follow the popover trigger from inside a popover', async () => {
    const { fixture } = await renderInApp(PopoverTriggerHost, triggerLifetime);
    fireEvent.click(screen.getByTestId('popover-trigger'));
    fireEvent.click(await screen.findByTestId('trigger'));
    await screen.findByTestId('dialog');

    fireEvent.click(screen.getByTestId('popover-trigger'));
    await waitFor(() => expect(screen.queryByTestId('popover')).toBeNull());

    expect(openDialogs()).toHaveLength(1);

    fixture.componentInstance.show.set(false);
    fixture.detectChanges();

    expect(openDialogs()).toHaveLength(0);
  });

  it('should not follow a trigger past the dialog it sits in', async () => {
    const { fixture } = await renderInApp(DialogFromMenuDialogHost, triggerLifetime);
    fireEvent.click(screen.getByTestId('menu-trigger'));
    fireEvent.click(await screen.findByTestId('item'));
    fireEvent.click(await screen.findByTestId('nested-trigger'));
    await screen.findByTestId('second');

    fixture.componentInstance.show.set(false);
    fixture.detectChanges();

    expect(openDialogs()).toHaveLength(1);
    expect(screen.getByTestId('first')).toBeTruthy();
  });
});

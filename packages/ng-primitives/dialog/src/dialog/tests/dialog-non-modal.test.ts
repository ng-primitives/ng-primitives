import { AfterViewInit, Component, Directive, ElementRef, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import {
  NgpDialog,
  NgpDialogManager,
  NgpDialogTrigger,
  provideDialogConfig,
} from 'ng-primitives/dialog';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { ScrollStrategy } from 'ng-primitives/portal';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

let scrollBlocked = false;
const scrollStrategy: ScrollStrategy = {
  enable: () => (scrollBlocked = true),
  disable: () => (scrollBlocked = false),
};

@Component({ selector: 'ngp-plain-dialog', template: '<p>Dialog</p>' })
class PlainDialog {}

@Component({
  selector: 'ngp-early-dialog',
  template: '<div ngpDialog data-testid="early">Early</div>',
  imports: [NgpDialog],
})
class EarlyDialog {}

@Component({
  template: `
    <button [ngpDialogTrigger]="drawer" ngpDialogTriggerModal="false" data-testid="open">
      Open
    </button>

    <ng-template #drawer>
      <div ngpDialog data-testid="drawer">
        <button [ngpPopoverTrigger]="popover" data-testid="open-popover">More</button>
      </div>
    </ng-template>

    <ng-template #popover>
      <div ngpPopover><button data-testid="popover-button">Action</button></div>
    </ng-template>
  `,
  imports: [NgpDialogTrigger, NgpDialog, NgpPopoverTrigger, NgpPopover],
})
class PopoverInDrawerHost {}

@Component({
  template: `
    <button [ngpDialogTrigger]="drawer" data-testid="open">Open</button>

    <ng-template #drawer>
      <div ngpDialog data-testid="drawer">
        <button [ngpDialogTrigger]="inner" data-testid="open-inner">Inner</button>
      </div>
    </ng-template>

    <ng-template #inner>
      <div ngpDialog data-testid="inner">Inner</div>
    </ng-template>
  `,
  imports: [NgpDialogTrigger, NgpDialog],
  providers: [provideDialogConfig({ modal: false })],
})
class ComponentConfigHost {}

@Component({ template: '', providers: [NgpDialogManager] })
class NestedManagerHost {
  readonly manager = inject(NgpDialogManager);
}

@Directive({ selector: '[appFocusOnInit]' })
class FocusOnInit implements AfterViewInit {
  private readonly element = inject(ElementRef<HTMLElement>);

  ngAfterViewInit(): void {
    this.element.nativeElement.focus();
  }
}

@Component({
  template: `
    <button
      [ngpDialogTrigger]="drawer"
      [ngpDialogTriggerCloseOnEscape]="closeOnEscape"
      ngpDialogTriggerModal="false"
      data-testid="open"
    >
      Open
    </button>
    <button data-testid="page-button">Page</button>

    <ng-template #drawer let-close="close">
      <div ngpDialog data-testid="drawer">
        @if (focusInput) {
          <input appFocusOnInit data-testid="input" />
        }
        <button (click)="close()" data-testid="close">Close</button>
        <button [ngpDialogTrigger]="confirm" data-testid="open-confirm">Delete</button>
      </div>
    </ng-template>

    <ng-template #confirm>
      <div ngpDialog data-testid="confirm">Delete?</div>
    </ng-template>
  `,
  imports: [NgpDialogTrigger, NgpDialog, FocusOnInit],
})
class NonModalHost {
  closeOnEscape: boolean | (() => boolean) = true;
  focusInput = false;
}

@Component({
  template: `
    <button [ngpDialogTrigger]="dialog" data-testid="open">Open</button>

    <ng-template #dialog>
      <div ngpDialog data-testid="dialog">Dialog</div>
    </ng-template>
  `,
  imports: [NgpDialogTrigger, NgpDialog],
})
class DefaultHost {}

@Component({
  template: `
    <button [ngpDialogTrigger]="modal" data-testid="open-modal">Open</button>
    <button data-testid="page-button">Page</button>

    <ng-template #modal>
      <div ngpDialog data-testid="modal">
        <button [ngpDialogTrigger]="drawer" ngpDialogTriggerModal="false" data-testid="open-drawer">
          Drawer
        </button>
      </div>
    </ng-template>

    <ng-template #drawer>
      <div ngpDialog data-testid="drawer">
        <button data-testid="drawer-button">Inside</button>
      </div>
    </ng-template>
  `,
  imports: [NgpDialogTrigger, NgpDialog],
})
class DrawerFromModalHost {}

describe('Non-modal dialog', () => {
  let page: HTMLElement;

  beforeEach(() => {
    page = document.createElement('main');
    document.body.appendChild(page);
    scrollBlocked = false;
  });

  afterEach(async () => {
    TestBed.inject(NgpDialogManager).closeAll();
    await waitFor(() => expect(document.querySelector('[ngpDialog]')).toBeNull());
    await waitFor(() => expect(document.querySelector('ngp-plain-dialog')).toBeNull());
    page.remove();
  });

  async function openDrawer(properties: Partial<NonModalHost> = {}): Promise<HTMLElement> {
    await render(NonModalHost, {
      componentProperties: properties,
      providers: [provideDialogConfig({ scrollStrategy })],
    });
    fireEvent.click(screen.getByTestId('open'));
    return screen.findByTestId('drawer');
  }

  it('stays open when its trigger is clicked again and it cannot be closed', async () => {
    const drawer = await openDrawer();
    TestBed.inject(NgpDialogManager).openDialogs[0].disableClose = true;

    fireEvent.click(screen.getByTestId('open'));
    await new Promise(resolve => setTimeout(resolve));

    expect(drawer.isConnected).toBe(true);
  });

  it('returns focus to the trigger when it closes with focus in a popover opened from it', async () => {
    await render(PopoverInDrawerHost);
    fireEvent.click(screen.getByTestId('open'));
    await screen.findByTestId('drawer');
    fireEvent.click(screen.getByTestId('open-popover'));
    const action = await screen.findByTestId('popover-button');
    action.focus();
    expect(document.activeElement).toBe(action);

    TestBed.inject(NgpDialogManager).openDialogs[0].close();

    await waitFor(() => expect(document.activeElement).toBe(screen.getByTestId('open')));
  });

  it('leaves focus in a dialog opened from it that stays open', async () => {
    const drawer = await openDrawer();
    screen.getByTestId('close').focus();
    const manager = TestBed.inject(NgpDialogManager);
    // opened from inside the drawer, but not closed with it
    manager.open(EarlyDialog, { modal: false });
    const nested = await screen.findByTestId('early');
    await waitFor(() => expect(nested.contains(document.activeElement)).toBe(true));

    manager.openDialogs[0].close();
    await waitFor(() => expect(drawer.isConnected).toBe(false));

    expect(nested.isConnected).toBe(true);
    expect(nested.contains(document.activeElement)).toBe(true);
  });

  it('does not take focus when it closes before it renders', async () => {
    const style = document.head.appendChild(document.createElement('style'));
    style.textContent = `
      @keyframes test-dialog-exit { from { opacity: 1; } to { opacity: 0; } }
      [ngpDialog][data-exit] { animation: test-dialog-exit 300ms !important; }
    `;

    try {
      await render(DefaultHost);
      const dialogRef = TestBed.inject(NgpDialogManager).open(EarlyDialog, { modal: false });
      dialogRef.close();

      const dialog = await screen.findByTestId('early');
      await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve)));

      expect(dialog.contains(document.activeElement)).toBe(false);
      await waitFor(() => expect(dialog.isConnected).toBe(false));
    } finally {
      style.remove();
    }
  });

  it('leaves the page readable and scrollable', async () => {
    const drawer = await openDrawer();

    expect(drawer.getAttribute('aria-modal')).toBe('false');
    expect(page.hasAttribute('aria-hidden')).toBe(false);
    expect(scrollBlocked).toBe(false);
  });

  it('moves focus into the dialog on open and back to the trigger on close', async () => {
    const drawer = await openDrawer();

    await waitFor(() => expect(drawer.contains(document.activeElement)).toBe(true));

    fireEvent.click(screen.getByTestId('close'));

    await waitFor(() => expect(document.activeElement).toBe(screen.getByTestId('open')));
  });

  it('keeps the focus an element inside the dialog took on open', async () => {
    await openDrawer({ focusInput: true });
    const input = screen.getByTestId('input');
    await new Promise(resolve => setTimeout(resolve));

    expect(document.activeElement).toBe(input);
  });

  it('lets focus leave the dialog', async () => {
    const drawer = await openDrawer();
    await waitFor(() => expect(drawer.contains(document.activeElement)).toBe(true));
    const pageButton = screen.getByTestId('page-button');

    pageButton.focus();
    await new Promise(resolve => setTimeout(resolve));

    expect(document.activeElement).toBe(pageButton);
  });

  it('closes on a second click on the trigger', async () => {
    await openDrawer();
    const trigger = screen.getByTestId('open');

    fireEvent.click(trigger);

    expect(TestBed.inject(NgpDialogManager).openDialogs.length).toBe(0);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('leaves focus on the page when it closes after the user moved there', async () => {
    const drawer = await openDrawer();
    await waitFor(() => expect(drawer.contains(document.activeElement)).toBe(true));
    const pageButton = screen.getByTestId('page-button');
    pageButton.focus();

    TestBed.inject(NgpDialogManager).closeAll();
    await waitFor(() => expect(screen.queryByTestId('drawer')).toBeNull());
    await new Promise(resolve => setTimeout(resolve));

    expect(document.activeElement).toBe(pageButton);
  });

  it('keeps the focus trap of a modal dialog it was opened from', async () => {
    await render(DrawerFromModalHost, { providers: [provideDialogConfig({ scrollStrategy })] });
    fireEvent.click(screen.getByTestId('open-modal'));
    fireEvent.click(await screen.findByTestId('open-drawer'));
    const drawerButton = (await screen.findByTestId('drawer')).querySelector('button')!;

    drawerButton.focus();
    await new Promise(resolve => setTimeout(resolve));
    expect(document.activeElement).toBe(drawerButton);

    screen.getByTestId('page-button').focus();
    await waitFor(() =>
      expect(screen.getByTestId('modal').contains(document.activeElement)).toBe(true),
    );
  });

  it('lets Escape close the modal dialog below it while focus is there', async () => {
    await render(DrawerFromModalHost, { providers: [provideDialogConfig({ scrollStrategy })] });
    fireEvent.click(screen.getByTestId('open-modal'));
    const openDrawer = await screen.findByTestId('open-drawer');
    fireEvent.click(openDrawer);
    await screen.findByTestId('drawer');
    const manager = TestBed.inject(NgpDialogManager);

    fireEvent.keyDown(openDrawer, { key: 'Escape' });

    expect(manager.openDialogs.length).toBe(1);
    expect(manager.openDialogs[0].config.modal).toBe(false);
  });

  it('closes on Escape only while focus is inside it', async () => {
    const drawer = await openDrawer();
    const manager = TestBed.inject(NgpDialogManager);

    fireEvent.keyDown(screen.getByTestId('page-button'), { key: 'Escape' });
    expect(manager.openDialogs.length).toBe(1);

    fireEvent.keyDown(drawer, { key: 'Escape' });
    expect(manager.openDialogs.length).toBe(0);
  });

  it('still asks the Escape guard while focus is inside it', async () => {
    const drawer = await openDrawer({ closeOnEscape: () => false });

    fireEvent.keyDown(drawer, { key: 'Escape' });

    expect(TestBed.inject(NgpDialogManager).openDialogs.length).toBe(1);
  });

  it('closes on Escape when no Escape option is given', async () => {
    const manager = TestBed.inject(NgpDialogManager);
    manager.open(PlainDialog, { modal: false, closeOnEscape: undefined });
    const dialog = await waitFor(() => document.querySelector('ngp-plain-dialog') as HTMLElement);

    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(manager.openDialogs.length).toBe(0);
  });

  it('hides the page and the drawer behind a modal dialog opened over it', async () => {
    const drawer = await openDrawer();
    const manager = TestBed.inject(NgpDialogManager);

    const modal = manager.open(PlainDialog);

    expect(page.getAttribute('aria-hidden')).toBe('true');
    expect(drawer.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(scrollBlocked).toBe(true);

    await modal.close();

    expect(page.hasAttribute('aria-hidden')).toBe(false);
    expect(drawer.closest('[aria-hidden="true"]')).toBeNull();
    expect(scrollBlocked).toBe(false);
    expect(manager.openDialogs.length).toBe(1);
  });

  it('keeps a non-modal dialog opened over a modal dialog exposed', async () => {
    await render(DefaultHost, { providers: [provideDialogConfig({ scrollStrategy })] });
    const manager = TestBed.inject(NgpDialogManager);

    manager.open(PlainDialog);
    const drawer = manager.open(PlainDialog, {
      modal: false,
      triggerElement: screen.getByTestId('open'),
    });

    expect(page.getAttribute('aria-hidden')).toBe('true');
    expect(drawer.getElements()[0].closest('[aria-hidden="true"]')).toBeNull();
  });

  it('hides a non-modal dialog between two modal dialogs', async () => {
    await render(DefaultHost, { providers: [provideDialogConfig({ scrollStrategy })] });
    const manager = TestBed.inject(NgpDialogManager);

    manager.open(PlainDialog);
    const drawer = manager.open(PlainDialog, {
      modal: false,
      triggerElement: screen.getByTestId('open'),
    });
    const confirm = manager.open(PlainDialog);

    expect(drawer.getElements()[0].closest('[aria-hidden="true"]')).not.toBeNull();

    await confirm.close();

    expect(drawer.getElements()[0].closest('[aria-hidden="true"]')).toBeNull();
  });

  it('opens non-modal from the global configuration', async () => {
    await render(DefaultHost, {
      providers: [provideDialogConfig({ modal: false, scrollStrategy })],
    });
    fireEvent.click(screen.getByTestId('open'));
    const dialog = await screen.findByTestId('dialog');

    expect(dialog.getAttribute('aria-modal')).toBe('false');
    expect(page.hasAttribute('aria-hidden')).toBe(false);
  });

  it('falls back to the global configuration when open() is given an undefined modal', async () => {
    await render(DefaultHost, {
      providers: [provideDialogConfig({ modal: false, scrollStrategy })],
    });

    TestBed.inject(NgpDialogManager).open(PlainDialog, { modal: undefined });

    expect(page.hasAttribute('aria-hidden')).toBe(false);
    expect(scrollBlocked).toBe(false);
  });

  it('opens another modal dialog on a second click on its trigger', async () => {
    await render(DefaultHost, { providers: [provideDialogConfig({ scrollStrategy })] });
    fireEvent.click(screen.getByTestId('open'));
    await screen.findByTestId('dialog');

    fireEvent.click(screen.getByTestId('open'));

    expect(TestBed.inject(NgpDialogManager).openDialogs.length).toBe(2);
  });

  it('opens a modal dialog from a trigger inside it', async () => {
    await openDrawer();

    fireEvent.click(screen.getByTestId('open-confirm'));
    const confirm = await screen.findByTestId('confirm');

    expect(confirm.getAttribute('aria-modal')).toBe('true');
    expect(page.getAttribute('aria-hidden')).toBe('true');
    expect(scrollBlocked).toBe(true);
  });

  it('opens non-modal from a configuration provided by a component', async () => {
    await render(ComponentConfigHost);
    fireEvent.click(screen.getByTestId('open'));
    const drawer = await screen.findByTestId('drawer');

    expect(drawer.getAttribute('aria-modal')).toBe('false');
  });

  it('opens a dialog from inside it with the configuration it was opened from', async () => {
    await render(ComponentConfigHost);
    fireEvent.click(screen.getByTestId('open'));
    fireEvent.click(await screen.findByTestId('open-inner'));
    const inner = await screen.findByTestId('inner');

    expect(inner.getAttribute('aria-modal')).toBe('false');
  });

  it('releases the scroll block when the last modal dialog closes through a nested manager', async () => {
    const { fixture } = await render(NestedManagerHost, {
      providers: [provideDialogConfig({ scrollStrategy })],
    });
    const root = TestBed.inject(NgpDialogManager);
    const nested = fixture.componentInstance.manager;

    const first = root.open(PlainDialog);
    const second = nested.open(PlainDialog);
    expect(scrollBlocked).toBe(true);

    await first.close();
    expect(scrollBlocked).toBe(true);

    await second.close();
    expect(scrollBlocked).toBe(false);
  });

  it('blocks scrolling through the root manager when a nested manager opens the first modal', async () => {
    const { fixture } = await render(NestedManagerHost, {
      providers: [provideDialogConfig({ scrollStrategy })],
    });

    const dialog = fixture.componentInstance.manager.open(PlainDialog);
    expect(scrollBlocked).toBe(true);

    await dialog.close();
    expect(scrollBlocked).toBe(false);
  });

  it('stays modal by default', async () => {
    await render(DefaultHost, { providers: [provideDialogConfig({ scrollStrategy })] });
    fireEvent.click(screen.getByTestId('open'));
    const dialog = await screen.findByTestId('dialog');

    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(page.getAttribute('aria-hidden')).toBe('true');
    expect(scrollBlocked).toBe(true);
  });
});

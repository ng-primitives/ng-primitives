import { Component, TemplateRef, ViewContainerRef, inject, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import {
  NgpDialog,
  NgpDialogConfig,
  NgpDialogContext,
  NgpDialogDescription,
  NgpDialogManager,
  NgpDialogOverlay,
  NgpDialogTitle,
} from 'ng-primitives/dialog';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { NgpOverlayRegistry } from 'ng-primitives/portal';
import { afterEach, describe, expect, it, vi } from 'vitest';

@Component({
  template: `
    <ng-template #dialogTemplate let-close="close">
      <div ngpDialogOverlay data-testid="overlay">
        <div ngpDialog data-testid="dialog">
          <h2 ngpDialogTitle data-testid="title">Dialog Title</h2>
          <p ngpDialogDescription data-testid="description">Dialog Description</p>
          <button (click)="close('result')" data-testid="close-btn">Close</button>
        </div>
      </div>
    </ng-template>
  `,
  imports: [NgpDialog, NgpDialogOverlay, NgpDialogTitle, NgpDialogDescription],
})
class DialogHost {
  readonly dialogTemplate = viewChild.required<TemplateRef<NgpDialogContext>>('dialogTemplate');
  readonly viewContainerRef = inject(ViewContainerRef);
}

@Component({
  template: `
    <ng-template #dialogTemplate let-close="close">
      <div ngpDialogOverlay data-testid="overlay">
        <div ngpDialog data-testid="dialog">
          <button (click)="close()" data-testid="close-btn">Close</button>
        </div>
      </div>
    </ng-template>
  `,
  imports: [NgpDialog, NgpDialogOverlay],
})
class BareDialogHost {
  readonly dialogTemplate = viewChild.required<TemplateRef<NgpDialogContext>>('dialogTemplate');
  readonly viewContainerRef = inject(ViewContainerRef);
}

@Component({
  template: `
    <ng-template #dialogTemplate let-close="close">
      <div ngpDialogOverlay data-testid="overlay">
        <div ngpDialog data-testid="dialog">
          <button [ngpMenuTrigger]="menu" data-testid="menu-trigger">Open menu</button>

          <ng-template #menu>
            <div ngpMenu data-testid="menu">
              <button ngpMenuItem data-testid="menu-item">Item</button>
            </div>
          </ng-template>

          <p data-testid="description">Dialog Description</p>
          <button (click)="close()" data-testid="close-btn">Close</button>
        </div>
      </div>
    </ng-template>
  `,
  imports: [NgpDialog, NgpDialogOverlay, NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class MenuInDialogHost {
  readonly dialogTemplate = viewChild.required<TemplateRef<NgpDialogContext>>('dialogTemplate');
  readonly viewContainerRef = inject(ViewContainerRef);
}

@Component({
  template: `
    <ng-template #dialogTemplate let-close="close">
      <div ngpDialogOverlay data-testid="overlay">
        <div ngpDialog ngpDialogRole="alertdialog" data-testid="dialog">
          <button (click)="close()" data-testid="close-btn">Close</button>
        </div>
      </div>
    </ng-template>
  `,
  imports: [NgpDialog, NgpDialogOverlay],
})
class AlertDialogHost {
  readonly dialogTemplate = viewChild.required<TemplateRef<NgpDialogContext>>('dialogTemplate');
  readonly viewContainerRef = inject(ViewContainerRef);
}

describe('NgpDialog', () => {
  let dialogManager: NgpDialogManager | undefined;

  async function openDialog(config?: Partial<NgpDialogConfig>) {
    const view = await render(DialogHost);
    dialogManager = TestBed.inject(NgpDialogManager);
    const component = view.fixture.componentInstance;
    const ref = dialogManager.open(component.dialogTemplate(), {
      viewContainerRef: component.viewContainerRef,
      ...config,
    });
    await view.fixture.whenStable();
    return { view, ref };
  }

  async function openBareDialog(config?: Partial<NgpDialogConfig>) {
    const view = await render(BareDialogHost);
    dialogManager = TestBed.inject(NgpDialogManager);
    const component = view.fixture.componentInstance;
    const ref = dialogManager.open(component.dialogTemplate(), {
      viewContainerRef: component.viewContainerRef,
      ...config,
    });
    await view.fixture.whenStable();
    return { view, ref };
  }

  async function openMenuDialog(config?: Partial<NgpDialogConfig>) {
    const view = await render(MenuInDialogHost);
    dialogManager = TestBed.inject(NgpDialogManager);
    const component = view.fixture.componentInstance;
    const ref = dialogManager.open(component.dialogTemplate(), {
      viewContainerRef: component.viewContainerRef,
      ...config,
    });
    await view.fixture.whenStable();
    return { view, ref };
  }

  function dispatchPointerDown(element: HTMLElement): void {
    element.dispatchEvent(new Event('pointerdown', { bubbles: true }));
  }

  function dispatchOverlayClick(overlay: HTMLElement): void {
    dispatchPointerDown(overlay);
    overlay.click();
  }

  afterEach(async () => {
    dialogManager?.closeAll();
    await Promise.resolve();
    await Promise.resolve();
    dialogManager = undefined;
  });

  describe('roles & attributes', () => {
    it('should set role="dialog" on the dialog element', async () => {
      await openDialog();
      const dialog = document.querySelector('[data-testid="dialog"]');
      expect(dialog?.getAttribute('role')).toBe('dialog');
    });

    it('should set role="alertdialog" via the ngpDialogRole input', async () => {
      const view = await render(AlertDialogHost);
      dialogManager = TestBed.inject(NgpDialogManager);
      const component = view.fixture.componentInstance;
      dialogManager.open(component.dialogTemplate(), {
        viewContainerRef: component.viewContainerRef,
      });
      await view.fixture.whenStable();

      const dialog = document.querySelector('[data-testid="dialog"]');
      expect(dialog?.getAttribute('role')).toBe('alertdialog');
    });

    it('should honour the config.role option passed to open()', async () => {
      await openDialog({ role: 'alertdialog' });
      const dialog = document.querySelector('[data-testid="dialog"]');
      expect(dialog?.getAttribute('role')).toBe('alertdialog');
    });

    it('should set aria-modal="true" by default', async () => {
      await openDialog();
      const dialog = document.querySelector('[data-testid="dialog"]');
      expect(dialog?.getAttribute('aria-modal')).toBe('true');
    });

    it('should set tabindex="-1" on the dialog', async () => {
      await openDialog();
      const dialog = document.querySelector('[data-testid="dialog"]');
      expect(dialog?.getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('aria-labelledby / aria-describedby', () => {
    it('should set aria-labelledby to the title id', async () => {
      await openDialog();
      const dialog = document.querySelector('[data-testid="dialog"]');
      const title = document.querySelector('[data-testid="title"]');
      const titleId = title?.getAttribute('id');
      expect(titleId).toBeTruthy();
      expect(dialog?.getAttribute('aria-labelledby')).toContain(titleId!);
    });

    it('should set aria-describedby to the description id', async () => {
      await openDialog();
      const dialog = document.querySelector('[data-testid="dialog"]');
      const description = document.querySelector('[data-testid="description"]');
      const descriptionId = description?.getAttribute('id');
      expect(descriptionId).toBeTruthy();
      expect(dialog?.getAttribute('aria-describedby')).toContain(descriptionId!);
    });

    it('should omit aria-labelledby when there is no title', async () => {
      await openBareDialog();
      const dialog = document.querySelector('[data-testid="dialog"]');
      // An empty aria-labelledby="" references nothing and is invalid; it must be omitted.
      expect(dialog?.hasAttribute('aria-labelledby')).toBe(false);
    });

    it('should omit aria-describedby when there is no description', async () => {
      await openBareDialog();
      const dialog = document.querySelector('[data-testid="dialog"]');
      expect(dialog?.hasAttribute('aria-describedby')).toBe(false);
    });
  });

  describe('unique ids', () => {
    it('should generate a unique dialog id', async () => {
      await openDialog();
      const dialog = document.querySelector('[data-testid="dialog"]');
      expect(dialog?.getAttribute('id')).toMatch(/^ngp-dialog-/);
    });

    it('should generate a unique title id', async () => {
      await openDialog();
      const title = document.querySelector('[data-testid="title"]');
      expect(title?.getAttribute('id')).toMatch(/^ngp-dialog-title-/);
    });

    it('should generate a unique description id', async () => {
      await openDialog();
      const description = document.querySelector('[data-testid="description"]');
      expect(description?.getAttribute('id')).toMatch(/^ngp-dialog-description-/);
    });
  });

  describe('open / close', () => {
    it('should open a dialog and track it', async () => {
      const { ref } = await openDialog();
      expect(ref).toBeTruthy();
      expect(dialogManager!.openDialogs.length).toBe(1);
    });

    it('should close the dialog programmatically with a result', async () => {
      const { ref } = await openDialog();
      const closedSpy = vi.fn();
      ref.closed.subscribe(closedSpy);

      ref.close('test-result');
      await new Promise(r => setTimeout(r, 0));

      expect(closedSpy).toHaveBeenCalledWith(expect.objectContaining({ result: 'test-result' }));
    });

    it('should close the dialog when the close context callback is invoked', async () => {
      const { ref } = await openDialog();
      const closedSpy = vi.fn();
      ref.closed.subscribe(closedSpy);

      const closeBtn = document.querySelector('[data-testid="close-btn"]') as HTMLElement;
      closeBtn.click();
      await new Promise(r => setTimeout(r, 0));

      expect(closedSpy).toHaveBeenCalledWith(expect.objectContaining({ result: 'result' }));
    });

    it('should close all dialogs with closeAll', async () => {
      await openDialog();
      expect(dialogManager!.openDialogs.length).toBe(1);

      dialogManager!.closeAll();
      await new Promise(r => setTimeout(r, 0));

      expect(dialogManager!.openDialogs.length).toBe(0);
    });
  });

  describe('backdrop / overlay click close', () => {
    it('should close when pointerdown and click both occur on the overlay', async () => {
      const { ref } = await openDialog();
      const closedSpy = vi.fn();
      ref.closed.subscribe(closedSpy);

      const overlay = document.querySelector('[data-testid="overlay"]') as HTMLElement;
      dispatchOverlayClick(overlay);
      await new Promise(r => setTimeout(r, 0));

      expect(closedSpy).toHaveBeenCalled();
    });

    it('should NOT close when the dialog itself is clicked', async () => {
      const { ref } = await openDialog();
      const closedSpy = vi.fn();
      ref.closed.subscribe(closedSpy);

      const dialog = document.querySelector('[data-testid="dialog"]') as HTMLElement;
      dialog.click();
      await new Promise(r => setTimeout(r, 0));

      expect(closedSpy).not.toHaveBeenCalled();
    });

    it('should NOT close when pointerdown starts inside the dialog and click ends on the overlay', async () => {
      const { ref } = await openDialog();
      const closedSpy = vi.fn();
      ref.closed.subscribe(closedSpy);

      const dialog = document.querySelector('[data-testid="dialog"]') as HTMLElement;
      const overlay = document.querySelector('[data-testid="overlay"]') as HTMLElement;

      dispatchPointerDown(dialog);
      overlay.click();
      await new Promise(r => setTimeout(r, 0));

      expect(closedSpy).not.toHaveBeenCalled();
    });

    it('should NOT close on overlay click when closeOnClick is false', async () => {
      const { ref } = await openDialog({ closeOnClick: false });
      const closedSpy = vi.fn();
      ref.closed.subscribe(closedSpy);

      const overlay = document.querySelector('[data-testid="overlay"]') as HTMLElement;
      dispatchOverlayClick(overlay);
      await new Promise(r => setTimeout(r, 0));

      expect(closedSpy).not.toHaveBeenCalled();
    });

    it('should NOT close on overlay click when closeOnOutsideClick is false', async () => {
      const { ref } = await openDialog({ closeOnOutsideClick: false });
      const closedSpy = vi.fn();
      ref.closed.subscribe(closedSpy);

      const overlay = document.querySelector('[data-testid="overlay"]') as HTMLElement;
      dispatchOverlayClick(overlay);
      await new Promise(r => setTimeout(r, 0));

      expect(closedSpy).not.toHaveBeenCalled();
    });

    it('should NOT close on overlay click when disableClose is true', async () => {
      const { ref } = await openDialog();
      ref.disableClose = true;

      const closedSpy = vi.fn();
      ref.closed.subscribe(closedSpy);

      const overlay = document.querySelector('[data-testid="overlay"]') as HTMLElement;
      dispatchOverlayClick(overlay);
      await new Promise(r => setTimeout(r, 0));

      expect(closedSpy).not.toHaveBeenCalled();
    });
  });

  describe('document click propagation', () => {
    it('should not prevent a click inside the dialog panel from reaching a document click listener', async () => {
      await openDialog();

      const documentClickSpy = vi.fn();
      document.addEventListener('click', documentClickSpy);

      try {
        const description = document.querySelector('[data-testid="description"]') as HTMLElement;
        description.click();

        expect(documentClickSpy).toHaveBeenCalledTimes(1);
      } finally {
        document.removeEventListener('click', documentClickSpy);
      }
    });

    it('should close a menu opened inside the dialog panel on an outside click, without closing the dialog', async () => {
      const { view, ref } = await openMenuDialog();
      const closedSpy = vi.fn();
      ref.closed.subscribe(closedSpy);

      const trigger = document.querySelector('[data-testid="menu-trigger"]') as HTMLElement;
      fireEvent.click(trigger, { detail: 1 });
      await view.fixture.whenStable();
      await new Promise(r => setTimeout(r, 0));

      expect(document.querySelector('[data-testid="menu"]')).toBeTruthy();

      const description = document.querySelector('[data-testid="description"]') as HTMLElement;
      fireEvent.mouseUp(description);
      fireEvent.click(description);
      await view.fixture.whenStable();
      await new Promise(r => setTimeout(r, 0));

      expect(document.querySelector('[data-testid="menu"]')).toBeFalsy();
      expect(closedSpy).not.toHaveBeenCalled();
    });
  });

  describe('escape key close', () => {
    it('should close on Escape via the overlay registry', async () => {
      const { ref } = await openDialog();
      const closedSpy = vi.fn();
      ref.closed.subscribe(closedSpy);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await new Promise(r => setTimeout(r, 0));

      expect(closedSpy).toHaveBeenCalled();
    });

    it('should NOT close on Escape when closeOnEscape is false', async () => {
      const { ref } = await openDialog({ closeOnEscape: false });
      const closedSpy = vi.fn();
      ref.closed.subscribe(closedSpy);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await new Promise(r => setTimeout(r, 0));

      expect(closedSpy).not.toHaveBeenCalled();
    });

    it('should NOT close on Escape when disableClose is true', async () => {
      const { ref } = await openDialog();
      ref.disableClose = true;
      const closedSpy = vi.fn();
      ref.closed.subscribe(closedSpy);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await new Promise(r => setTimeout(r, 0));

      expect(closedSpy).not.toHaveBeenCalled();
    });
  });

  describe('dismiss guards', () => {
    it('should not close when a sync closeOnOutsideClick guard returns false', async () => {
      const { ref } = await openDialog({ closeOnOutsideClick: () => false });
      const closedSpy = vi.fn();
      ref.closed.subscribe(closedSpy);

      const overlay = document.querySelector('[data-testid="overlay"]') as HTMLElement;
      dispatchOverlayClick(overlay);
      await new Promise(r => setTimeout(r, 0));

      expect(closedSpy).not.toHaveBeenCalled();
    });

    it('should not close when an async closeOnOutsideClick guard resolves false', async () => {
      const { ref } = await openDialog({ closeOnOutsideClick: () => Promise.resolve(false) });
      const closedSpy = vi.fn();
      ref.closed.subscribe(closedSpy);

      const overlay = document.querySelector('[data-testid="overlay"]') as HTMLElement;
      dispatchOverlayClick(overlay);
      await new Promise(r => setTimeout(r, 0));

      expect(closedSpy).not.toHaveBeenCalled();
    });

    it('should close when an async closeOnOutsideClick guard resolves true', async () => {
      const { ref } = await openDialog({ closeOnOutsideClick: () => Promise.resolve(true) });
      const closedSpy = vi.fn();
      ref.closed.subscribe(closedSpy);

      const overlay = document.querySelector('[data-testid="overlay"]') as HTMLElement;
      dispatchOverlayClick(overlay);

      await waitFor(() => {
        expect(closedSpy).toHaveBeenCalled();
      });
    });

    it('should not close when a closeOnEscape guard returns false', async () => {
      const { ref } = await openDialog({ closeOnEscape: () => false });
      const closedSpy = vi.fn();
      ref.closed.subscribe(closedSpy);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await new Promise(r => setTimeout(r, 0));

      expect(closedSpy).not.toHaveBeenCalled();
    });
  });

  describe('focus trap', () => {
    it('should move focus into the dialog when opened', async () => {
      await openDialog();
      const dialog = document.querySelector('[data-testid="dialog"]') as HTMLElement;

      await waitFor(() => {
        expect(dialog.contains(document.activeElement)).toBe(true);
      });
    });
  });

  describe('overlay integration', () => {
    it('should keep the dialog open after the menu closes when opened from a menu item', async () => {
      const view = await render(MenuDialogHost);
      dialogManager = TestBed.inject(NgpDialogManager);

      const trigger = document.querySelector('[data-testid="menu-trigger"]') as HTMLElement;
      fireEvent.click(trigger, { detail: 1 });
      await view.fixture.whenStable();
      await new Promise(r => setTimeout(r, 0));

      const dialogItem = document.querySelector('[data-testid="dialog-item"]') as HTMLElement;
      expect(dialogItem).toBeTruthy();
      fireEvent.click(dialogItem, { detail: 1 });
      await view.fixture.whenStable();
      await new Promise(r => setTimeout(r, 0));

      expect(document.querySelector('[data-testid="dialog-from-menu"]')).toBeTruthy();
      // Menu should be closed (closeOnSelect default is true)
      expect(document.querySelector('[data-testid="menu"]')).toBeFalsy();
    });

    it('should register a dialog opened from within another dialog as its child', async () => {
      const { view, ref: refA } = await openDialog();
      const registry = TestBed.inject(NgpOverlayRegistry);

      const dialogElement = document.querySelector('[data-testid="dialog"]') as HTMLElement;
      dialogElement.focus();

      const component = view.fixture.componentInstance;
      const refB = dialogManager!.open(component.dialogTemplate(), {
        viewContainerRef: component.viewContainerRef,
      });
      await view.fixture.whenStable();

      expect(dialogManager!.openDialogs.length).toBe(2);

      const entryB = registry.getEntries().find(e => e.id === refB.id);
      expect(entryB).toBeTruthy();
      expect(entryB!.parentId).toBe(refA.id);

      refB.close();
      await new Promise(r => setTimeout(r, 0));
      refA.close();
      await new Promise(r => setTimeout(r, 0));
    });

    it('should NOT register a dialog opened from a popover as a descendant of the popover', async () => {
      const view = await render(PopoverDialogHost);
      dialogManager = TestBed.inject(NgpDialogManager);

      const trigger = document.querySelector('[data-testid="popover-trigger"]') as HTMLElement;
      fireEvent.click(trigger, { detail: 1 });
      await view.fixture.whenStable();
      await new Promise(r => setTimeout(r, 0));

      const dialogBtn = document.querySelector('[data-testid="popover-dialog-btn"]') as HTMLElement;
      expect(dialogBtn).toBeTruthy();
      fireEvent.click(dialogBtn, { detail: 1 });
      await view.fixture.whenStable();
      await new Promise(r => setTimeout(r, 0));

      const registry = TestBed.inject(NgpOverlayRegistry);
      expect(document.querySelector('[data-testid="dialog-from-popover"]')).toBeTruthy();
      const dialogId = dialogManager.openDialogs[0].id;
      const dialogEntry = registry.getEntries().find(e => e.id === dialogId);
      expect(dialogEntry).toBeTruthy();
      expect(dialogEntry!.parentId).toBeNull();
    });
  });
});

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="menu-trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button (click)="openDialog()" ngpMenuItem data-testid="dialog-item">Open Dialog</button>
      </div>
    </ng-template>

    <ng-template #dialogTemplate let-close="close">
      <div ngpDialogOverlay data-testid="dialog-overlay">
        <div ngpDialog data-testid="dialog-from-menu">
          <h2 ngpDialogTitle>Dialog</h2>
          <button (click)="close()" data-testid="dialog-close-btn">Close</button>
        </div>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpDialog, NgpDialogOverlay, NgpDialogTitle],
})
class MenuDialogHost {
  readonly dialogTemplate = viewChild.required<TemplateRef<NgpDialogContext>>('dialogTemplate');
  private readonly dialogManager = inject(NgpDialogManager);
  readonly viewContainerRef = inject(ViewContainerRef);

  openDialog(): void {
    this.dialogManager.open(this.dialogTemplate(), {
      viewContainerRef: this.viewContainerRef,
    });
  }
}

@Component({
  template: `
    <button [ngpPopoverTrigger]="popover" data-testid="popover-trigger">Open Popover</button>

    <ng-template #popover>
      <div ngpPopover data-testid="popover">
        <button (click)="openDialog()" data-testid="popover-dialog-btn">Open Dialog</button>
      </div>
    </ng-template>

    <ng-template #dialogTemplate let-close="close">
      <div ngpDialogOverlay data-testid="dialog-overlay">
        <div ngpDialog data-testid="dialog-from-popover">
          <h2 ngpDialogTitle>Dialog</h2>
          <button (click)="close()" data-testid="dialog-close-btn">Close</button>
        </div>
      </div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover, NgpDialog, NgpDialogOverlay, NgpDialogTitle],
})
class PopoverDialogHost {
  readonly dialogTemplate = viewChild.required<TemplateRef<NgpDialogContext>>('dialogTemplate');
  private readonly dialogManager = inject(NgpDialogManager);
  readonly viewContainerRef = inject(ViewContainerRef);

  openDialog(): void {
    this.dialogManager.open(this.dialogTemplate(), {
      viewContainerRef: this.viewContainerRef,
    });
  }
}

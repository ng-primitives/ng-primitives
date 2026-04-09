import { Component, TemplateRef, ViewContainerRef, inject, viewChild } from '@angular/core';
import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { fireEvent } from '@testing-library/angular';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { NgpOverlayRegistry } from 'ng-primitives/portal';
import { NgpDialogConfig } from '../config/dialog-config';
import { NgpDialogDescription } from '../dialog-description/dialog-description';
import { NgpDialogOverlay } from '../dialog-overlay/dialog-overlay';
import { NgpDialogTitle } from '../dialog-title/dialog-title';
import { NgpDialog } from './dialog';
import { NgpDialogContext, NgpDialogManager } from './dialog.service';

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
class DialogHostComponent {
  readonly dialogTemplate = viewChild.required<TemplateRef<NgpDialogContext>>('dialogTemplate');
  readonly viewContainerRef = inject(ViewContainerRef);
}

describe('NgpDialog', () => {
  let dialogManager: NgpDialogManager;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DialogHostComponent, MenuDialogTestComponent, PopoverDialogTestComponent],
    });
  });

  function openDialog(config?: Partial<NgpDialogConfig>) {
    const fixture = TestBed.createComponent(DialogHostComponent);
    fixture.detectChanges();
    dialogManager = TestBed.inject(NgpDialogManager);
    const component = fixture.componentInstance;
    const ref = dialogManager.open(component.dialogTemplate(), {
      viewContainerRef: component.viewContainerRef,
      ...config,
    });
    fixture.detectChanges();
    return { fixture, ref };
  }

  function dispatchPointerDown(element: HTMLElement): void {
    element.dispatchEvent(new Event('pointerdown', { bubbles: true }));
  }

  function dispatchOverlayClick(overlay: HTMLElement): void {
    dispatchPointerDown(overlay);
    overlay.click();
  }

  afterEach(fakeAsync(() => {
    dialogManager?.closeAll();
    flush();
  }));

  it('should open a dialog', () => {
    const { ref } = openDialog();
    expect(ref).toBeTruthy();
    expect(dialogManager.openDialogs.length).toBe(1);
  });

  it('should set role="dialog" on the dialog element', () => {
    openDialog();
    const dialog = document.querySelector('[data-testid="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog?.getAttribute('role')).toBe('dialog');
  });

  it('should set aria-modal="true" by default', () => {
    openDialog();
    const dialog = document.querySelector('[data-testid="dialog"]');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
  });

  it('should set tabindex="-1" on the dialog', () => {
    openDialog();
    const dialog = document.querySelector('[data-testid="dialog"]');
    expect(dialog?.getAttribute('tabindex')).toBe('-1');
  });

  it('should set aria-labelledby to the title id', () => {
    openDialog();
    const dialog = document.querySelector('[data-testid="dialog"]');
    const title = document.querySelector('[data-testid="title"]');
    const titleId = title?.getAttribute('id');
    expect(titleId).toBeTruthy();
    expect(dialog?.getAttribute('aria-labelledby')).toContain(titleId!);
  });

  it('should set aria-describedby to the description id', () => {
    openDialog();
    const dialog = document.querySelector('[data-testid="dialog"]');
    const description = document.querySelector('[data-testid="description"]');
    const descriptionId = description?.getAttribute('id');
    expect(descriptionId).toBeTruthy();
    expect(dialog?.getAttribute('aria-describedby')).toContain(descriptionId!);
  });

  it('should close dialog programmatically', fakeAsync(() => {
    const { ref } = openDialog();
    const closedSpy = jest.fn();
    ref.closed.subscribe(closedSpy);

    ref.close('test-result');
    flush();

    expect(closedSpy).toHaveBeenCalledWith(expect.objectContaining({ result: 'test-result' }));
  }));

  it('should close dialog when pointerdown and click both occur on the overlay', fakeAsync(() => {
    const { ref } = openDialog();
    const closedSpy = jest.fn();
    ref.closed.subscribe(closedSpy);

    const overlay = document.querySelector('[data-testid="overlay"]') as HTMLElement;
    dispatchOverlayClick(overlay);
    flush();

    expect(closedSpy).toHaveBeenCalled();
  }));

  it('should NOT close on overlay click when dialog is clicked', fakeAsync(() => {
    const { ref } = openDialog();
    const closedSpy = jest.fn();
    ref.closed.subscribe(closedSpy);

    const dialog = document.querySelector('[data-testid="dialog"]') as HTMLElement;
    dialog.click();
    flush();

    expect(closedSpy).not.toHaveBeenCalled();
  }));

  it('should NOT close when pointerdown starts inside the dialog and click ends on the overlay', fakeAsync(() => {
    const { ref } = openDialog();
    const closedSpy = jest.fn();
    ref.closed.subscribe(closedSpy);

    const dialog = document.querySelector('[data-testid="dialog"]') as HTMLElement;
    const overlay = document.querySelector('[data-testid="overlay"]') as HTMLElement;

    dispatchPointerDown(dialog);
    overlay.click();
    flush();

    expect(closedSpy).not.toHaveBeenCalled();
  }));

  it('should close dialog on Escape key via registry', fakeAsync(() => {
    const { ref } = openDialog();
    const closedSpy = jest.fn();
    ref.closed.subscribe(closedSpy);

    // The registry captures keydown events on the document
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    flush();

    expect(closedSpy).toHaveBeenCalled();
  }));

  it('should NOT close on Escape when closeOnEscape is false', fakeAsync(() => {
    const { ref } = openDialog({ closeOnEscape: false });
    const closedSpy = jest.fn();
    ref.closed.subscribe(closedSpy);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    flush();

    expect(closedSpy).not.toHaveBeenCalled();
  }));

  it('should NOT close on overlay click when closeOnClick is false', fakeAsync(() => {
    const { ref } = openDialog({ closeOnClick: false });
    const closedSpy = jest.fn();
    ref.closed.subscribe(closedSpy);

    const overlay = document.querySelector('[data-testid="overlay"]') as HTMLElement;
    dispatchOverlayClick(overlay);
    flush();

    expect(closedSpy).not.toHaveBeenCalled();
  }));

  it('should NOT close on overlay click when disableClose is true', fakeAsync(() => {
    const { ref } = openDialog();
    ref.disableClose = true;

    const closedSpy = jest.fn();
    ref.closed.subscribe(closedSpy);

    const overlay = document.querySelector('[data-testid="overlay"]') as HTMLElement;
    dispatchOverlayClick(overlay);
    flush();

    expect(closedSpy).not.toHaveBeenCalled();
  }));

  it('should generate unique dialog id', () => {
    openDialog();
    const dialog = document.querySelector('[data-testid="dialog"]');
    const id = dialog?.getAttribute('id');
    expect(id).toMatch(/^ngp-dialog-/);
  });

  it('should generate unique title id', () => {
    openDialog();
    const title = document.querySelector('[data-testid="title"]');
    const id = title?.getAttribute('id');
    expect(id).toMatch(/^ngp-dialog-title-/);
  });

  it('should generate unique description id', () => {
    openDialog();
    const description = document.querySelector('[data-testid="description"]');
    const id = description?.getAttribute('id');
    expect(id).toMatch(/^ngp-dialog-description-/);
  });

  it('should close all dialogs with closeAll', fakeAsync(() => {
    openDialog();
    expect(dialogManager.openDialogs.length).toBe(1);

    dialogManager.closeAll();
    flush();

    expect(dialogManager.openDialogs.length).toBe(0);
  }));

  describe('Overlay Integration', () => {
    it('should keep dialog open after menu closes when opened from menu item click', fakeAsync(() => {
      const fixture = TestBed.createComponent(MenuDialogTestComponent);
      fixture.detectChanges();
      dialogManager = TestBed.inject(NgpDialogManager);

      const trigger = document.querySelector('[data-testid="menu-trigger"]') as HTMLElement;
      fireEvent.click(trigger, { detail: 1 });
      tick();
      fixture.detectChanges();
      flush();

      const dialogItem = document.querySelector('[data-testid="dialog-item"]') as HTMLElement;
      expect(dialogItem).toBeTruthy();
      fireEvent.click(dialogItem, { detail: 1 });
      tick();
      fixture.detectChanges();
      flush();

      expect(document.querySelector('[data-testid="dialog-from-menu"]')).toBeTruthy();
      // Menu should be closed (closeOnSelect default is true)
      expect(document.querySelector('[data-testid="menu"]')).toBeFalsy();
    }));

    it('should keep dialog-from-dialog parent relationship', fakeAsync(() => {
      const registry = TestBed.inject(NgpOverlayRegistry);

      // Open dialog A
      const { fixture, ref: refA } = openDialog();

      // Focus inside dialog A
      const dialogElement = document.querySelector('[data-testid="dialog"]') as HTMLElement;
      dialogElement.focus();

      // Open dialog B while focused inside dialog A
      const component = fixture.componentInstance;
      const refB = dialogManager.open(component.dialogTemplate(), {
        viewContainerRef: component.viewContainerRef,
      });
      fixture.detectChanges();

      expect(dialogManager.openDialogs.length).toBe(2);

      // Verify dialog B is registered as a child of dialog A in the registry
      const entryB = registry.getEntries().find(e => e.id === refB.id);
      expect(entryB).toBeTruthy();
      expect(entryB!.parentId).toBe(refA.id);

      // Clean up
      refB.close();
      flush();
      refA.close();
      flush();
    }));

    it('should keep dialog open after popover closes when opened from popover content', fakeAsync(() => {
      const fixture = TestBed.createComponent(PopoverDialogTestComponent);
      fixture.detectChanges();
      dialogManager = TestBed.inject(NgpDialogManager);

      // Open popover
      const trigger = document.querySelector('[data-testid="popover-trigger"]') as HTMLElement;
      fireEvent.click(trigger, { detail: 1 });
      tick();
      fixture.detectChanges();
      flush();

      // Click button inside popover to open dialog
      const dialogBtn = document.querySelector('[data-testid="popover-dialog-btn"]') as HTMLElement;
      expect(dialogBtn).toBeTruthy();
      fireEvent.click(dialogBtn, { detail: 1 });
      tick();
      fixture.detectChanges();
      flush();

      // Dialog should not be registered as a descendant of the popover.
      // Unlike the menu test (where closeOnSelect auto-closes the menu), the popover
      // stays open here. Verify the dialog's parentId is null (not the popover's ID),
      // so if the popover closes later it won't cascade-close the dialog.
      const registry = TestBed.inject(NgpOverlayRegistry);
      expect(document.querySelector('[data-testid="dialog-from-popover"]')).toBeTruthy();
      const dialogId = dialogManager.openDialogs[0].id;
      const dialogEntry = registry.getEntries().find(e => e.id === dialogId);
      expect(dialogEntry).toBeTruthy();
      expect(dialogEntry!.parentId).toBeNull();
    }));
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
class MenuDialogTestComponent {
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
class PopoverDialogTestComponent {
  readonly dialogTemplate = viewChild.required<TemplateRef<NgpDialogContext>>('dialogTemplate');
  private readonly dialogManager = inject(NgpDialogManager);
  readonly viewContainerRef = inject(ViewContainerRef);

  openDialog(): void {
    this.dialogManager.open(this.dialogTemplate(), {
      viewContainerRef: this.viewContainerRef,
    });
  }
}

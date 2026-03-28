import { Component, TemplateRef, ViewContainerRef, inject, viewChild } from '@angular/core';
import { TestBed, fakeAsync, flush } from '@angular/core/testing';
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
      imports: [DialogHostComponent],
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

  it('should close dialog on Escape key via overlay keydown events', fakeAsync(() => {
    const { ref } = openDialog();
    const closedSpy = jest.fn();
    ref.closed.subscribe(closedSpy);

    // The CDK overlay captures keydown events on the overlay host element
    const overlayHost = ref.overlayRef.overlayElement;
    overlayHost.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    flush();

    expect(closedSpy).toHaveBeenCalled();
  }));

  it('should NOT close on Escape when closeOnEscape is false', fakeAsync(() => {
    const { ref } = openDialog({ closeOnEscape: false });
    const closedSpy = jest.fn();
    ref.closed.subscribe(closedSpy);

    const overlayHost = ref.overlayRef.overlayElement;
    overlayHost.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
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
});

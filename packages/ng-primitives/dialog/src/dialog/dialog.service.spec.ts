/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, TemplateRef, ViewContainerRef, inject, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { NgpDialogRef } from './dialog-ref';
import { NgpDialogContext, NgpDialogManager } from './dialog.service';

@Component({ selector: 'ngp-test-dialog', template: '<p>Test</p>' })
class TestDialog {}

@Component({
  template: `
    <ng-template #dialog>
      <div>Dialog content</div>
    </ng-template>
  `,
})
class DialogTestComponent {
  readonly dialog = viewChild.required<TemplateRef<NgpDialogContext>>('dialog');
  readonly viewContainerRef = inject(ViewContainerRef);
}

/**
 * Type-level tests. These verify compile-time type safety for the dialog service.
 * The function is never called at runtime — it only needs to compile.
 */
function typeTests(dialog: NgpDialogManager) {
  // Issue #1: Should be able to specify just T without R
  const ref1 = dialog.open<string>(TestDialog, { data: 'hello' });

  // Issue #2: ref.data should be T, not T | undefined
  const data: string = ref1.data;

  // Issue #3: Should error when T is specified but data is missing
  // @ts-expect-error - data is required when T is specified
  dialog.open<string>(TestDialog);

  // @ts-expect-error - data is required when T is specified (empty config)
  dialog.open<string>(TestDialog, {});

  // @ts-expect-error - data is required when T is specified (wrong type)
  dialog.open<string>(TestDialog, { data: 123 });

  // Non-breaking: should still work without type params
  const ref2 = dialog.open(TestDialog);
  const ref3 = dialog.open(TestDialog, { closeOnEscape: false });

  // With both type params
  const ref4 = dialog.open<string, number>(TestDialog, { data: 'hello' });

  // Issue #659: Should be able to specify result type R without data using explicit void
  const ref5 = dialog.open<void, number>(TestDialog);
  ref5.closed.subscribe(({ result }) => {
    const num: number | undefined = result;
  });

  // Should be able to specify result type R with config but no data
  const ref6 = dialog.open<void, string>(TestDialog, { closeOnEscape: false });
  ref6.closed.subscribe(({ result }) => {
    const str: string | undefined = result;
  });

  // Result type should be properly inferred when using explicit void
  const ref7 = dialog.open<void, boolean>(TestDialog);
  ref7.close(true); // Should compile
  // @ts-expect-error - wrong result type
  ref7.close('wrong'); // Should error
}

describe('NgpDialogManager', () => {
  let dialog: NgpDialogManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    dialog = TestBed.inject(NgpDialogManager);
  });

  it('should open a dialog without data', () => {
    const ref = dialog.open(TestDialog);
    expect(ref).toBeInstanceOf(NgpDialogRef);
    ref.close();
  });

  it('should open a dialog with data', () => {
    const ref = dialog.open<string>(TestDialog, { data: 'test-data' });
    expect(ref).toBeInstanceOf(NgpDialogRef);
    expect(ref.data).toBe('test-data');
    ref.close();
  });

  it('should emit result through closed subject', async () => {
    const ref = dialog.open<string, number>(TestDialog, { data: 'hello' });
    const closedPromise = new Promise<{ result?: number }>(resolve => {
      ref.closed.subscribe(resolve);
    });

    ref.close(42);
    const result = await closedPromise;
    expect(result.result).toBe(42);
  });

  it('should respect config options', () => {
    const ref = dialog.open(TestDialog, { closeOnEscape: false });
    expect(ref.closeOnEscape).toBe(false);
    ref.close();
  });

  it('should track open dialogs', () => {
    const ref1 = dialog.open(TestDialog);
    const ref2 = dialog.open(TestDialog);
    expect(dialog.openDialogs.length).toBe(2);
    ref1.close();
    ref2.close();
  });

  it('should open dialog with result type but no data', async () => {
    const ref = dialog.open<void, number>(TestDialog);
    expect(ref).toBeInstanceOf(NgpDialogRef);

    const closedPromise = new Promise<{ result?: number }>(resolve => {
      ref.closed.subscribe(resolve);
    });

    ref.close(42);
    const result = await closedPromise;
    expect(result.result).toBe(42);
  });

  it('should open dialog with result type and config but no data', async () => {
    const ref = dialog.open<void, string>(TestDialog, { closeOnEscape: false });
    expect(ref).toBeInstanceOf(NgpDialogRef);
    expect(ref.closeOnEscape).toBe(false);

    const closedPromise = new Promise<{ result?: string }>(resolve => {
      ref.closed.subscribe(resolve);
    });

    ref.close('success');
    const result = await closedPromise;
    expect(result.result).toBe('success');
  });
});

describe('NgpDialogManager router integration', () => {
  let dialogManager: NgpDialogManager;
  let fixture: ReturnType<typeof TestBed.createComponent<DialogTestComponent>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogTestComponent],
      providers: [provideRouter([{ path: '**', component: DialogTestComponent }])],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogTestComponent);
    fixture.detectChanges();
    dialogManager = TestBed.inject(NgpDialogManager);
  });

  afterEach(() => {
    dialogManager.closeAll();
    fixture.destroy();
  });

  it('should close dialog on route navigation', async () => {
    const template = fixture.componentInstance.dialog();
    const vcr = fixture.componentInstance.viewContainerRef;
    dialogManager.open(template, { viewContainerRef: vcr });

    expect(dialogManager.openDialogs.length).toBe(1);

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/other');

    expect(dialogManager.openDialogs.length).toBe(0);
  });

  it('should not close dialog with closeOnNavigation set to false', async () => {
    const template = fixture.componentInstance.dialog();
    const vcr = fixture.componentInstance.viewContainerRef;
    dialogManager.open(template, { viewContainerRef: vcr, closeOnNavigation: false });

    expect(dialogManager.openDialogs.length).toBe(1);

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/other');

    expect(dialogManager.openDialogs.length).toBe(1);
  });

  it('should only close dialogs with closeOnNavigation enabled', async () => {
    const template = fixture.componentInstance.dialog();
    const vcr = fixture.componentInstance.viewContainerRef;
    dialogManager.open(template, { viewContainerRef: vcr, closeOnNavigation: false });
    dialogManager.open(template, { viewContainerRef: vcr });

    expect(dialogManager.openDialogs.length).toBe(2);

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/other');

    expect(dialogManager.openDialogs.length).toBe(1);
    expect(dialogManager.openDialogs[0].config.closeOnNavigation).toBe(false);
  });
});

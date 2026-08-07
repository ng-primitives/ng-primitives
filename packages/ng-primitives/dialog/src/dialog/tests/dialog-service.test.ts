/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, TemplateRef, Type, ViewContainerRef, inject, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { render } from '@testing-library/angular';
import {
  NgpDialogContext,
  NgpDialogManager,
  NgpDialogRef,
  provideDialogConfig,
} from 'ng-primitives/dialog';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  const templateContext: TemplateRef<NgpDialogContext> | Type<unknown> = TestDialog;
  const ref0 = dialog.open(templateContext);
  ref0.close();

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
    dialog = TestBed.inject(NgpDialogManager);
  });

  afterEach(() => {
    dialog.closeAll();
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

  it('should emit result through the closed subject', async () => {
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

  it('should open a dialog with a result type but no data', async () => {
    const ref = dialog.open<void, number>(TestDialog);
    expect(ref).toBeInstanceOf(NgpDialogRef);

    const closedPromise = new Promise<{ result?: number }>(resolve => {
      ref.closed.subscribe(resolve);
    });

    ref.close(42);
    const result = await closedPromise;
    expect(result.result).toBe(42);
  });

  it('should open a dialog with a result type and config but no data', async () => {
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
  let view: Awaited<ReturnType<typeof render<DialogTestComponent>>>;

  beforeEach(async () => {
    view = await render(DialogTestComponent, {
      providers: [provideRouter([{ path: '**', component: DialogTestComponent }])],
    });
    dialogManager = TestBed.inject(NgpDialogManager);
  });

  afterEach(() => {
    dialogManager.closeAll();
  });

  it('should close the dialog on route navigation', async () => {
    const template = view.fixture.componentInstance.dialog();
    const vcr = view.fixture.componentInstance.viewContainerRef;
    dialogManager.open(template, { viewContainerRef: vcr });

    expect(dialogManager.openDialogs.length).toBe(1);

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/other');

    expect(dialogManager.openDialogs.length).toBe(0);
  });

  it('should not close the dialog when closeOnNavigation is false', async () => {
    const template = view.fixture.componentInstance.dialog();
    const vcr = view.fixture.componentInstance.viewContainerRef;
    dialogManager.open(template, { viewContainerRef: vcr, closeOnNavigation: false });

    expect(dialogManager.openDialogs.length).toBe(1);

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/other');

    expect(dialogManager.openDialogs.length).toBe(1);
  });

  it('should only close dialogs with closeOnNavigation enabled', async () => {
    const template = view.fixture.componentInstance.dialog();
    const vcr = view.fixture.componentInstance.viewContainerRef;
    dialogManager.open(template, { viewContainerRef: vcr, closeOnNavigation: false });
    dialogManager.open(template, { viewContainerRef: vcr });

    expect(dialogManager.openDialogs.length).toBe(2);

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/other');

    expect(dialogManager.openDialogs.length).toBe(1);
    expect(dialogManager.openDialogs[0].config.closeOnNavigation).toBe(false);
  });
});

describe('NgpDialogManager container', () => {
  let container: HTMLElement;
  let siblingContainer: HTMLElement;
  let sibling: HTMLElement;
  let liveRegion: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'ngp-dialog-container';
    document.body.appendChild(container);

    siblingContainer = document.createElement('div');
    document.body.appendChild(siblingContainer);

    sibling = document.createElement('div');
    document.body.appendChild(sibling);

    liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    document.body.appendChild(liveRegion);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    container.remove();
    siblingContainer.remove();
    sibling.remove();
    liveRegion.remove();
  });

  /** The element the dialog portal was attached to. */
  function hostOf(ref: NgpDialogRef): HTMLElement | null | undefined {
    return ref.getElements()[0]?.parentElement;
  }

  it('should render the dialog in the body by default', () => {
    const dialog = TestBed.inject(NgpDialogManager);
    const ref = dialog.open(TestDialog);

    expect(hostOf(ref)).toBe(document.body);
    ref.close();
  });

  it('should render the dialog in a container element', () => {
    const dialog = TestBed.inject(NgpDialogManager);
    const ref = dialog.open(TestDialog, { container });

    expect(container.textContent).toContain('Test');
    ref.close();
  });

  it('should render the dialog in a container resolved from a selector', () => {
    const dialog = TestBed.inject(NgpDialogManager);
    const ref = dialog.open(TestDialog, { container: '#ngp-dialog-container' });

    expect(container.textContent).toContain('Test');
    ref.close();
  });

  it('should fall back to the body when the container selector does not match', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const dialog = TestBed.inject(NgpDialogManager);
    const ref = dialog.open(TestDialog, { container: '#does-not-exist' });

    expect(hostOf(ref)).toBe(document.body);
    expect(warn).toHaveBeenCalled();

    ref.close();
  });

  it('should render the dialog in the body when the container is null', () => {
    const dialog = TestBed.inject(NgpDialogManager);
    const ref = dialog.open(TestDialog, { container: null });

    expect(hostOf(ref)).toBe(document.body);
    ref.close();
  });

  it('should render the dialog in the container from the global configuration', () => {
    TestBed.configureTestingModule({
      providers: [provideDialogConfig({ container: '#ngp-dialog-container' })],
    });

    const dialog = TestBed.inject(NgpDialogManager);
    const ref = dialog.open(TestDialog);

    expect(container.textContent).toContain('Test');
    ref.close();
  });

  it('should not hide the container from assistive technology', () => {
    const dialog = TestBed.inject(NgpDialogManager);
    const ref = dialog.open(TestDialog, { container });

    expect(container.hasAttribute('aria-hidden')).toBe(false);
    expect(sibling.getAttribute('aria-hidden')).toBe('true');

    ref.close();

    expect(sibling.hasAttribute('aria-hidden')).toBe(false);
  });

  it('should not hide live regions from assistive technology', () => {
    const dialog = TestBed.inject(NgpDialogManager);
    const ref = dialog.open(TestDialog, { container });

    expect(liveRegion.hasAttribute('aria-hidden')).toBe(false);
    ref.close();
  });

  it('should keep both dialogs accessible when they open into sibling containers', () => {
    const dialog = TestBed.inject(NgpDialogManager);

    const first = dialog.open(TestDialog, { container });
    expect(siblingContainer.getAttribute('aria-hidden')).toBe('true');

    // The second container was hidden on behalf of the first dialog, opening into it must
    // recompute the hidden set rather than leave the new dialog inside an aria-hidden subtree.
    const second = dialog.open(TestDialog, { container: siblingContainer });

    expect(container.hasAttribute('aria-hidden')).toBe(false);
    expect(siblingContainer.hasAttribute('aria-hidden')).toBe(false);
    expect(sibling.getAttribute('aria-hidden')).toBe('true');

    second.close();

    expect(siblingContainer.getAttribute('aria-hidden')).toBe('true');
    expect(container.hasAttribute('aria-hidden')).toBe(false);

    first.close();

    expect(sibling.hasAttribute('aria-hidden')).toBe(false);
    expect(siblingContainer.hasAttribute('aria-hidden')).toBe(false);
  });
});

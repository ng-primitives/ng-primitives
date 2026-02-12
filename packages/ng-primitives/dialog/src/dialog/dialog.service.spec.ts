/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgpDialogRef } from './dialog-ref';
import { NgpDialogManager } from './dialog.service';

@Component({ selector: 'ngp-test-dialog', template: '<p>Test</p>' })
class TestDialog {}

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
});

import '@analogjs/vitest-angular/setup-snapshots';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';
import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { installVitestDomPolyfills } from './test-dom-polyfills';

setupTestBed({
  browserMode: true,
});

// In zoneless mode, plain TS property mutations don't mark views dirty, so
// fixture.detectChanges() skips the update pass but checkNoChanges still fires,
// causing NG0100. Always marking for check before detectChanges ensures the
// update pass runs, matching zone-based test behavior.
const _origDetectChanges = ComponentFixture.prototype.detectChanges;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
ComponentFixture.prototype.detectChanges = function (
  this: ComponentFixture<any>,
  checkNoChanges?: boolean,
) {
  this.changeDetectorRef.markForCheck();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const result = (_origDetectChanges as Function).call(this, checkNoChanges);
  // Flush afterRenderEffect so attrBinding/dataBinding attributes (aria-*, data-*)
  // are applied synchronously after each detectChanges call.
  TestBed.flushEffects();
  return result;
};

installVitestDomPolyfills(() => vi.fn());

// Disable CSS transitions and animations so overlay enter/exit states resolve instantly
const style = document.createElement('style');
style.textContent =
  '*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important; }';
document.head.appendChild(style);

// With destroyAfterEach: false (browser mode), portal content appended to document.body
// is not cleaned up between tests. Flush microtasks so async portal.detach() completes,
// then forcefully remove any leftover overlay elements.
afterEach(async () => {
  await Promise.resolve();
  document.querySelectorAll('[data-overlay]').forEach(el => el.remove());
});

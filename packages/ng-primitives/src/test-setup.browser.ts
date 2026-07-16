/**
 * Setup for tests that intentionally exercise native browser behavior.
 *
 * Do not mock observers, computed styles, animations, or other browser APIs in
 * this file. These tests run in Chromium through Playwright specifically to use
 * the real implementations.
 */
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';
import '@analogjs/vitest-angular/setup-zone';
import '@angular/compiler';
import '@testing-library/jest-dom/vitest';
import 'zone.js';
import 'zone.js/testing';

setupTestBed({
  zoneless: false,
});

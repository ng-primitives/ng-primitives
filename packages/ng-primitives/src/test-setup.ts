import '@angular/compiler';
import '@analogjs/vitest-angular/setup-snapshots';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

setupTestBed({ zoneless: true });

// patch the getAnimations function to return an empty array
// as this doesn't work in jsdom environment - and we don't need animations for tests
Element.prototype.getAnimations = () => [];

// patch ResizeObserver to avoid errors in tests
global.ResizeObserver = class {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  observe() {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  unobserve() {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect() {}
};

// patch scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

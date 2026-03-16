import '@angular/compiler';
import '@testing-library/jest-dom/vitest';
import '@analogjs/vitest-angular/setup-zone';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

setupTestBed({ zoneless: false });

// patch the getAnimations function to return an empty array
// as this doesn't work in the test environment - and we don't need animations for tests
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

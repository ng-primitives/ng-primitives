import '@analogjs/vitest-angular/setup-zone';
import '@angular/compiler';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());

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

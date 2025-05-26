import '@testing-library/jest-dom';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

// patch the getAnimations function to return an empty array
// as this doesn't work in Jest environment - and we don't need animations for tests
Element.prototype.getAnimations = () => [];

// patch ResizeObserver to avoid errors in tests
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// patch scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

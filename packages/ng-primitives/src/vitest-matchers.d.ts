/// <reference types="@testing-library/jest-dom" />

// Re-augment vitest's Assertion interface with @testing-library/jest-dom
// matchers (toBeInTheDocument, toHaveAttribute, toHaveTextContent, etc.).
//
// The runtime augmentation is registered by `test-setup.vitest.ts` via
// `import '@testing-library/jest-dom/vitest'`, but the TypeScript Language
// Server in some editors does not pick up that side-effect import when
// type-checking individual test files. This ambient declaration is included
// by `tsconfig.vitest.json` (via the `**/*.d.ts` glob) so the matcher types
// are visible to every `*.test.ts` regardless of which file the IDE has open.

import 'vitest';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends TestingLibraryMatchers<unknown, T> {}
  interface AsymmetricMatchersContaining
    extends TestingLibraryMatchers<unknown, unknown> {}
}

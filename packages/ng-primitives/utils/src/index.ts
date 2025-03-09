/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export { injectDisposables } from './helpers/disposables';
export { uniqueId } from './helpers/unique-id';
export { onBooleanChange, onChange, onFormControlChange } from './signals/async';
export { injectDimensions } from './ui/dimensions';

/**
 * Publically expose the `provideNgpInjector` function.
 */
export { provideNgpInjector } from 'ng-primitives/internal';

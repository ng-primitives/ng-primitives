/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface ButtonGeneratorSchema {
  name: string;
  prefix: string;
  directory: string;
  style: 'css' | 'scss';
  inlineStyle: boolean;
  inlineTemplate: boolean;
}

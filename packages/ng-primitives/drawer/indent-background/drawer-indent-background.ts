import { DestroyRef, Directive, inject } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { bindDrawerIndentVisuals } from '../internal/indent-visuals';
import { injectDrawerProviderState } from '../internal/provider-state';

@Directive({ selector: '[ngpDrawerIndentBackground]', standalone: true })
export class NgpDrawerIndentBackground {
  constructor() {
    const provider = injectDrawerProviderState({ optional: true })();
    bindDrawerIndentVisuals(injectElementRef(), provider, inject(DestroyRef));
  }
}

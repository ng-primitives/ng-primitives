import { ExistingProvider, Type } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * A simple helper function to provide a value accessor for a given type.
 * @param type The type to provide the value accessor for
 */
export function provideValueAccessor<T>(type: Type<T>): ExistingProvider {
  return { provide: NG_VALUE_ACCESSOR, useExisting: type, multi: true };
}

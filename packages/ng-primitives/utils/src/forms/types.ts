import { AbstractControl } from '@angular/forms';
import { FieldTree } from '@angular/forms/signals';

/**
 * A utility type for Angular's onChange function.
 */
export type ChangeFn<T> = (value: T) => void;

/**
 * A utility type for Angular's onTouched function.
 */
export type TouchedFn = () => void;

/**
 * The handled form types
 */
export type FormFieldSource<T = unknown> = AbstractControl<T> | FieldTree<T>;

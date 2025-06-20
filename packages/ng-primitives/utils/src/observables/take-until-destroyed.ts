/* eslint-disable @nx/workspace-take-until-destroyed */
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, MonoTypeOperatorFunction, NEVER, pipe } from 'rxjs';
import { catchError, defaultIfEmpty, takeUntil } from 'rxjs/operators';

/**
 * The built-in `takeUntilDestroyed` operator does not handle the case when the component is destroyed before the source observable emits.
 * This operator ensures that the source observable completes gracefully without throwing an error.
 * https://github.com/angular/angular/issues/54527#issuecomment-2098254508
 * 
 * @internal
 */
export function safeTakeUntilDestroyed<T>(destroyRef?: DestroyRef): MonoTypeOperatorFunction<T> {
  return pipe(
    takeUntil(
      NEVER.pipe(
        takeUntilDestroyed(destroyRef),
        catchError(() => EMPTY),
        defaultIfEmpty(null),
      ),
    ),
  );
}

import { ElementRef, inject } from '@angular/core';
import { fromEvent, interval, merge, timer } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  startWith,
  switchMap,
  takeUntil,
  withLatestFrom,
} from 'rxjs/operators';

export function setupPressAndHold() {
  const element = inject<ElementRef<HTMLButtonElement>>(ElementRef);

  const pointerDown$ = fromEvent<PointerEvent>(element.nativeElement, 'pointerdown');
  const pointerUp$ = fromEvent<PointerEvent>(document, 'pointerup');
  const pointerEnter$ = fromEvent<PointerEvent>(element.nativeElement, 'pointerenter').pipe(
    map(() => true),
  );
  const pointerLeave$ = fromEvent<PointerEvent>(element.nativeElement, 'pointerleave').pipe(
    map(() => false),
  );

  const isPointerInside$ = merge(pointerEnter$, pointerLeave$).pipe(
    startWith(true),
    distinctUntilChanged(),
  );

  return pointerDown$.pipe(
    switchMap(downEvent =>
      timer(400).pipe(
        takeUntil(pointerUp$), // Cancel delay if user releases early
        switchMap(() =>
          interval(60).pipe(
            withLatestFrom(isPointerInside$),
            filter(([, inside]) => inside),
            map(() => downEvent), // Emit the original pointerdown event each time
            takeUntil(pointerUp$),
          ),
        ),
      ),
    ),
  );
}

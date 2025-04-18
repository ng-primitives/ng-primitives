import { effect, Signal, untracked, WritableSignal } from '@angular/core';

export function syncState<T>(source: Signal<T>, target: WritableSignal<T>) {
  effect(() => {
    const sourceValue = source();
    untracked(() => target.set(sourceValue));
  });
}

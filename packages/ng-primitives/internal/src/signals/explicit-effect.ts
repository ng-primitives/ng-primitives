/**
 * This implementation is heavily inspired by the great work on ngextension!
 * https://github.com/ngxtension/ngxtension-platform/blob/main/libs/ngxtension/explicit-effect/src/explicit-effect.ts
 */
import {
  CreateEffectOptions,
  EffectCleanupRegisterFn,
  EffectRef,
  effect,
  untracked,
} from '@angular/core';

/**
 * We want to have the Tuple in order to use the types in the function signature
 */
type ExplicitEffectValues<T> = {
  [K in keyof T]: () => T[K];
};

/**
 * This explicit effect function will take the dependencies and the function to run when the dependencies change.
 * @param deps - The dependencies that the effect will run on
 * @param fn - The function to run when the dependencies change
 * @param options - The options for the effect with the addition of defer (it allows the computation to run on first change, not immediately)
 */
export function explicitEffect<Input extends readonly unknown[], Params = Input>(
  deps: readonly [...ExplicitEffectValues<Input>],
  fn: (deps: Params, onCleanup: EffectCleanupRegisterFn) => void,
  options?: CreateEffectOptions,
): EffectRef {
  return effect(onCleanup => {
    const depValues = deps.map(s => s());
    untracked(() => fn(depValues as Params, onCleanup));
  }, options);
}

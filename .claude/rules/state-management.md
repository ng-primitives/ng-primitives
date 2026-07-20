# State Management Pattern

> **Scaffold first.** Do not hand-write `-state.ts` files. Generate the directive
> and its state with `nx g @ng-primitives/tools:directive <name> <primitive>`
> (`addState` defaults true), or add state to an existing directive with
> `nx g @ng-primitives/tools:state <directive> <primitive>`. See the Nx
> Generators section in `CLAUDE.md`. The rules below describe what the generated
> code should look like when you fill it in.

Every primitive and every **part** of a primitive (container, input, toggle,
item, option, trigger, etc.) follows the same `createPrimitive` state pattern.
This is the current pattern - do **not** use the older
`createStateToken`/`createStateProvider`/`createStateInjector`/`createState`
quadruple (only legacy primitives like `search` still use it).

## Each part gets a `<name>-state.ts`

The state file owns the logic. It calls `createPrimitive` and returns the
4-tuple `[Token, factory, injectFn, provideFn]`:

```ts
export const [NgpToggleStateToken, ngpToggle, injectToggleState, provideToggleState] =
  createPrimitive('NgpToggle', (props: NgpToggleProps): NgpToggleState => {
    const element = injectElementRef<HTMLElement>();
    // ...all host bindings and listeners live HERE, inside the factory...
    return {
      /* NgpToggleState */
    } satisfies NgpToggleState;
  });
```

Export from the barrel: the directive **and** `injectXState`, `ngpX`,
`NgpXProps`, `NgpXState`, `provideXState`.

## All host bindings live in the factory, not the directive

Use `attrBinding`, `dataBinding`, `styleBinding`, and `listener` from
`ng-primitives/state` **inside the factory**. Directives must not carry `host: {}`
bindings or wire listeners themselves - the factory runs in the correct
injection/render context and keeps every part consistent.

```ts
attrBinding(element, 'aria-pressed', selected);
dataBinding(element, 'data-selected', selected);
listener(element, 'click', () => toggle());
```

## The directive is a thin shell

It declares the inputs (with `ngp` aliases + coercion), lists `provideXState()`
in `providers`, registers the state at the **end** of the property block, and
exposes public methods that delegate to the state:

```ts
@Directive({
  selector: '[ngpToggle]',
  exportAs: 'ngpToggle',
  providers: [provideToggleState()],
})
export class NgpToggle {
  readonly selected = input(/* ... */);

  // registered last, after all inputs (avoid-early-state lint rule)
  protected readonly state = ngpToggle({ selected: this.selected /* ... */ });

  toggle(): void {
    this.state.toggle();
  }
}
```

Pass input **signals** to the factory (`selected: this.selected`) - never call
them (`this.selected()`), which the `prefer-state` lint rule forbids.

## Controlled vs uncontrolled state

- `controlledState({ value, defaultValue, onChange })` for two-way bindable
  state - returns `[signal, setter, changeObservable]`. Emit the local value
  through the output so parent bindings round-trip (`avoid-state-emit`).
- `controlled(inputSignal, defaultValue)` wraps an input in a writable
  `linkedSignal` for internal mutation that still tracks the input.
- **Only reach for `controlled`/`controlledState` when the factory itself
  mutates the value.** A read-only input that the part just reflects, or that
  child parts read, is passed straight through as a `Signal` - bind it
  (`attrBinding(element, 'aria-valuemin', min)`) and return it (`return { min }`)
  unchanged. Wrapping an input in `controlled` when nothing ever calls `.set()`
  on it is misleading and adds a needless `linkedSignal`. Grep the factory for
  `.set(` on the signal before wrapping it. (`progress` wraps `value`/`min`/`max`
  only because it exposes deprecated `setValue`/`setMin`/`setMax` setters;
  `meter`, which has none, passes them through read-only.)

## Return only what other parts read

The object the factory returns is the part's inter-part / public API, exposed via
`injectXState()`. Return only what another part or the directive actually
consumes. A value used **solely** for the factory's own bindings - e.g. a clamped
`valueNow` bound once to `aria-valuenow`, or an internal `labelId` signal - stays
a local `const`/`signal` inside the factory and is **not** put on the state
interface.

## Compose state functions to reuse behaviour

State factories call other state factories - this is how parts inherit
behaviour rather than reimplementing it. `ngpInput` composes `ngpFormControl`,
`ngpInteractions`, and `ngpAutofill`; `ngpToggleGroupItem` composes
`ngpRovingFocusItem`; `ngpPasswordInput` composes `ngpInput`. If a new part
needs the behaviour of an existing primitive, call its `ngpX({...})` factory and
return/extend its state instead of duplicating bindings.

## Child parts register with the parent through functions, not raw signals

A part that feeds something back to its container - a label id, a focusable item,
an option - does so by calling a **dedicated function on the parent state**, never
by mutating a signal the parent returned. Expose a paired `setX`/`removeX` (or
`register`/`unregister`) on the parent, keep the backing signal private to the
factory, and register/deregister from the child with `onChange` + `onDestroy`:

```ts
// parent -state.ts — labelId stays private; only the functions are returned
const labelId = signal<string | undefined>(undefined);
function setLabel(id: string): void {
  labelId.set(id);
}
function removeLabel(id: string): void {
  // only clear if this child is still the active one, so a newer child that has
  // taken over isn't clobbered when an old one is torn down
  if (labelId() === id) {
    labelId.set(undefined);
  }
}
attrBinding(element, 'aria-labelledby', () => labelId() ?? null);
return { setLabel, removeLabel } satisfies NgpXState;

// child -state.ts — register reactively, and always deregister on teardown
onChange(id, (current, previous) => {
  if (previous) {
    state().removeLabel(previous);
  }
  state().setLabel(current);
});
onDestroy(() => state().removeLabel(id()));
```

A child that pokes `state().labelId.set(...)` directly bypasses the guard and
forgets to deregister, leaving a stale `aria-labelledby`/`aria-describedby`
pointing at DOM that has been removed. `dialog` (`setLabelledBy`/`removeLabelledBy`),
`roving-focus` (`register`/`unregister`) and `select` (`registerOption`/
`unregisterOption`) all follow this. `onChange` fires with the initial value **and**
every change; `onDestroy` (from `ng-primitives/state`) handles teardown.

## `@internal`

Mark `injectX`/`registerX`-style members that are public on the state interface
but not for consumers with `@internal`. Do **not** put `@internal` on the
`protected readonly state` field or any private/protected member - they are
already excluded from the public API (see `angular-patterns.md`).

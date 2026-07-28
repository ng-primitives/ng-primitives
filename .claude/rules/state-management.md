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

### Two-way value inputs: `value` + `defaultValue`

When a value input has a matching `*Change` output (a `[(ngpXValue)]` two-way
binding), reach for `controlledState` rather than `controlled`, so
controlled/uncontrolled mode **latches** correctly. `controlled` (a plain
`linkedSignal`) does **not** latch - an internal `.set()` wins until the input
next emits - so a value the consumer binds one-way and never writes back would
drift on interaction. `controlledState` keeps a controlled value pinned to its
binding and only mutates internal state in uncontrolled mode. `checkbox`,
`toggle-group`, `switch`, `slider`, `listbox` and the `color` primitives follow
this. Four rules make it work:

**1. The value input defaults to `undefined`; add a sibling `default*` input.**
`controlledState` decides controlled vs uncontrolled by whether `value()` is
`undefined`, so the value input can't default to a concrete value - give the
uncontrolled initial value its own input.

```ts
// directive — NOT `input<T>(SOME_DEFAULT, ...)`, or it is always controlled
readonly value = input<T | undefined>(undefined, { alias: 'ngpXValue' });
readonly defaultValue = input<T>(SOME_DEFAULT, { alias: 'ngpXDefaultValue' });
```

A coercion transform must **preserve `undefined`**, or it destroys the sentinel
rule 1 depends on. `numberAttribute(undefined)` is `NaN` and
`booleanAttribute(undefined)` is `false` - both are concrete values, so a
runtime-undefined binding (`[ngpXValue]="maybeUndef()"`) would latch the part
into controlled mode with a bogus value instead of staying uncontrolled. Never
put a bare `transform: numberAttribute` / `transform: booleanAttribute` on a
two-way value input; use the `coerceNumberOrUndefined` /
`coerceBooleanOrUndefined` helpers from `ng-primitives/utils`, which pass
`undefined` straight through and coerce everything else as usual. (This only
applies to number/boolean inputs - a generic-typed value like `listbox`'s or
`toggle-group`'s has no transform and already passes `undefined` through.)

```ts
import { coerceNumberOrUndefined } from 'ng-primitives/utils';

readonly value = input<number | undefined, NumberInput>(undefined, {
  alias: 'ngpXValue',
  transform: coerceNumberOrUndefined, // preserve undefined (uncontrolled)
});
```

**2. Feed the optional default through `controlled(_default, fallback)`.**
`controlledState`'s `defaultValue` needs a `Signal<T>`, but the input is
optional. `controlled(_defaultValue, <concrete default>)` converts
optional → required-with-fallback. This is the one sanctioned case where
`controlled` wraps a value the factory itself never `.set()`s (see the rule
above) - it exists to supply the fallback, and is paired with a `setDefault*`
(rule 3) so there is still a real mutation path.

```ts
const defaultValue = controlled(_defaultValue, SOME_DEFAULT);
const [value, setValue, valueChange] = controlledState<T>({
  value: _value,
  defaultValue,
  onChange: onValueChange,
});
```

**3. Expose the value via `deprecatedSetter`, and expose `setDefault*` too.**
Return `value: deprecatedSetter(value, 'setValue', setValue)` so a direct
`.set()` warns and routes through the setter, plus `setValue` and
`setDefaultValue: defaultValue.set`. Expose the `setDefault*` consistently -
every primitive with a `default*` input also exposes its setter.

**4. When the emit is bespoke, use `controlledState` for latching only.** If a
part has its own emit choreography that `controlledState`'s change-gated emit
can't express (e.g. `number-field`'s silent input-commit, or a `string`-typed
output over a `string | null` value), keep a manual `emitter`, call the setter
with `{ emit: false }`, and emit yourself.

```ts
const [value, setValueInternal] = controlledState<T>({ value: _value, defaultValue });
const valueChange = emitter<T>();
function setValue(next: T): void {
  setValueInternal(next, { emit: false }); // controlledState only handles latching
  onValueChange?.(next);
  valueChange.emit(next);
}
```

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

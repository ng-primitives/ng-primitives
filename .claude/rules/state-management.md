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

## Compose state functions to reuse behaviour

State factories call other state factories - this is how parts inherit
behaviour rather than reimplementing it. `ngpInput` composes `ngpFormControl`,
`ngpInteractions`, and `ngpAutofill`; `ngpToggleGroupItem` composes
`ngpRovingFocusItem`; `ngpPasswordInput` composes `ngpInput`. If a new part
needs the behaviour of an existing primitive, call its `ngpX({...})` factory and
return/extend its state instead of duplicating bindings.

## `@internal`

Mark `injectX`/`registerX`-style members that are public on the state interface
but not for consumers with `@internal`. Do **not** put `@internal` on the
`protected readonly state` field or any private/protected member - they are
already excluded from the public API (see `angular-patterns.md`).

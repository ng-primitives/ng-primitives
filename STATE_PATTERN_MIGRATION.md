# State Pattern Migration Guide

This document provides a comprehensive guide for migrating ng-primitives directives to the new state pattern architecture.

## Overview

The ng-primitives project is migrating from a traditional directive-based architecture to a new state pattern that provides better separation of concerns, testability, and reusability. The state pattern separates the logic (state) from the presentation (directive).

## Generator Command

Use this command to generate state boilerplate:

```bash
nx g @ng-primitives/tools:state --directive=<name> --primitive=<primitive-name>
```

## Migration Process

### 1. Create State File

The state file contains all the logic, host bindings, and methods that were previously in the directive. We must create a new state file for each directive - previously only some directives had separate state files. Legacy state files and exports from the state file should be removed before creating the new state file.

**File naming pattern:** `<component-name>-state.ts`

**Basic template:**

```typescript
import { createPrimitive, attrBinding, dataBinding, listener } from 'ng-primitives/state';
import { injectElementRef } from 'ng-primitives/internal';

export interface Ngp<ComponentName>State {
  // Define public API methods and readonly signals
}

export interface Ngp<ComponentName>Props {
  // Define input props (usually signals)
}

export const [
  Ngp<ComponentName>StateToken,
  ngp<ComponentName>,
  inject<ComponentName>State,
  provide<ComponentName>State,
] = createPrimitive(
  'Ngp<ComponentName>',
  ({ /* props destructured here */ }: Ngp<ComponentName>Props) => {
    const element = injectElementRef();

    // Host bindings using helper functions
    attrBinding(element, 'attribute-name', 'value');
    dataBinding(element, 'data-attribute', 'value');
    styleBinding(element, 'width.px', 100);

    // Event listeners
    listener(element, 'click', handleClick);

    // Methods
    function handleClick() {
      // logic here
    }

    // Return public API
    return {
      // methods and signals to expose
    };
  }
);
```

### 2. Migrate Host Bindings

Transform Angular host bindings to state pattern bindings:

**Before (directive):**

```typescript
@Directive({
  host: {
    '[attr.role]': '"navigation"',
    '[attr.aria-expanded]': 'open()',
    '[attr.data-orientation]': 'orientation()',
    '[id]': 'id()',
  }
})
```

**After (state):**

```typescript
// In the createPrimitive function
attrBinding(element, 'role', 'navigation');
attrBinding(element, 'aria-expanded', open);
dataBinding(element, 'data-orientation', orientation);
attrBinding(element, 'id', id);
```

### 3. Migrate Event Listeners

Transform HostListener decorators to listener function calls:

**Before (directive):**

```typescript
@HostListener('click')
onClick() {
  this.toggle();
}
```

**After (state):**

```typescript
// In the createPrimitive function
listener(element, 'click', toggle);

function toggle() {
  // toggle logic
}
```

### 4. Update the Directive

The directive becomes a thin wrapper that:

1. Provides the state
2. Calls the state factory function
3. Exposes public methods by delegating to state

**Before:**

```typescript
@Directive({
  selector: '[ngpComponent]',
  exportAs: 'ngpComponent',
  host: {
    role: 'navigation',
    '[attr.aria-expanded]': 'open()',
  },
})
export class NgpComponent {
  readonly open = input<boolean>(false);

  @HostListener('click')
  toggle() {
    // logic here
  }
}
```

**After:**

```typescript
@Directive({
  selector: '[ngpComponent]',
  exportAs: 'ngpComponent',
  providers: [provideComponentState()],
})
export class NgpComponent {
  readonly open = input<boolean>(false);

  private readonly state = ngpComponent({ open: this.open });

  toggle(): void {
    this.state.toggle();
  }
}
```

### 5. Key Migration Patterns

#### State Injection Between Components

This is only used for cases where a child may optionally inherit state from a parent state of the same type.

```typescript
// Inject parent state
const parentState = injectParentState<T>();

// Inject with optional/deferred loading
const parentState = injectParentState<T>({ hoisted: true });
```

#### Input Signal Handling

```typescript
// Convert input signals to writable signals in props
export interface NgpComponentProps {
  readonly disabled?: Signal<boolean>;
  readonly value?: Signal<string>;
}

// In directive, pass input signals directly
private readonly state = ngpComponent({
  disabled: this.disabled,
  value: this.value,
});
```

#### Complex Binding Values

```typescript
// For computed/reactive values
dataBinding(element, 'data-disabled', () => disabled() || parentDisabled());

// For conditional attributes
attrBinding(element, 'type', tagName === 'button' ? 'button' : null);
```

#### Method Delegation

```typescript
// In directive, delegate public methods to state
toggle(): void {
  this.state.toggle();
}

// State handles the actual logic
function toggle(): void {
  if (disabled()) return;
  open.set(!open());
}
```

## Available State Utilities

### Binding Functions

- `attrBinding(element, attr, value)` - Bind attributes
- `dataBinding(element, attr, value)` - Bind data attributes
- `styleBinding(element, style, value)` - Bind styles
- `listener(element, event, handler)` - Add event listeners

### State Management

- `createPrimitive(name, factory)` - Create state pattern
- `injectInheritedState(token)` - Inject parent state
- `controlled(signal)` - Create controlled signal

### Utilities

- `onDestroy(callback)` - Register cleanup callbacks
- `deprecatedSetter(signal, methodName)` - Mark setters as deprecated. This is for cases where we want to discourage direct mutation of signals that used to be possible, but now have a set method on the state.

## File Structure Changes

### Before Migration

```
component/
├── component.ts              # Directive with all logic
└── index.ts                  # Exports
```

### After Migration

```
component/
├── component-state.ts        # State logic and bindings
├── component.ts              # Thin directive wrapper
└── index.ts                  # Exports both files
```

## Common Migration Examples

### Simple Component (Breadcrumbs)

```typescript
// breadcrumbs-state.ts
export const [
  NgpBreadcrumbsStateToken,
  ngpBreadcrumbs,
  injectBreadcrumbsState,
  provideBreadcrumbsState,
] = createPrimitive('NgpBreadcrumbs', ({}: NgpBreadcrumbsProps) => {
  const element = injectElementRef();
  attrBinding(element, 'role', 'navigation');
  return {};
});

// breadcrumbs.ts
@Directive({
  selector: '[ngpBreadcrumbs]',
  exportAs: 'ngpBreadcrumbs',
  providers: [provideBreadcrumbsState()],
})
export class NgpBreadcrumbs {
  constructor() {
    ngpBreadcrumbs({});
  }
}
```

### Complex Component with Interactions (Accordion Trigger)

```typescript
// accordion-trigger-state.ts
export const [
  NgpAccordionTriggerStateToken,
  ngpAccordionTrigger,
  injectAccordionTriggerState,
  provideAccordionTriggerState,
] = createPrimitive(
  'NgpAccordionTrigger',
  ({ id = signal(uniqueId('ngp-accordion-trigger')) }: NgpAccordionTriggerProps) => {
    const element = injectElementRef();
    const accordion = injectAccordionState();
    const accordionItem = injectAccordionItemState();

    // Host bindings
    attrBinding(element, 'id', id);
    attrBinding(element, 'aria-expanded', accordionItem().open);
    dataBinding(element, 'data-open', accordionItem().open);

    function toggle(): void {
      if (accordionItem().disabled()) return;
      accordion().toggle(accordionItem().value());
    }

    listener(element, 'click', toggle);

    return { id, toggle };
  },
);

// accordion-trigger.ts
@Directive({
  selector: '[ngpAccordionTrigger]',
  exportAs: 'ngpAccordionTrigger',
})
export class NgpAccordionTrigger {
  readonly id = input<string>(uniqueId('ngp-accordion-trigger'));
  private readonly state = ngpAccordionTrigger({ id: this.id });

  toggle(): void {
    this.state.toggle();
  }
}
```

## State Interface

The state should only return things that are part of the public API (methods and readonly signals). Inputs should be defined in the Props interface. Not everything in the state needs to be exposed.

```typescript
export interface NgpComponentState {
  readonly isOpen: Signal<boolean>;
  toggle(): void;
}
export interface NgpComponentProps {
  readonly open?: Signal<boolean>;
}
```

Its important that both state and props always have JSDoc comments for better documentation generation.

```typescript
export interface NgpComponentState {
  /**
   * Indicates if the component is open.
   */
  readonly isOpen: Signal<boolean>;
  /**
   * Toggles the open state of the component.
   */
  toggle(): void;
}

export interface NgpComponentProps {
  /**
   * Initial open state of the component.
   */
  readonly open?: Signal<boolean>;
}
```

## State with generic types

When creating state for components that use generic types, ensure that the generic type is passed through the state factory and injection functions. This works fine for the factory function, but requires explicit typing for the injection function.

```typescript
export const [
  NgpSelectStateToken,
  ngpSelect,
  _injectSelectState,
  provideSelectState,
] = createPrimitive(
  'NgpSelect',
  <T>({ items = signal<T[]>([]) }: NgpSelectProps<T>) => {
...
  }
);

export function injectSelectState<T>(): NgpSelectState<T> {
  return _injectSelectState<T>();
}
```

## Internal state

Sometimes a state file may need to change the value of a prop internally. In these cases, we can use the `controlled` utility to create a writable signal from a prop signal.

```typescript
export const [NgpComponentStateToken, ngpComponent, injectComponentState, provideComponentState] =
  createPrimitive('NgpComponent', ({ value: _value = signal<string>('') }: NgpComponentProps) => {
    const value = controlled(value);
    function setValue(newValue: string): void {
      value.set(newValue);
    }
    return { value, setValue };
  });
```

## Composing states

Sometime a state may need to use functionality from another state. If this is something like interactions, e.g.
`ngpInteractions` or something where we do not need a provider this can be added in the state factory directly.
However if this is a state that requires a provider, for example, `ngpRovingFocusGroup` then it should be created in the directive and passed into the state factory as a prop if the state needs to call methods on it.

## Migration Checklist

- [ ] Generate state boilerplate with `nx g @ng-primitives/tools:state`
- [ ] Move all host bindings to state using binding helpers
- [ ] Move all HostListener methods to state using listener helper
- [ ] Move all logic and methods to state factory function
- [ ] Update directive to be a thin wrapper with state provider
- [ ] Update directive to call state factory in constructor
- [ ] Delegate all public methods to state methods
- [ ] Update index.ts to export both state and directive
- [ ] Test the migration works correctly - run `nx test ng-primitives` and verify builds:
  - `nx build ng-primitives`
  - `nx build components`
- [ ] Remove old host binding and HostListener code from directive

## Best Practices

1. **Keep directives thin** - Only handle input/output binding and method delegation
2. **Put all logic in state** - Host bindings, event handlers, business logic
3. **Use proper typing** - Define clear interfaces for State and Props
4. **Handle parent-child relationships** - Use injection functions for component hierarchies
5. **Test thoroughly** - Ensure all functionality works after migration
6. **Follow naming conventions** - Use established patterns for consistency

This migration pattern provides better testability, reusability, and separation of concerns while maintaining the same public API for consumers.

```

```

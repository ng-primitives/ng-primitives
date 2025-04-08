---
name: Usage
order: 4
icon: phosphorLightbulbDuotone
---

# Usage

Angular Primitives are built entirely using Angular directives, offering a flexible and composable way to enhance your components.

There are two main ways to use them:

- Apply the directives directly in your component templates.
- Use the directives as **host directives** in your own components.

Let’s explore both approaches, along with some limitations and the solutions we provide.

---

## Using Directives in Templates

To use a directive in a template, simply apply it to the element you want to enhance. For example, here’s how you might use the `ngpSwitch` directive:

```html
<button
  ngpSwitch
  [ngpSwitchChecked]="isChecked()"
  (ngpSwitchCheckedChange)="onSwitchChange($event)"
>
  <span ngpSwitchThumb></span>
</button>
```

This applies the `ngpSwitch` directive to the button, enabling correct behavior and accessibility. You have full control over the inputs and outputs, making this approach ideal for many use cases.

However, this method has a few limitations. Some directives — like `ngpButton` — are intended to be used on specific elements (e.g. `button`). Wrapping such elements in your own component can make it difficult for consumers to add attributes like `type`, since you'd need to expose every possible attribute as an input manually.

To solve this, you can use **host directives**.

## Using Directives as Host Directives

Host directives let you enhance your components by attaching existing directives at the class level. Here's how you can use `ngpButton` as a host directive:

```typescript
import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'button[my-button]',
  template: `
    <ng-content />
  `,
  hostDirectives: [NgpButton],
})
export class MyButtonComponent {
  // You can add any additional inputs or outputs you want here
}
```

This approach allows consumers to apply attributes directly to the `button` element while still benefiting from the functionality provided by the directive.

You can also expose specific inputs and outputs from the directive to your component. For example:

```typescript
import { Component, Input } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'button[my-button]',
  template: `
    <ng-content />
  `,
  hostDirectives: [{ directive: NgpButton, inputs: ['disabled'] }],
})
export class MyButtonComponent {
  readonly disabled = input<boolean>();
}
```

This lets consumers bind to the `disabled` input just as if they were using `ngpButton` directly.

## Limitations & Solutions

### Programmatically setting inputs

A key limitation of host directives in Angular is that their inputs can't be set programmatically within the component. To address this, we provide two main solutions:

#### Config Providers

Some directives support configuration providers that let you set default values. For example, to configure the default expansion type for `ngpAccordion`:

```typescript
@Component({
  selector: 'my-accordion',
  template: `
    <ng-content />
  `,
  hostDirectives: [{ directive: NgpAccordion, inputs: ['type'] }],
  providers: [provideAccordionConfig({ type: 'multiple' })],
})
export class MyAccordionComponent {}
```

Consumers can still override this default by explicitly binding to the `type` input.

#### State Providers

Other directives provide a **state provider**, allowing you to programmatically control their inputs. For example:

```typescript
import { Component } from '@angular/core';
import { NgpSwitch, injectSwitchState } from 'ng-primitives/switch';

@Component({
  selector: 'my-switch',
  template: `
    <ng-content />
  `,
  hostDirectives: [NgpSwitch],
})
export class MySwitchComponent {
  private readonly state = injectSwitchState();

  constructor() {
    this.state.checked.set(true);
  }
}
```

Internally, all directive inputs are converted into **linked signals**, enabling both binding and programmatic updates.

### Splitting into Multiple Components

Some features are best implemented as multiple components. Take an accordion, for example:

```html
<my-accordion>
  <my-accordion-item label="Item 1">
    <p>Content for item 1</p>
  </my-accordion-item>

  <my-accordion-item label="Item 2">
    <p>Content for item 2</p>
  </my-accordion-item>
</my-accordion>
```

If you're using `ngpAccordion` as a directive in the `my-accordion` template, the child `my-accordion-item` components won’t be able to locate it in the dependency injection tree. This is a known Angular limitation.

To solve this, Angular Primitives supports **state hoisting**, which allows you to share directive state between components.

#### State Hoisting Example

To hoist the state of `ngpAccordion` from the `my-accordion` component:

```typescript
import { Component } from '@angular/core';
import { NgpAccordion, provideAccordionState } from 'ng-primitives/accordion';

@Component({
  selector: 'my-accordion',
  template: `
    <div ngpAccordion>
      <ng-content />
    </div>
  `,
  providers: [provideAccordionState()],
})
export class MyAccordionComponent {}
```

Now, child directives like `ngpAccordionItem` can correctly locate and interact with the hoisted `ngpAccordion` state.

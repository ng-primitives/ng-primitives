# Angular Coding Patterns

## Signal-Based APIs (Required)

Always use the modern signal-based APIs instead of decorators:

- **Inputs**: Use `input()` instead of `@Input()`
- **Outputs**: Use `output()` instead of `@Output()`
- **View queries**: Use `viewChild()` / `viewChildren()` instead of `@ViewChild()` / `@ViewChildren()`
- **Content queries**: Use `contentChild()` / `contentChildren()` instead of `@ContentChild()` / `@ContentChildren()`

```ts
// ✅ Correct
readonly tooltip = input<TemplateRef<unknown>>();
readonly valueChange = output<number>();
readonly trigger = viewChild<ElementRef>('trigger');
readonly items = contentChildren(ItemDirective);

// ❌ Incorrect
@Input() tooltip: TemplateRef<unknown>;
@Output() valueChange = new EventEmitter<number>();
@ViewChild('trigger') trigger: ElementRef;
@ContentChildren(ItemDirective) items: QueryList<ItemDirective>;
```

## Signal Properties

- Always declare signal properties as `readonly` since the signal reference should never change
- Avoid `model()` - prefer explicit input/output pairs

```ts
// ✅ Correct
readonly isOpen = signal(false);
readonly position = signal<{ x: number; y: number } | null>(null);

// ❌ Incorrect
isOpen = signal(false);
position = signal<{ x: number; y: number } | null>(null);
```

## Computed and Effects

- Use `computed()` for derived state
- Use `effect()` sparingly and prefer explicit subscriptions when possible
- Computed signals should also be `readonly`

```ts
// ✅ Correct
readonly isDisabled = computed(() => this.disabled() || this.loading());

// ❌ Incorrect
isDisabled = computed(() => this.disabled() || this.loading());
```

## JSDoc @internal Tag

- Use `@internal` ONLY for **public** members that should not be used by consumers
- Do NOT use `@internal` on private or protected members (they are already not accessible)
- `@internal` is for documentation generation - it hides the member from public API docs

```ts
// ✅ Correct - public method that's internal implementation detail
/** @internal */
registerChild(child: NgpAccordionItem): void {
  this.children.push(child);
}

// ❌ Incorrect - private members don't need @internal
/** @internal */
private readonly state = ngpButton({ disabled: this.disabled });

// ✅ Correct - no JSDoc needed for private members
private readonly state = ngpButton({ disabled: this.disabled });
```

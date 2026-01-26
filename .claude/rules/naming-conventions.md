# Naming Conventions

## Selectors

- Use `ngp` prefix for all selectors (e.g., `ngpButton`, `ngpTooltipTrigger`)

## Class Names

- Use `Ngp` prefix with PascalCase
- Do NOT use suffixes like `Directive`, `Component`, `Service`
- Examples:
  - ✅ `NgpButton`
  - ❌ `NgpButtonDirective`
  - ✅ `NgpTooltipTrigger`
  - ❌ `NgpTooltipTriggerDirective`

## File Names

- Use kebab-case
- Omit `.directive` suffix for directive files
- Examples:
  - ✅ `button.ts`
  - ❌ `button.directive.ts`
  - ✅ `tooltip-trigger.ts`
  - ❌ `tooltip-trigger.directive.ts`

## Input Naming

- All inputs MUST have an alias with `ngp` prefix
- Alias format: `ngp` + ComponentName (without Ngp prefix) + PropertyName
- Examples:
  - ✅ `alias: 'ngpMeterValue'` for `NgpMeter.value`
  - ✅ `alias: 'ngpTooltipArrowPadding'` for `NgpTooltipArrow.padding`
  - ❌ `padding` without alias

```ts
// ✅ Correct
readonly value = input<number, NumberInput>(0, {
  alias: 'ngpMeterValue',
  transform: numberAttribute,
});

// ❌ Incorrect - missing alias
readonly value = input<number>();
```

## Input Coercion

- All `number` inputs MUST use coercion with `NumberInput` and `numberAttribute`
- All `boolean` inputs MUST use coercion with `BooleanInput` and `booleanAttribute`

```ts
import { NumberInput, BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, numberAttribute } from '@angular/core';

// ✅ Correct number input
readonly padding = input<number | undefined, NumberInput>(undefined, {
  alias: 'ngpTooltipArrowPadding',
  transform: numberAttribute,
});

// ✅ Correct boolean input
readonly disabled = input<boolean, BooleanInput>(false, {
  alias: 'ngpButtonDisabled',
  transform: booleanAttribute,
});

// ❌ Incorrect - missing coercion
readonly padding = input<number>();
readonly disabled = input<boolean>(false);
```

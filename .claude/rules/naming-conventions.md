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

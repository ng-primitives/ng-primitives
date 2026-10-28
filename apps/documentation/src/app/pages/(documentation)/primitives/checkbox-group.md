---
title: Checkbox Group | Angular Primitives
name: 'Checkbox Group'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/checkbox-group'
---

# Checkbox Group

Share an array value across a group of checkboxes.

<docs-example name="checkbox-group"></docs-example>

## Import

Import the Checkbox Group and Checkbox primitives.

```ts
import { NgpCheckbox } from 'ng-primitives/checkbox';
import { NgpCheckboxGroup } from 'ng-primitives/checkbox-group';
```

## Usage

Use `ngpCheckboxGroupDefaultValue` to initially check checkbox values. Use
`ngpCheckboxGroupValue` for controlled usage.

```html
<div ngpCheckboxGroup [ngpCheckboxGroupDefaultValue]="['email']">
  <span ngpCheckbox ngpCheckboxValue="email">Email</span>
  <span ngpCheckbox ngpCheckboxValue="sms">SMS</span>
</div>
```

## Parent Checkbox

Set `ngpCheckboxGroupAllValues` on the group and `ngpCheckboxParent` on a checkbox
to create a parent checkbox. It selects or clears all values and becomes indeterminate
when only some values are selected.

```html
<div
  ngpCheckboxGroup
  [ngpCheckboxGroupAllValues]="allValues"
  [ngpCheckboxGroupDefaultValue]="['email']"
>
  <span ngpCheckbox ngpCheckboxParent>All notifications</span>
  <span ngpCheckbox ngpCheckboxValue="email">Email</span>
  <span ngpCheckbox ngpCheckboxValue="sms">SMS</span>
</div>
```

<docs-example name="checkbox-group-parent"></docs-example>

## Nested Parent Checkbox

Checkbox groups can be nested. Coordinate the parent values when a nested group
represents one of the values in its outer group.

<docs-example name="checkbox-group-nested"></docs-example>

## API Reference

The Checkbox Group directive is available from the `ng-primitives/checkbox-group` package:

### NgpCheckboxGroup

<api-docs name="NgpCheckboxGroup"></api-docs>

<api-reference-props name="NgpCheckboxGroup"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-disabled" description="Applied when the checkbox group is disabled." />
</api-reference-attributes>

## Accessibility

The group uses `role="group"`. Each checkbox keeps the Checkbox primitive's `role="checkbox"`
and supports the standard checkbox keyboard interaction.

### Keyboard Interactions

- <kbd>Space</kbd> - Toggle the focused checkbox.

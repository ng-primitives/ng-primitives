---
name: 'Date Picker'
---

# Date Picker

A date picker is a component that allows users to select a date from a calendar and navigate through months and years.

<docs-example name="date-picker"></docs-example>

## Import

Import the DatePicker primitives from `ng-primitives/date-picker`.

```ts
import {
  NgpDatePicker,
  NgpDatePickerLabel,
  NgpDatePickerNextMonth,
  NgpDatePickerPreviousMonth,
  NgpDatePickerGrid,
  NgpDatePickerCell,
  NgpDatePickerRowRender,
  NgpDatePickerCellRender,
  NgpDatePickerDateButton,
} from 'ng-primitives/date-picker';
```

## Usage

Assemble the date-picker directives in your template.

```html
<div ngpDatePicker>
  <div>
    <button ngpDatePickerPreviousMonth>...</button>
    <h2 ngpDatePickerLabel>...</h2>
    <button ngpDatePickerNextMonth>...</button>
  </div>
  <table ngpDatePickerGrid>
    <thead>
      <tr>
        <th scope="col" abbr="Sunday">S</th>
        ...
      </tr>
    </thead>
    <tbody>
      <tr *ngpDatePickerRowRender>
        <td *ngpDatePickerCellRender="let date" ngpDatePickerCell>
          <button ngpDatePickerDateButton>...</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

## Reusable Component

Create a reusable component that uses the date picker directives.

<docs-snippet name="date-picker"></docs-snippet>

## Schematics

Generate a reusable date-picker component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive date-picker
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

By default, the date picker uses the native JavaScript `Date` object, however the date picker is designed to work with any date library. To use a date library, such as Luxon, you need to specify the appropriate date adapter. The date adapter is an abstraction layer that allows components to use date objects from any date library, ensuring compatibility and easy integration. To learn more about the date adapter, see the [Date Adapter](/utilities/date-adapter) documentation.

The following directives are available to import from the `ng-primitives/date-picker` package:

### NgpDatePicker

<api-docs name="NgpDatePicker"></api-docs>

#### Data Attributes

The following data attributes are available on the `ngpDatePicker` directive:

| Attribute       | Description                               |
| --------------- | ----------------------------------------- |
| `data-disabled` | Applied when the date picker is disabled. |

### NgpDatePickerLabel

<api-docs name="NgpDatePickerLabel"></api-docs>

#### Data Attributes

The following data attributes are available on the `ngpDatePickerLabel` directive:

| Attribute       | Description                               |
| --------------- | ----------------------------------------- |
| `data-disabled` | Applied when the date picker is disabled. |

### NgpDatePickerPreviousMonth

<api-docs name="NgpDatePickerPreviousMonth"></api-docs>

#### Data Attributes

The following data attributes are available on the `ngpDatePickerPreviousMonth` directive:

| Attribute            | Description                          |
| -------------------- | ------------------------------------ |
| `data-hover`         | Applied when the button is hovered.  |
| `data-focus-visible` | Applied when the button is focused.  |
| `data-press`         | Applied when the button is pressed.  |
| `data-disabled`      | Applied when the button is disabled. |

### NgpDatePickerNextMonth

<api-docs name="NgpDatePickerNextMonth"></api-docs>

#### Data Attributes

The following data attributes are available on the `ngpDatePickerNextMonth` directive:

| Attribute            | Description                          |
| -------------------- | ------------------------------------ |
| `data-hover`         | Applied when the button is hovered.  |
| `data-focus-visible` | Applied when the button is focused.  |
| `data-press`         | Applied when the button is pressed.  |
| `data-disabled`      | Applied when the button is disabled. |

### NgpDatePickerGrid

<api-docs name="NgpDatePickerGrid"></api-docs>

#### Data Attributes

The following data attributes are available on the `ngpDatePickerGrid` directive:

| Attribute       | Description                               |
| --------------- | ----------------------------------------- |
| `data-disabled` | Applied when the date picker is disabled. |

### NgpDatePickerRowRender

<api-docs name="NgpDatePickerRowRender"></api-docs>

### NgpDatePickerCellRender

A structural directive that renders a cell in the date picker grid.

- Selector: `*ngpDatePickerCellRender`
- Exported As: `ngpDatePickerCellRender`

The following context fields are available on the `ngpDatePickerCellRender` directive:

<prop-details name="$implicit" type="T">
  The date value for the cell.
</prop-details>

### NgpDatePickerCell

<api-docs name="NgpDatePickerCell"></api-docs>

#### Data Attributes

The following data attributes are available on the `ngpDatePickerCell` directive:

| Attribute       | Description                        |
| --------------- | ---------------------------------- |
| `data-disabled` | Applied when the cell is disabled. |
| `data-selected` | Applied when the cell is selected. |

### NgpDatePickerDateButton

<api-docs name="NgpDatePickerDateButton"></api-docs>

#### Data Attributes

The following data attributes are available on the `ngpDatePickerDateButton` directive:

| Attribute            | Description                                           |
| -------------------- | ----------------------------------------------------- |
| `data-selected`      | Applied when the button is selected.                  |
| `data-outside-month` | Applied when the button is outside the current month. |
| `data-today`         | Applied when the button represents the current date.  |
| `data-hover`         | Applied when the button is hovered.                   |
| `data-focus-visible` | Applied when the button is focused.                   |
| `data-press`         | Applied when the button is pressed.                   |
| `data-disabled`      | Applied when the button is disabled.                  |

## Accessibility

Adheres to the [WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/).

### Keyboard Interactions

- <kbd>Space</kbd> - Selects the focused date.
- <kbd>Enter</kbd> - Selects the focused date.
- <kbd>ArrowUp</kbd> - Moves focus to the same day of the previous week.
- <kbd>ArrowDown</kbd> - Moves focus to the same day of the next week.
- <kbd>ArrowLeft</kbd> - Moves focus to the previous day.
- <kbd>ArrowRight</kbd> - Moves focus to the next day.
- <kbd>Home</kbd> - Moves focus to the first day of the month.
- <kbd>End</kbd> - Moves focus to the last day of the month.
- <kbd>PageUp</kbd> - Moves focus to the same date in the previous month.
- <kbd>PageDown</kbd> - Moves focus to the same date in the next month.

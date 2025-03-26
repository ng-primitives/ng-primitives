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

The outermost container for the date picker.

- Selector: `[ngpDatePicker]`
- Exported As: `ngpDatePicker`

<response-field name="ngpDatePickerDate" type="T">
  Define the selected date. The type `T` is a generic type that represents the date value which can be a `Date` or a custom Date object handled by a `NgpDateAdapter`.
</response-field>

<response-field name="ngpDatePickerMin" type="T">
  Define the minimum date that can be selected.
</response-field>

<response-field name="ngpDatePickerMax" type="T">
  Define the maximum date that can be selected.
</response-field>

<response-field name="ngpDatePickerDisabled" type="boolean" default="false">
  Define the disabled state.
</response-field>

<response-field name="ngpDatePickerDateDisabled" type="(date: T) => boolean">
  Define a function that determines if a date is disabled. The function receives a date value and should return `true` if the date is disabled.
</response-field>

<response-field name="ngpDatePickerFocusedDate" type="T">
  Define the focused date.
</response-field>

#### Data Attributes

The following data attributes are available on the `ngpDatePicker` directive:

| Attribute       | Description                               |
| --------------- | ----------------------------------------- |
| `data-disabled` | Applied when the date picker is disabled. |

### NgpDatePickerLabel

The label that displays the current month and year typically in the header of the date picker. This will be announced by screen readers when the date changes.

- Selector: `[ngpDatePickerLabel]`
- Exported As: `ngpDatePickerLabel`

#### Data Attributes

The following data attributes are available on the `ngpDatePickerLabel` directive:

| Attribute       | Description                               |
| --------------- | ----------------------------------------- |
| `data-disabled` | Applied when the date picker is disabled. |

### NgpDatePickerPreviousMonth

A button that navigates to the previous month.

- Selector: `[ngpDatePickerPreviousMonth]`
- Exported As: `ngpDatePickerPreviousMonth`
- Host Directives: [NgpButton](/primitives/button)

#### Data Attributes

The following data attributes are available on the `ngpDatePickerPreviousMonth` directive:

| Attribute            | Description                          |
| -------------------- | ------------------------------------ |
| `data-hover`         | Applied when the button is hovered.  |
| `data-focus-visible` | Applied when the button is focused.  |
| `data-press`         | Applied when the button is pressed.  |
| `data-disabled`      | Applied when the button is disabled. |

### NgpDatePickerNextMonth

A button that navigates to the next month.

- Selector: `[ngpDatePickerNextMonth]`
- Exported As: `ngpDatePickerNextMonth`
- Host Directives: [NgpButton](/primitives/button)

#### Data Attributes

The following data attributes are available on the `ngpDatePickerNextMonth` directive:

| Attribute            | Description                          |
| -------------------- | ------------------------------------ |
| `data-hover`         | Applied when the button is hovered.  |
| `data-focus-visible` | Applied when the button is focused.  |
| `data-press`         | Applied when the button is pressed.  |
| `data-disabled`      | Applied when the button is disabled. |

### NgpDatePickerGrid

The grid that contains the days of the month.

- Selector: `[ngpDatePickerGrid]`
- Exported As: `ngpDatePickerGrid`

#### Data Attributes

The following data attributes are available on the `ngpDatePickerGrid` directive:

| Attribute       | Description                               |
| --------------- | ----------------------------------------- |
| `data-disabled` | Applied when the date picker is disabled. |

### NgpDatePickerRowRender

A structural directive that renders a row of weekdays in the date picker grid.

- Selector: `*ngpDatePickerRowRender`
- Exported As: `ngpDatePickerRowRender`

### NgpDatePickerCellRender

A structural directive that renders a cell in the date picker grid.

- Selector: `*ngpDatePickerCellRender`
- Exported As: `ngpDatePickerCellRender`

The following context fields are available on the `ngpDatePickerCellRender` directive:

<response-field name="$implicit" type="T">
  The date value for the cell.
</response-field>

### NgpDatePickerCell

A cell in the date picker grid.

- Selector: `[ngpDatePickerCell]`
- Exported As: `ngpDatePickerCell`

#### Data Attributes

The following data attributes are available on the `ngpDatePickerCell` directive:

| Attribute       | Description                        |
| --------------- | ---------------------------------- |
| `data-disabled` | Applied when the cell is disabled. |
| `data-selected` | Applied when the cell is selected. |

### NgpDatePickerDateButton

A button that represents a date in the date picker grid.

- Selector: `[ngpDatePickerDateButton]`
- Exported As: `ngpDatePickerDateButton`
- Host Directives: [NgpButton](/primitives/button)

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

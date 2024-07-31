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

## API Reference

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

| Attribute       | Description                            | Value             |
| --------------- | -------------------------------------- | ----------------- |
| `data-disabled` | The disabled state of the date picker. | `true` \| `false` |

### NgpDatePickerLabel

The label that displays the current month and year typically in the header of the date picker. This will be announced by screen readers when the date changes.

- Selector: `[ngpDatePickerLabel]`
- Exported As: `ngpDatePickerLabel`

#### Data Attributes

The following data attributes are available on the `ngpDatePickerLabel` directive:

| Attribute       | Description                            | Value             |
| --------------- | -------------------------------------- | ----------------- |
| `data-disabled` | The disabled state of the date picker. | `true` \| `false` |

### NgpDatePickerPreviousMonth

A button that navigates to the previous month.

- Selector: `[ngpDatePickerPreviousMonth]`
- Exported As: `ngpDatePickerPreviousMonth`
- Host Directives: [NgpButton](/primitives/button)

#### Data Attributes

The following data attributes are available on the `ngpDatePickerPreviousMonth` directive:

| Attribute            | Description                       | Value             |
| -------------------- | --------------------------------- | ----------------- |
| `data-hover`         | The hover state of the button.    | `true` \| `false` |
| `data-focus-visible` | The focus state of the button.    | `true` \| `false` |
| `data-press`         | The pressed state of the button.  | `true` \| `false` |
| `data-disabled`      | The disabled state of the button. | `true` \| `false` |

### NgpDatePickerNextMonth

A button that navigates to the next month.

- Selector: `[ngpDatePickerNextMonth]`
- Exported As: `ngpDatePickerNextMonth`
- Host Directives: [NgpButton](/primitives/button)

#### Data Attributes

The following data attributes are available on the `ngpDatePickerNextMonth` directive:

| Attribute            | Description                       | Value             |
| -------------------- | --------------------------------- | ----------------- |
| `data-hover`         | The hover state of the button.    | `true` \| `false` |
| `data-focus-visible` | The focus state of the button.    | `true` \| `false` |
| `data-press`         | The pressed state of the button.  | `true` \| `false` |
| `data-disabled`      | The disabled state of the button. | `true` \| `false` |

### NgpDatePickerGrid

The grid that contains the days of the month.

- Selector: `[ngpDatePickerGrid]`
- Exported As: `ngpDatePickerGrid`

#### Data Attributes

The following data attributes are available on the `ngpDatePickerGrid` directive:

| Attribute       | Description                            | Value             |
| --------------- | -------------------------------------- | ----------------- |
| `data-disabled` | The disabled state of the date picker. | `true` \| `false` |

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

| Attribute       | Description                            | Value             |
| --------------- | -------------------------------------- | ----------------- |
| `data-disabled` | The disabled state of the date picker. | `true` \| `false` |
| `data-selected` | The selected state of the date.        | `true` \| `false` |

### NgpDatePickerDateButton

A button that represents a date in the date picker grid.

- Selector: `[ngpDatePickerDateButton]`
- Exported As: `ngpDatePickerDateButton`
- Host Directives: [NgpButton](/primitives/button)

#### Data Attributes

The following data attributes are available on the `ngpDatePickerDateButton` directive:

| Attribute            | Description                                                 | Value             |
| -------------------- | ----------------------------------------------------------- | ----------------- |
| `data-selected`      | The selected state of the button.                           | `true` \| `false` |
| `data-outside-month` | The state of the button if it is outside the current month. | `true` \| `false` |
| `data-today`         | The state of the button if it is today.                     | `true` \| `false` |
| `data-hover`         | The hover state of the button.                              | `true` \| `false` |
| `data-focus-visible` | The focus state of the button.                              | `true` \| `false` |
| `data-press`         | The pressed state of the button.                            | `true` \| `false` |
| `data-disabled`      | The disabled state of the button.                           | `true` \| `false` |

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

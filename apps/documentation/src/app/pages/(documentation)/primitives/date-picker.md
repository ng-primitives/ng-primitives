---
name: 'Date Picker'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/date-picker'
---

# Date Picker

A date picker is a component that allows users to select a date from a calendar and navigate through months and years.

<docs-example name="date-picker"></docs-example>

## Import

Import the DatePicker primitives from `ng-primitives/date-picker`.

```ts
import {
  NgpDatePicker,
  NgpDateRangePicker,
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

## Examples

Here are some additional examples of how to use the Date Picker primitives.

### Date Range Picker

The date range picker allows users to select a range of dates by selecting the start and end dates.

<docs-example name="date-range-picker"></docs-example>

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

### NgpDateRangePicker

<api-docs name="NgpDateRangePicker"></api-docs>

#### Data Attributes

The following data attributes are available on the `ngpDateRangePicker` directive:

| Attribute       | Description                                     |
| --------------- | ----------------------------------------------- |
| `data-disabled` | Applied when the date range picker is disabled. |

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

| Attribute            | Description                                                           |
| -------------------- | --------------------------------------------------------------------- |
| `data-selected`      | Applied when the button is selected.                                  |
| `data-outside-month` | Applied when the button is outside the current month.                 |
| `data-today`         | Applied when the button represents the current date.                  |
| `data-hover`         | Applied when the button is hovered.                                   |
| `data-focus-visible` | Applied when the button is focused.                                   |
| `data-press`         | Applied when the button is pressed.                                   |
| `data-disabled`      | Applied when the button is disabled.                                  |
| `data-range-start`   | Applied when the button is the start of a date range.                 |
| `data-range-end`     | Applied when the button is the end of a date range.                   |
| `data-range-between` | Applied when the button is between the start and end of a date range. |

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

## Global Configuration

You can configure the default options for all `NgpDatePicker` and `NgpDateRangePicker` calendars in your application by using the `provideDatePickerConfig` function in a providers array.

```ts
import { provideDatePickerConfig } from 'ng-primitives/date-picker';

bootstrapApplication(AppComponent, {
  providers: [
    provideDatePickerConfig({
      firstDayOfWeek: 1, // Monday
    }),
  ],
});
```

### NgpDatePickerConfig

<prop-details name="firstDayOfWeek" type="NgpDatePickerFirstDayOfWeekNumber (1-7)">
  Sets which day starts the week in date picker and date range picker calendars.
  Accepts <code>1-7</code> where:
  <ul>
    <li><code>1</code>=Monday,</li>
    <li><code>2</code>=Tuesday,</li>
    <li><code>3</code>=Wednesday,</li>
    <li><code>4</code>=Thursday,</li>
    <li><code>5</code>=Friday,</li>
    <li><code>6</code>=Saturday,</li>
    <li><code>7</code>=Sunday (<code>default</code>).</li>
  </ul>
  Choose based on your users' cultural expectations - most international
  applications use <code>1</code> (Monday), while US applications typically use
  <code>7</code> (Sunday).
  <br />
  Note: When using a non-Sunday start day, update your calendar header column order accordingly.
</prop-details>

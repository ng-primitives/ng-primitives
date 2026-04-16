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
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`.

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

<api-reference-props name="NgpDatePicker"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-disabled" description="Applied when the date picker is disabled." />
</api-reference-attributes>

### NgpDateRangePicker

<api-docs name="NgpDateRangePicker"></api-docs>

<api-reference-props name="NgpDateRangePicker"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-disabled" description="Applied when the date range picker is disabled." />
</api-reference-attributes>

### NgpDatePickerLabel

<api-docs name="NgpDatePickerLabel"></api-docs>

<api-reference-props name="NgpDatePickerLabel"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-disabled" description="Applied when the date picker is disabled." />
</api-reference-attributes>

### NgpDatePickerPreviousMonth

<api-docs name="NgpDatePickerPreviousMonth"></api-docs>

<api-reference-props name="NgpDatePickerPreviousMonth"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-hover" description="Applied when the button is hovered." />
  <api-attribute name="data-focus-visible" description="Applied when the button is focused." />
  <api-attribute name="data-press" description="Applied when the button is pressed." />
  <api-attribute name="data-disabled" description="Applied when the button is disabled." />
</api-reference-attributes>

### NgpDatePickerNextMonth

<api-docs name="NgpDatePickerNextMonth"></api-docs>

<api-reference-props name="NgpDatePickerNextMonth"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-hover" description="Applied when the button is hovered." />
  <api-attribute name="data-focus-visible" description="Applied when the button is focused." />
  <api-attribute name="data-press" description="Applied when the button is pressed." />
  <api-attribute name="data-disabled" description="Applied when the button is disabled." />
</api-reference-attributes>

### NgpDatePickerGrid

<api-docs name="NgpDatePickerGrid"></api-docs>

<api-reference-props name="NgpDatePickerGrid"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-disabled" description="Applied when the date picker is disabled." />
</api-reference-attributes>

### NgpDatePickerRowRender

<api-docs name="NgpDatePickerRowRender"></api-docs>

<api-reference-props name="NgpDatePickerRowRender"></api-reference-props>

### NgpDatePickerCellRender

A structural directive that renders a cell in the date picker grid.

- Selector: `*ngpDatePickerCellRender`
- Exported As: `ngpDatePickerCellRender`

The following context fields are available on the `ngpDatePickerCellRender` directive:

<api-reference-config>
  <api-config-prop name="$implicit" type="T" description="The date value for the cell." />
</api-reference-config>

### NgpDatePickerCell

<api-docs name="NgpDatePickerCell"></api-docs>

<api-reference-props name="NgpDatePickerCell"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-disabled" description="Applied when the cell is disabled." />
  <api-attribute name="data-selected" description="Applied when the cell is selected." />
</api-reference-attributes>

### NgpDatePickerDateButton

<api-docs name="NgpDatePickerDateButton"></api-docs>

<api-reference-props name="NgpDatePickerDateButton"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-selected" description="Applied when the button is selected." />
  <api-attribute name="data-outside-month" description="Applied when the button is outside the current month." />
  <api-attribute name="data-today" description="Applied when the button represents the current date." />
  <api-attribute name="data-hover" description="Applied when the button is hovered." />
  <api-attribute name="data-focus-visible" description="Applied when the button is focused." />
  <api-attribute name="data-press" description="Applied when the button is pressed." />
  <api-attribute name="data-disabled" description="Applied when the button is disabled." />
  <api-attribute name="data-range-start" description="Applied when the button is the start of a date range." />
  <api-attribute name="data-range-end" description="Applied when the button is the end of a date range." />
  <api-attribute name="data-range-between" description="Applied when the button is between the start and end of a date range." />
</api-reference-attributes>

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

<api-reference-config name="NgpDatePickerConfig"></api-reference-config>

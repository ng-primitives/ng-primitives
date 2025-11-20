import { Component } from '@angular/core';
import { NgpDescription, NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpNativeSelect } from 'ng-primitives/select';

@Component({
  selector: 'app-native-select-form-field-tailwind',
  standalone: true,
  imports: [NgpNativeSelect, NgpFormField, NgpLabel, NgpDescription],
  template: `
    <div class="flex w-[90%] flex-col gap-[6px]" ngpFormField>
      <label class="text-sm font-medium text-gray-700 dark:text-gray-200" ngpLabel>
        Time Format
      </label>
      <p class="mb-1 text-xs text-gray-500 dark:text-gray-400" ngpDescription>
        Choose between 12-hour and 24-hour time formats.
      </p>
      <select
        class="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0iIzczNzM3MyI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNS4yMiA4LjIyYS43NS43NSAwIDAgMSAxLjA2IDBMMTAgMTEuOTRsMy43Mi0zLjcyYS43NS43NSAwIDEgMSAxLjA2IDEuMDZsLTQuMjUgNC4yNWEuNzUuNzUgMCAwIDEtMS4wNiAwTDUuMjIgOS4yOGEuNzUuNzUgMCAwIDEgMC0xLjA2WiIgY2xpcC1ydWxlPSJldmVub2RkIj48L3BhdGg+PC9zdmc+')] bg-size-[1.25rem] bg-position-[calc(100%-10px)_50%] bg-no-repeat px-4 text-sm text-gray-900 outline-hidden data-focus:ring-2 data-focus:ring-blue-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-gray-50 dark:data-focus:ring-blue-400"
        ngpNativeSelect
      >
        <option value="24">24 hours</option>
        <option value="12">12 hours</option>
      </select>
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }
  `,
})
export default class NativeSelectFormFieldTailwindExample {}

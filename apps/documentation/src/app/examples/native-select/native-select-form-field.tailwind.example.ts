import { Component } from '@angular/core';
import { NgpDescription, NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpNativeSelect } from 'ng-primitives/select';

@Component({
  selector: 'app-native-select-form-field-tailwind',
  standalone: true,
  imports: [NgpNativeSelect, NgpFormField, NgpLabel, NgpDescription],
  host: {
    class: 'contents',
  },
  template: `
    <div class="flex w-[300px] flex-col gap-[6px]" ngpFormField>
      <label class="m-0 text-sm/5 font-[510] text-zinc-900 dark:text-zinc-100" ngpLabel>
        Time Format
      </label>
      <p class="m-0 mb-1 text-xs/4! text-zinc-600 dark:text-zinc-300" ngpDescription>
        Choose between 12-hour and 24-hour time formats.
      </p>
      <select
        class="box-content flex h-[2.125rem] w-full appearance-none items-center rounded-lg border-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0iIzczNzM3MyI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNS4yMiA4LjIyYS43NS43NSAwIDAgMSAxLjA2IDBMMTAgMTEuOTRsMy43Mi0zLjcyYS43NS43NSAwIDEgMSAxLjA2IDEuMDZsLTQuMjUgNC4yNWEuNzUuNzUgMCAwIDEtMS4wNiAwTDUuMjIgOS4yOGEuNzUuNzUgMCAwIDEgMC0xLjA2WiIgY2xpcC1ydWxlPSJldmVub2RkIj48L3BhdGg+PC9zdmc+')] bg-size-[1.25rem] bg-position-[calc(100%-10px)_50%] bg-no-repeat px-4 text-start text-[0.875rem] shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1),0_0_0_1px_rgb(0_0_0/0.05)] outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 dark:bg-zinc-950 dark:shadow-[0_1px_3px_0_rgb(255_255_255/0.1),0_1px_2px_-1px_rgb(255_255_255/0.1),0_0_0_1px_rgb(255_255_255/0.05)] dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-zinc-900"
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

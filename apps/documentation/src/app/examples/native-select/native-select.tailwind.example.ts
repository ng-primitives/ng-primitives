import { Component } from '@angular/core';
import { NgpNativeSelect } from 'ng-primitives/select';

@Component({
  selector: 'app-native-select-tailwind',
  standalone: true,
  imports: [NgpNativeSelect],
  template: `
    <select
      class="h-10 w-[90%] appearance-none rounded-lg border border-gray-200 bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0iIzczNzM3MyI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNS4yMiA4LjIyYS43NS43NSAwIDAgMSAxLjA2IDBMMTAgMTEuOTRsMy43Mi0zLjcyYS43NS43NSAwIDEgMSAxLjA2IDEuMDZsLTQuMjUgNC4yNWEuNzUuNzUgMCAwIDEtMS4wNiAwTDUuMjIgOS4yOGEuNzUuNzUgMCAwIDEgMC0xLjA2WiIgY2xpcC1ydWxlPSJldmVub2RkIj48L3BhdGg+PC9zdmc+')] bg-[length:1.25rem] bg-[position:calc(100%-10px)_50%] bg-no-repeat px-4 text-sm text-gray-900 outline-none data-[focus]:ring-2 data-[focus]:ring-blue-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-gray-50 dark:data-[focus]:ring-blue-400"
      ngpNativeSelect
    >
      <option value="24">24 hours</option>
      <option value="12">12 hours</option>
    </select>
  `,
  styles: `
    :host {
      display: contents;
    }
  `,
})
export default class NativeSelectTailwindExample {}

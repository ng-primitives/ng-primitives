import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { NgpButton } from 'ng-primitives/button';
import { NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpPassword, NgpPasswordInput, NgpPasswordToggle } from 'ng-primitives/password';

@Component({
  selector: 'app-password',
  imports: [
    NgpFormField,
    NgpLabel,
    NgpPassword,
    NgpPasswordInput,
    NgpPasswordToggle,
    NgpButton,
    NgIcon,
  ],
  providers: [provideIcons({ lucideEye, lucideEyeOff })],
  host: {
    class: 'contents',
  },
  template: `
    <div class="flex w-[300px] flex-col gap-1.5" ngpFormField>
      <label
        class="m-0 text-sm/5 font-[510] tracking-[-0.014em] text-zinc-900 dark:text-zinc-100"
        ngpLabel
      >
        Password
      </label>
      <div class="relative" #password="ngpPassword" ngpPassword>
        <input
          class="h-[2.125rem] w-full rounded-lg border-none bg-white px-3 pr-10 text-[0.875rem] tracking-[-0.006em] text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.1)] outline-none placeholder:text-zinc-400 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-blue-500 dark:bg-zinc-950 dark:text-zinc-100 dark:shadow-[0_1px_2px_rgba(255,255,255,0.007),0_0_0_1px_rgba(255,255,255,0.1)] dark:data-[focus]:outline-blue-400"
          ngpPasswordInput
          type="password"
          placeholder="Enter your password"
          autocomplete="current-password"
        />
        <button
          class="absolute top-0 right-0 flex h-[2.125rem] w-[2.125rem] cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-[1.125rem] text-zinc-500 transition-colors duration-150 outline-none data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-blue-500 data-[hover]:text-zinc-600 data-[visible]:text-[#f01e2b] dark:text-zinc-400 dark:data-[focus-visible]:outline-blue-400 dark:data-[hover]:text-zinc-300 dark:data-[visible]:text-[#ff4651]"
          ngpButton
          ngpPasswordToggle
        >
          <ng-icon [name]="password.isVisible() ? 'lucideEyeOff' : 'lucideEye'" />
        </button>
      </div>
    </div>
  `,
})
export default class PasswordExample {}

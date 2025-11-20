import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckSolid, heroChevronDownSolid } from '@ng-icons/heroicons/solid';
import { NgpButton } from 'ng-primitives/button';
import { NgpDescription, NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpListbox, NgpListboxOption, NgpListboxTrigger } from 'ng-primitives/listbox';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';

@Component({
  selector: 'app-listbox-select-tailwind',
  imports: [
    NgpListbox,
    NgpLabel,
    NgpDescription,
    NgpListboxOption,
    NgpButton,
    NgpFormField,
    NgpPopover,
    NgpPopoverTrigger,
    NgpListboxTrigger,
    NgIcon,
  ],
  providers: [provideIcons({ heroCheckSolid, heroChevronDownSolid })],
  template: `
    <div class="flex w-[300px] flex-col gap-1.5" ngpFormField>
      <label class="text-sm font-medium text-gray-900 dark:text-gray-100" ngpLabel>Character</label>
      <p class="mb-1 text-xs text-gray-600 dark:text-gray-400" ngpDescription>
        Select a character from the list below.
      </p>

      <button
        class="flex h-9 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 text-left text-sm text-gray-600 transition-colors focus:ring-0 dark:border-gray-700 dark:bg-transparent dark:text-gray-300"
        [ngpPopoverTrigger]="dropdown"
        ngpButton
        ngpListboxTrigger
      >
        {{ selection()[0].name }}
        <ng-icon name="heroChevronDownSolid" />
      </button>

      <ng-template #dropdown>
        <div
          class="absolute z-1001 mt-1 w-[300px] rounded-xl border border-gray-200 bg-white p-1 outline-hidden dark:border-gray-700 dark:bg-black"
          [(ngpListboxValue)]="selection"
          ngpPopover
          ngpListbox
          aria-label="Characters"
        >
          @for (option of options; track option.id) {
            <div
              class="flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-[14px] text-gray-600 transition-colors hover:bg-gray-50 data-active:bg-gray-100 data-press:bg-gray-100 dark:text-gray-100 dark:text-gray-300 dark:hover:bg-white/5 dark:data-active:bg-white/10 dark:data-press:bg-white/10"
              #listboxOption="ngpListboxOption"
              [ngpListboxOptionValue]="option"
              ngpListboxOption
            >
              <ng-icon
                class="opacity-0 transition-opacity"
                [class.opacity-100]="listboxOption.selected()"
                name="heroCheckSolid"
                size="16px"
              />
              {{ option.name }}
            </div>
          }
        </div>
      </ng-template>
    </div>
  `,
})
export default class ListboxSelectTailwindExample {
  readonly options: Option[] = [
    { id: 1, name: 'Marty McFly' },
    { id: 2, name: 'Doc Brown' },
    { id: 3, name: 'Biff Tannen' },
    { id: 4, name: 'Lorraine Baines' },
    { id: 5, name: 'George McFly' },
  ];

  readonly selection = signal<Option[]>([this.options[0]]);
}

interface Option {
  id: number;
  name: string;
}

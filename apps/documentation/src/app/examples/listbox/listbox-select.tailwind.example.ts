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
    <div class="flex w-[90%] flex-col gap-1.5" ngpFormField>
      <label class="m-0 text-sm/5 font-[500] text-zinc-900 dark:text-zinc-100" ngpLabel>
        Character
      </label>
      <p class="m-0 mb-1 text-xs/4! text-zinc-600 dark:text-zinc-300" ngpDescription>
        Select a character from the list below.
      </p>

      <button
        class="flex h-[2.125rem] w-[300px] items-center justify-between rounded-lg border-none bg-white px-4 text-left text-[0.875rem] tracking-[-0.006em] text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.1)] outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 dark:bg-zinc-950 dark:text-zinc-100 dark:shadow-[0_1px_2px_rgba(255,255,255,0.007),0_0_0_1px_rgba(255,255,255,0.1)] dark:data-focus-visible:outline-blue-400"
        [ngpPopoverTrigger]="dropdown"
        ngpButton
        ngpListboxTrigger
      >
        {{ selection()[0].name }}
        <ng-icon name="heroChevronDownSolid" />
      </button>

      <ng-template #dropdown>
        <div
          class="absolute z-1001 mt-1 w-(--ngp-popover-trigger-width) rounded-xl border border-black/10 bg-white p-1 shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-950"
          [(ngpListboxValue)]="selection"
          ngpPopover
          ngpListbox
          aria-label="Characters"
        >
          @for (option of options; track option.id) {
            <div
              class="flex h-[2.125rem] w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-sm tracking-[-0.006em] text-zinc-600 transition-colors data-active:bg-zinc-100 data-hover:bg-zinc-50 data-press:bg-zinc-100 data-selected:font-[510] dark:text-zinc-100 dark:data-active:bg-zinc-800 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
              #listboxOption="ngpListboxOption"
              [ngpListboxOptionValue]="option"
              ngpListboxOption
            >
              <ng-icon
                class="invisible text-[#f01e2b]! group-data-selected:visible dark:text-[#ff4651]!"
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

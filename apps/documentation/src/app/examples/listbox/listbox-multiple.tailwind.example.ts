import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckSolid } from '@ng-icons/heroicons/solid';
import { NgpListbox, NgpListboxOption } from 'ng-primitives/listbox';

@Component({
  selector: 'app-listbox-multiple-tailwind',
  imports: [NgpListbox, NgpListboxOption, NgIcon],
  providers: [provideIcons({ heroCheckSolid })],
  template: `
    <div
      class="rounded-xl border border-gray-200 bg-white p-1 outline-hidden dark:border-gray-800 dark:bg-transparent"
      [(ngpListboxValue)]="selection"
      ngpListbox
      ngpListboxMode="multiple"
      aria-label="Characters"
    >
      @for (option of options; track option.id) {
        <div
          class="flex h-[2.125rem] w-[200px] cursor-pointer items-center gap-2 rounded-lg px-3 text-sm tracking-[-0.006em] text-gray-600 transition-colors hover:bg-gray-50 data-active:bg-gray-100 data-press:bg-gray-100 data-selected:font-[510] data-selected:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:data-active:bg-white/10 dark:data-press:bg-white/10 dark:data-selected:text-gray-100"
          #listboxOption="ngpListboxOption"
          [ngpListboxOptionValue]="option"
          ngpListboxOption
        >
          <ng-icon
            class="text-[#f01e2b] opacity-0 transition-opacity dark:text-[#ff4651]"
            [class.opacity-100]="listboxOption.selected()"
            name="heroCheckSolid"
            size="16px"
          />
          {{ option.name }}
        </div>
      }
    </div>
  `,
})
export default class ListboxMultipleTailwindExample {
  readonly options: Option[] = [
    { id: 1, name: 'Marty McFly' },
    { id: 2, name: 'Doc Brown' },
    { id: 3, name: 'Biff Tannen' },
    { id: 4, name: 'Lorraine Baines' },
    { id: 5, name: 'George McFly' },
  ];

  readonly selection = signal<Option[]>([this.options[0], this.options[1]]);
}

interface Option {
  id: number;
  name: string;
}

import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckSolid } from '@ng-icons/heroicons/solid';
import {
  NgpListbox,
  NgpListboxOption,
  NgpListboxSection,
  NgpListboxHeader,
} from 'ng-primitives/listbox';

@Component({
  selector: 'app-listbox-sections-tailwind',
  imports: [NgpListbox, NgpListboxOption, NgpListboxSection, NgpListboxHeader, NgIcon],
  providers: [provideIcons({ heroCheckSolid })],
  template: `
    <div
      class="max-h-[300px] overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 outline-hidden dark:border-gray-800 dark:bg-transparent"
      [(ngpListboxValue)]="selection"
      ngpListbox
      aria-label="Sections"
    >
      @for (section of sections; track section.name) {
        <header
          class="flex px-3 pt-1.5 pb-1 text-[0.6875rem] font-[590] tracking-[0.04em] text-gray-400 uppercase dark:text-zinc-500"
          ngpListboxHeader
        >
          {{ section.name }}
        </header>

        <div ngpListboxSection>
          @for (option of section.options; track option.id) {
            <div
              class="flex h-[2.125rem] w-[200px] cursor-pointer items-center gap-2 rounded-lg px-3 py-1 text-sm tracking-[-0.006em] text-gray-600 transition-colors hover:bg-gray-50 data-active:bg-gray-100 data-press:bg-gray-100 data-selected:font-[510] data-selected:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:data-active:bg-white/10 dark:data-press:bg-white/10 dark:data-selected:text-gray-100"
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
      }
    </div>
  `,
})
export default class ListboxSectionsTailwindExample {
  readonly sections: Section[] = [
    {
      name: 'Characters',
      options: [
        { id: 1, name: 'Marty McFly' },
        { id: 2, name: 'Doc Brown' },
        { id: 3, name: 'Biff Tannen' },
        { id: 4, name: 'Lorraine Baines' },
        { id: 5, name: 'George McFly' },
      ],
    },
    {
      name: 'Locations',
      options: [
        { id: 6, name: 'Hill Valley' },
        { id: 7, name: 'Twin Pines Mall' },
        { id: 8, name: 'Lyon Estates' },
      ],
    },
    {
      name: 'Items',
      options: [
        { id: 9, name: 'DeLorean' },
        { id: 10, name: 'Hoverboard' },
        { id: 11, name: 'Sports Almanac' },
        { id: 13, name: 'Plutonium' },
        { id: 14, name: 'Mr. Fusion' },
        { id: 15, name: 'Flux Capacitor' },
      ],
    },
  ];

  readonly selection = signal<Option[]>([this.sections[0].options[0]]);
}

interface Section {
  name: string;
  options: Option[];
}

interface Option {
  id: number;
  name: string;
}

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
      class="max-h-[300px] overflow-y-auto rounded-xl border border-black/10 bg-white p-1 outline-none dark:border-zinc-800 dark:bg-zinc-950"
      [(ngpListboxValue)]="selection"
      ngpListbox
      aria-label="Sections"
    >
      @for (section of sections; track section.name) {
        <div ngpListboxSection>
          <header
            class="px-3 pt-1.5 pb-1 text-[0.6875rem] font-[590] tracking-[0.04em] text-zinc-500 uppercase dark:text-zinc-400"
            ngpListboxHeader
          >
            {{ section.name }}
          </header>

          @for (option of section.options; track option.id) {
            <div
              class="group flex h-[2.125rem] w-[200px] cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-[0.875rem] tracking-[-0.006em] text-zinc-900 transition-colors data-active:bg-zinc-100 data-hover:bg-zinc-50 data-press:bg-zinc-100 data-selected:font-[510] dark:text-zinc-100 dark:data-active:bg-zinc-800 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
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

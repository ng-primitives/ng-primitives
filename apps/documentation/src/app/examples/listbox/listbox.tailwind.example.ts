import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckSolid } from '@ng-icons/heroicons/solid';
import { NgpListbox, NgpListboxOption } from 'ng-primitives/listbox';

@Component({
  selector: 'app-listbox-tailwind',
  imports: [NgpListbox, NgpListboxOption, NgIcon],
  providers: [provideIcons({ heroCheckSolid })],
  template: `
    <div
      class="rounded-xl border border-black/10 bg-white p-1 outline-none dark:border-zinc-800 dark:bg-zinc-950"
      [(ngpListboxValue)]="selection"
      ngpListbox
      aria-label="Characters"
    >
      @for (option of options; track option.id) {
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
  `,
})
export default class ListboxTailwindExample {
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

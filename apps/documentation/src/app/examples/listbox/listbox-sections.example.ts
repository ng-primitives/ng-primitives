import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckSolid } from '@ng-icons/heroicons/solid';
import { NgpHeader } from 'ng-primitives/common';
import { NgpListbox, NgpListboxOption, NgpListboxSection } from 'ng-primitives/listbox';

@Component({
  selector: 'app-listbox-sections',
  imports: [NgpListbox, NgpListboxOption, NgpListboxSection, NgpHeader, NgIcon],
  viewProviders: [provideIcons({ heroCheckSolid })],
  template: `
    <div class="listbox" [(ngpListboxValue)]="selection" ngpListbox aria-label="Sections">
      @for (section of sections; track section.name) {
        <header class="listbox-header" ngpHeader>{{ section.name }}</header>

        <div ngpListboxSection>
          @for (option of section.options; track option.id) {
            <div class="listbox-option" [ngpListboxOptionValue]="option" ngpListboxOption>
              <ng-icon name="heroCheckSolid" size="16px" />
              {{ option.name }}
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .listbox {
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      padding: 0.25rem;
      border-radius: 0.75rem;
      list-style: none;
      outline: none;
      max-height: 300px;
      overflow-y: auto;
    }

    .listbox-header {
      padding: 0.25rem 0.75rem;
      font-weight: 600;
    }

    .listbox-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      cursor: pointer;
      border-radius: 0.5rem;
      width: 200px;
      height: 36px;
      box-sizing: border-box;
    }

    .listbox-option[data-hover] {
      background-color: var(--ngp-background-hover);
    }

    .listbox-option[data-press] {
      background-color: var(--ngp-background-active);
    }

    .listbox-option[data-active] {
      background-color: var(--ngp-background-active);
    }

    .listbox-option ng-icon {
      visibility: hidden;
    }

    .listbox-option[data-selected] ng-icon {
      visibility: visible;
    }
  `,
})
export default class ListboxSectionsExample {
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

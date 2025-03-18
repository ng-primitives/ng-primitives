import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckSolid } from '@ng-icons/heroicons/solid';
import { NgpListbox, NgpListboxOption } from 'ng-primitives/listbox';

@Component({
  selector: 'app-listbox-multiple',
  imports: [NgpListbox, NgpListboxOption, NgIcon],
  viewProviders: [provideIcons({ heroCheckSolid })],
  template: `
    <div class="listbox" [(ngpListboxValue)]="selection" ngpListbox ngpListboxMode="multiple">
      @for (option of options; track option.id) {
        <div class="listbox-option" [ngpListboxOptionValue]="option" ngpListboxOption>
          <ng-icon name="heroCheckSolid" size="16px" />
          {{ option.name }}
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
      outline: none;
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
export default class ListboxMultipleExample {
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

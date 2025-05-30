import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckSolid } from '@ng-icons/heroicons/solid';
import { NgpListbox, NgpListboxOption } from 'ng-primitives/listbox';

@Component({
  selector: 'app-listbox-multiple',
  imports: [NgpListbox, NgpListboxOption, NgIcon],
  providers: [provideIcons({ heroCheckSolid })],
  template: `
    <div [(ngpListboxValue)]="selection" ngpListbox ngpListboxMode="multiple">
      @for (option of options; track option.id) {
        <div [ngpListboxOptionValue]="option" ngpListboxOption>
          <ng-icon name="heroCheckSolid" size="16px" />
          {{ option.name }}
        </div>
      }
    </div>
  `,
  styles: `
    [ngpListbox] {
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      padding: 0.25rem;
      border-radius: 0.75rem;
      outline: none;
    }

    [ngpListboxOption] {
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

    [ngpListboxOption][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpListboxOption][data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpListboxOption][data-active] {
      background-color: var(--ngp-background-active);
    }

    [ngpListboxOption] ng-icon {
      visibility: hidden;
    }

    [ngpListboxOption][data-selected] ng-icon {
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

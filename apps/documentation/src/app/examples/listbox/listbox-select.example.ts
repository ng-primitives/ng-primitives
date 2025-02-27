import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckSolid, heroChevronDownSolid } from '@ng-icons/heroicons/solid';
import { NgpButton } from 'ng-primitives/button';
import { NgpDescription, NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpListbox, NgpListboxOption } from 'ng-primitives/listbox';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';

@Component({
  standalone: true,
  selector: 'app-listbox-select',
  imports: [
    NgpListbox,
    NgpLabel,
    NgpDescription,
    NgpListboxOption,
    NgpButton,
    NgpFormField,
    NgpPopover,
    NgpPopoverTrigger,
    NgIcon,
  ],
  viewProviders: [provideIcons({ heroCheckSolid, heroChevronDownSolid })],
  template: `
    <div ngpFormField>
      <label ngpLabel>Character</label>
      <p ngpDescription>Select a character from the list below.</p>

      <button [ngpPopoverTrigger]="dropdown" ngpButton>
        {{ selection()[0].name }}
        <ng-icon name="heroChevronDownSolid" />
      </button>

      <ng-template #dropdown>
        <div
          class="listbox"
          [(ngpListboxValue)]="selection"
          ngpPopover
          ngpListbox
          aria-label="Characters"
        >
          @for (option of options; track option.id) {
            <div class="listbox-option" [ngpListboxOption]="option">
              <ng-icon name="heroCheckSolid" size="16px" />
              {{ option.name }}
            </div>
          }
        </div>
      </ng-template>
    </div>
  `,
  styles: `
    [ngpFormField] {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 90%;
    }

    [ngpLabel] {
      color: var(--text-primary);
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 500;
      margin: 0;
    }

    [ngpDescription] {
      color: var(--text-secondary);
      font-size: 0.75rem;
      line-height: 1rem;
      margin: 0 0 4px;
    }

    [ngpButton] {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 36px;
      width: 300px;
      border-radius: 8px;
      padding: 0 16px;
      border: none;
      background-color: var(--background);
      text-align: left;
      box-shadow: var(--input-shadow);
      outline: none;
    }

    [ngpButton][data-focus-visible] {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }

    .listbox {
      background-color: var(--background);
      border: 1px solid var(--border);
      padding: 0.25rem;
      border-radius: 0.75rem;
      outline: none;
      position: absolute;
      width: var(--trigger-width);
    }

    .listbox-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      cursor: pointer;
      border-radius: 0.5rem;
      width: 100%;
      height: 36px;
      box-sizing: border-box;
    }

    .listbox-option[data-hover] {
      background-color: var(--background-hover);
    }

    .listbox-option[data-press] {
      background-color: var(--background-active);
    }

    .listbox-option[data-active] {
      background-color: var(--background-active);
    }

    .listbox-option ng-icon {
      visibility: hidden;
    }

    .listbox-option[data-selected] ng-icon {
      visibility: visible;
    }
  `,
})
export default class ListboxSelectExample {
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

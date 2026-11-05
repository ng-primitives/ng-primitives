import { Component, computed, signal } from '@angular/core';
import {
  NgpAutocomplete,
  NgpAutocompleteDropdown,
  NgpAutocompleteFragment,
  NgpAutocompleteInput,
  NgpAutocompleteOption,
  NgpAutocompletePortal,
} from 'ng-primitives/autocomplete';

interface Person {
  readonly handle: string;
  readonly name: string;
}

@Component({
  selector: 'app-autocomplete-mention',
  imports: [
    NgpAutocomplete,
    NgpAutocompleteDropdown,
    NgpAutocompleteOption,
    NgpAutocompleteInput,
    NgpAutocompletePortal,
  ],
  template: `
    <div
      [ngpAutocompleteMinLength]="0"
      (ngpAutocompleteSelected)="message.replaceFragment('@' + $event.handle + ' ')"
      ngpAutocomplete
      ngpAutocompleteAutoActivate
      ngpAutocompleteDropdownPlacement="bottom-start"
    >
      <textarea
        #message="ngpAutocompleteInput"
        (ngpAutocompleteInputFragmentChange)="onFragmentChange($event)"
        ngpAutocompleteInputFragmentMatcher="@"
        placeholder="Write a message, type @ to mention someone"
        ngpAutocompleteInput
      ></textarea>

      <div *ngpAutocompletePortal ngpAutocompleteDropdown>
        @for (person of matchingPeople(); track person.handle) {
          <div [ngpAutocompleteOptionValue]="person" ngpAutocompleteOption>
            <span class="name">{{ person.name }}</span>
            <span class="handle">&#64;{{ person.handle }}</span>
          </div>
        } @empty {
          <div class="empty-message">No one found</div>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }

    [ngpAutocomplete] {
      width: 90%;
      max-width: 420px;
    }

    [ngpAutocompleteInput] {
      display: block;
      width: 100%;
      height: 96px;
      padding: 10px 14px;
      border: none;
      border-radius: 0.625rem;
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-input-shadow);
      box-sizing: border-box;
      color: var(--ngp-text-primary);
      font-family: inherit;
      font-size: 0.875rem;
      letter-spacing: -0.006em;
      line-height: 1.5;
      resize: none;
      outline: none;
    }

    [ngpAutocompleteInput][data-focus] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpAutocompleteInput]::placeholder {
      color: var(--ngp-text-tertiary);
    }

    [ngpAutocompleteDropdown] {
      position: absolute;
      width: 220px;
      max-height: 200px;
      margin-top: 4px;
      padding: 0.25rem;
      overflow-y: auto;
      border: 1px solid var(--ngp-border);
      border-radius: 0.75rem;
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-shadow-lg);
      box-sizing: border-box;
      outline: none;
      z-index: 1001;
    }

    [ngpAutocompleteOption] {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      height: 2.125rem;
      padding: 0 0.75rem;
      border-radius: 0.5rem;
      font-size: 14px;
      letter-spacing: -0.006em;
      cursor: pointer;
      box-sizing: border-box;
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpAutocompleteOption][data-hover],
    [ngpAutocompleteOption][data-active] {
      background-color: var(--ngp-background-hover);
    }

    [ngpAutocompleteOption][data-press] {
      background-color: var(--ngp-background-active);
    }

    .name {
      color: var(--ngp-text-primary);
      font-weight: 510;
    }

    .handle {
      color: var(--ngp-text-tertiary);
      font-size: 12px;
      letter-spacing: -0.011em;
    }

    .empty-message {
      padding: 0.5rem;
      color: var(--ngp-text-secondary);
      font-size: 14px;
      text-align: center;
    }
  `,
})
export default class AutocompleteMentionExample {
  readonly people: Person[] = [
    { handle: 'marty', name: 'Marty McFly' },
    { handle: 'doc', name: 'Emmett Brown' },
    { handle: 'lorraine', name: 'Lorraine Baines' },
    { handle: 'george', name: 'George McFly' },
    { handle: 'biff', name: 'Biff Tannen' },
    { handle: 'jennifer', name: 'Jennifer Parker' },
  ];

  /** The text typed after the @. */
  readonly query = signal('');

  protected readonly matchingPeople = computed(() => {
    const query = this.query().toLowerCase();
    return this.people.filter(
      person => person.handle.startsWith(query) || person.name.toLowerCase().includes(query),
    );
  });

  protected onFragmentChange(fragment: NgpAutocompleteFragment | null): void {
    this.query.set(fragment?.query ?? '');
  }
}

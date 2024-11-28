import { Component } from '@angular/core';
import {
  NgpAutocomplete,
  NgpAutocompleteTrigger,
  NgpAutocompleteOption,
} from 'ng-primitives/autocomplete';
import { NgpInput } from 'ng-primitives/input';

@Component({
  standalone: true,
  selector: 'app-autocomplete',
  imports: [NgpAutocomplete, NgpAutocompleteTrigger, NgpAutocompleteOption, NgpInput],
  template: `
    <input
      [ngpAutocompleteTrigger]="autocomplete"
      ngpInput
      type="text"
      placeholder="Find a customer"
    />

    <ng-template #autocomplete>
      <div ngpAutocomplete>
        <div ngpAutocompleteOption ngpAutocompleteOptionValue="Customer 1">Customer 1</div>
        <div ngpAutocompleteOption ngpAutocompleteOptionValue="Customer 2">Customer 2</div>
        <div ngpAutocompleteOption ngpAutocompleteOptionValue="Customer 3">Customer 3</div>
        <div ngpAutocompleteOption ngpAutocompleteOptionValue="Customer 4">Customer 4</div>
      </div>
    </ng-template>
  `,
  styles: `
    [ngpInput] {
      height: 36px;
      width: 90%;
      border-radius: 8px;
      padding: 0 16px;
      border: none;
      box-shadow:
        0 1px 2px light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.007)),
        0 0 0 1px light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1));
      outline: none;
    }

    [ngpInput][data-focus='true'] {
      box-shadow: 0 0 0 2px rgb(59, 130, 246);
    }

    [ngpInput]::placeholder {
      color: rgb(161 161 170);
    }

    [ngpAutocomplete] {
      display: flex;
      flex-direction: column;
      width: max-content;
      background: light-dark(#fff, #27272a);
      box-shadow:
        0 0 10px rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      padding: 2px;
      margin: 2px 0;
      width: 100%;
    }

    [ngpAutocompleteOption] {
      padding: 8px 16px;
      border: none;
      background: none;
      cursor: pointer;
      transition: background 0.2s;
      border-radius: 6px;
      min-width: 120px;
      text-align: start;
      outline: none;
    }

    [ngpAutocompleteOption][data-hover='true'] {
      background: light-dark(#f5f5f5, #3f3f46);
    }

    [ngpAutocompleteOption][data-focus-visible='true'] {
      box-shadow: 0 0 0 2px light-dark(#005fcc, #99c8ff);
    }

    [ngpAutocompleteOption][data-active='true'] {
      background: light-dark(#f5f5f5, #3f3f46);
    }
  `,
})
export default class AutocompleteExample {}

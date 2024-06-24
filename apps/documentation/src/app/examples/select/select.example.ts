import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDownMini } from '@ng-icons/heroicons/mini';
import {
  NgpSelect,
  NgpSelectButton,
  NgpSelectOption,
  NgpSelectOptions,
} from 'ng-primitives/select';

@Component({
  standalone: true,
  selector: 'app-select',
  imports: [NgIcon, NgpSelectButton, NgpSelect, NgpSelectOption, NgpSelectOptions],
  viewProviders: [provideIcons({ heroChevronDownMini })],
  styles: `
    [ngpSelect] {
      position: relative;
      width: 18rem;
      margin-top: -6rem;
    }

    [ngpSelectButton] {
      position: relative;
      height: 2.5rem;
      width: 100%;
      padding: 0 1rem;
      border-radius: 0.5rem;
      background-color: rgb(255 255 255);
      text-align: start;
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05);
      outline: none;
    }

    [ngpSelectButton]:focus-visible {
      box-shadow:
        0 0 0 1px rgb(0 0 0 / 0.05),
        0 0 0 2px rgb(59 130 246);
    }

    .select-value {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .select-chevron {
      pointer-events: none;
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      display: flex;
      align-items: center;
      padding-right: 0.5rem;
    }

    .select-chevron ng-icon {
      font-size: 1.25rem;
      color: rgb(115 115 115);
    }

    [ngpSelectOptions] {
      display: flex;
      overflow: auto;
      position: absolute;
      max-height: 15rem;
      padding: 0.25rem;
      margin-top: 0.25rem;
      flex-direction: column;
      row-gap: 0.125rem;
      border-radius: 0.5rem;
      overflow: auto;
      outline: none;
      width: 100%;
      background-color: #fff;
      box-shadow:
        0 4px 6px -1px rgb(0 0 0 / 0.1),
        0 2px 4px -2px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05);
    }

    [ngpSelectOptions][data-state='closed'] {
      display: none;
    }

    [ngpSelectOption] {
      display: flex;
      padding: 0.375rem 1rem;
      flex-direction: column;
      row-gap: 0.125rem;
      border-radius: 0.25rem;
      color: rgb(17 24 39);
      cursor: pointer;
      scroll-margin-top: 0.25rem;
      scroll-margin-bottom: 0.25rem;
      user-select: none;
    }

    [ngpSelectOption]:hover {
      background-color: rgb(250 250 250);
      box-shadow: 0 0 0 1px rgb(0 0 0 / 0.05);
    }

    [ngpSelectOption][data-active] {
      box-shadow: 0 0 0 1px rgb(59 130 246 / 0.2);
      background-color: rgb(239 246 255);
    }

    .select-option-title {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .select-option-subtitle {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.75rem;
      color: rgb(115 115 115);
    }
  `,
  template: `
    <div [(ngpSelectValue)]="selectedEmployee" ngpSelect>
      <button ngpSelectButton>
        <span class="select-value">{{ selectedEmployee().name }}</span>
        <span class="select-chevron">
          <ng-icon name="heroChevronDownMini" aria-hidden="true" />
        </span>
      </button>

      <ul ngpSelectOptions>
        @for (employee of employees; track employee.id) {
          <li [ngpSelectOptionValue]="employee" ngpSelectOption>
            <span class="select-option-title">{{ employee.name }}</span>
            <span class="select-option-subtitle">{{ employee.role }}</span>
          </li>
        }
      </ul>
    </div>
  `,
})
export default class SelectExample {
  readonly employees: Employee[] = [
    { id: 1, name: 'Michael Scott', role: 'Regional Manager' },
    { id: 2, name: 'Jim Halpert', role: 'Sales Representative' },
    { id: 3, name: 'Pam Beesly', role: 'Receptionist' },
    { id: 4, name: 'Dwight Schrute', role: 'Assistant to the Regional Manager' },
    { id: 5, name: 'Angela Martin', role: 'Senior Accountant' },
    { id: 6, name: 'Kevin Malone', role: 'Accountant' },
    { id: 7, name: 'Oscar Martinez', role: 'Accountant' },
    { id: 8, name: 'Creed Bratton', role: 'Quabity Ashuance' },
    { id: 9, name: 'Kelly Kapoor', role: 'Customer Service Representative' },
    { id: 10, name: 'Ryan Howard', role: 'Temp' },
  ];

  readonly selectedEmployee = signal<Employee>(this.employees[0]);
}

interface Employee {
  id: number;
  name: string;
  role: string;
}

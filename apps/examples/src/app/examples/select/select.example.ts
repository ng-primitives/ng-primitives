import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDownMini } from '@ng-icons/heroicons/mini';
import {
  NgpSelectButtonDirective,
  NgpSelectDirective,
  NgpSelectOptionDirective,
  NgpSelectOptionsDirective,
} from '@ng-primitives/ng-primitives/select';

@Component({
  standalone: true,
  selector: 'app-select',
  imports: [
    NgIcon,
    NgpSelectButtonDirective,
    NgpSelectDirective,
    NgpSelectOptionDirective,
    NgpSelectOptionsDirective,
  ],
  viewProviders: [provideIcons({ heroChevronDownMini })],
  template: `
    <div class="relative -mt-24 w-72" [(ngpSelectValue)]="selectedEmployee" ngpSelect>
      <button
        class="relative h-10 w-full rounded-lg bg-white px-4 text-start shadow outline-none ring-1 ring-black/5 focus-visible:ring-2 focus-visible:ring-blue-500"
        ngpSelectButton
      >
        <span class="block truncate">{{ selectedEmployee().name }}</span>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ng-icon class="text-xl text-neutral-500" name="heroChevronDownMini" aria-hidden="true" />
        </span>
      </button>

      <ul
        class="absolute mt-1 flex max-h-60 w-full flex-col gap-y-0.5 overflow-auto rounded-lg bg-white p-1 shadow-md outline-none ring-1 ring-black/5 data-[state=closed]:hidden"
        ngpSelectOptions
      >
        @for (employee of employees; track employee.id) {
          <li
            class="flex cursor-pointer select-none scroll-my-1 flex-col gap-y-0.5 rounded py-1.5 pl-4 pr-4 text-gray-900 hover:bg-neutral-50 hover:ring-1 hover:ring-black/5 data-[active]:bg-blue-50 data-[active]:ring-1 data-[active]:ring-blue-500/20"
            [ngpSelectOptionValue]="employee"
            ngpSelectOption
          >
            <span class="block truncate">{{ employee.name }}</span>
            <span class="block truncate text-xs text-neutral-500">{{ employee.role }}</span>
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

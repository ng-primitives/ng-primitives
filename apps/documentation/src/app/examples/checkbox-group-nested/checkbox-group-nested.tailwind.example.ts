import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckMini, heroMinusMini } from '@ng-icons/heroicons/mini';
import { NgpCheckbox } from 'ng-primitives/checkbox';
import { NgpCheckboxGroup } from 'ng-primitives/checkbox-group';

const checkboxClass =
  'inline-flex h-5 w-5 flex-none cursor-pointer items-center justify-center rounded-[0.4375rem] border-[1.5px] border-gray-300 bg-white align-middle text-[0.8125rem] text-white outline-hidden transition-all data-checked:border-[#f01e2b] data-checked:bg-[#f01e2b] data-checked:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),0_1px_1px_0_rgba(0,0,0,0.06)] data-focus-visible:ring-2 data-focus-visible:ring-blue-500/40 data-focus-visible:ring-offset-2 data-hover:border-[#f01e2b] data-indeterminate:border-[#f01e2b] data-indeterminate:bg-[#f01e2b] dark:border-zinc-800 dark:bg-zinc-950 dark:data-checked:border-[#ff4651] dark:data-checked:bg-[#ff4651] dark:data-focus-visible:ring-2 dark:data-focus-visible:ring-blue-400/45 dark:data-focus-visible:ring-offset-zinc-950 dark:data-hover:border-[#ff4651] dark:data-indeterminate:border-[#ff4651] dark:data-indeterminate:bg-[#ff4651]';

@Component({
  selector: 'app-checkbox-group-nested',
  imports: [NgIcon, NgpCheckbox, NgpCheckboxGroup],
  providers: [provideIcons({ heroCheckMini, heroMinusMini })],
  template: `
    <div
      class="grid w-60 gap-2.5 text-sm text-gray-900 dark:text-zinc-100"
      [ngpCheckboxGroupAllValues]="mainPermissions"
      [ngpCheckboxGroupValue]="mainValue()"
      (ngpCheckboxGroupValueChange)="onMainValueChange($event)"
      ngpCheckboxGroup
      aria-label="Permissions"
    >
      <label class="flex cursor-pointer items-center gap-2 font-semibold">
        <span class="${checkboxClass}" #permissions="ngpCheckbox" ngpCheckbox ngpCheckboxParent>
          @if (permissions.state.indeterminate()) {
            <ng-icon name="heroMinusMini" aria-hidden="true" />
          } @else if (permissions.state.checked()) {
            <ng-icon name="heroCheckMini" aria-hidden="true" />
          }
        </span>
        Permissions
      </label>
      <label class="ml-6 flex cursor-pointer items-center gap-2">
        <span
          class="${checkboxClass}"
          #dashboard="ngpCheckbox"
          ngpCheckbox
          ngpCheckboxValue="view-dashboard"
        >
          @if (dashboard.state.checked()) {
            <ng-icon name="heroCheckMini" aria-hidden="true" />
          }
        </span>
        View Dashboard
      </label>
      <label class="ml-6 flex cursor-pointer items-center gap-2">
        <span
          class="${checkboxClass}"
          #reports="ngpCheckbox"
          ngpCheckbox
          ngpCheckboxValue="access-reports"
        >
          @if (reports.state.checked()) {
            <ng-icon name="heroCheckMini" aria-hidden="true" />
          }
        </span>
        Access Reports
      </label>

      <div
        class="ml-6 grid gap-2.5"
        [ngpCheckboxGroupAllValues]="managementPermissions"
        [ngpCheckboxGroupValue]="managementValue()"
        (ngpCheckboxGroupValueChange)="onManagementValueChange($event)"
        ngpCheckboxGroup
        aria-label="User permissions"
      >
        <label class="flex cursor-pointer items-center gap-2 font-semibold">
          <span
            class="${checkboxClass}"
            #userPermissions="ngpCheckbox"
            ngpCheckbox
            ngpCheckboxParent
          >
            @if (userPermissions.state.indeterminate()) {
              <ng-icon name="heroMinusMini" aria-hidden="true" />
            } @else if (userPermissions.state.checked()) {
              <ng-icon name="heroCheckMini" aria-hidden="true" />
            }
          </span>
          User Permissions
        </label>
        <label class="ml-6 flex cursor-pointer items-center gap-2">
          <span
            class="${checkboxClass}"
            #createUser="ngpCheckbox"
            ngpCheckbox
            ngpCheckboxValue="create-user"
          >
            @if (createUser.state.checked()) {
              <ng-icon name="heroCheckMini" aria-hidden="true" />
            }
          </span>
          Create User
        </label>
        <label class="ml-6 flex cursor-pointer items-center gap-2">
          <span
            class="${checkboxClass}"
            #editUser="ngpCheckbox"
            ngpCheckbox
            ngpCheckboxValue="edit-user"
          >
            @if (editUser.state.checked()) {
              <ng-icon name="heroCheckMini" aria-hidden="true" />
            }
          </span>
          Edit User
        </label>
        <label class="ml-6 flex cursor-pointer items-center gap-2">
          <span
            class="${checkboxClass}"
            #deleteUser="ngpCheckbox"
            ngpCheckbox
            ngpCheckboxValue="delete-user"
          >
            @if (deleteUser.state.checked()) {
              <ng-icon name="heroCheckMini" aria-hidden="true" />
            }
          </span>
          Delete User
        </label>
        <label class="ml-6 flex cursor-pointer items-center gap-2">
          <span
            class="${checkboxClass}"
            #assignRoles="ngpCheckbox"
            ngpCheckbox
            ngpCheckboxValue="assign-roles"
          >
            @if (assignRoles.state.checked()) {
              <ng-icon name="heroCheckMini" aria-hidden="true" />
            }
          </span>
          Assign Roles
        </label>
      </div>
    </div>
  `,
})
export default class CheckboxGroupNestedExample {
  readonly mainPermissions = ['view-dashboard', 'manage-users', 'access-reports'];
  readonly managementPermissions = ['create-user', 'edit-user', 'delete-user', 'assign-roles'];
  readonly mainValue = signal<string[]>([]);
  readonly managementValue = signal<string[]>([]);

  onMainValueChange(value: string[]): void {
    this.mainValue.set(value);
    this.managementValue.set(value.includes('manage-users') ? [...this.managementPermissions] : []);
  }

  onManagementValueChange(value: string[]): void {
    this.managementValue.set(value);
    this.mainValue.update(currentValue =>
      value.length === this.managementPermissions.length
        ? Array.from(new Set([...currentValue, 'manage-users']))
        : currentValue.filter(current => current !== 'manage-users'),
    );
  }
}

import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckMini, heroMinusMini } from '@ng-icons/heroicons/mini';
import { NgpCheckbox } from 'ng-primitives/checkbox';
import { NgpCheckboxGroup } from 'ng-primitives/checkbox-group';

@Component({
  selector: 'app-checkbox-group-nested',
  imports: [NgIcon, NgpCheckbox, NgpCheckboxGroup],
  providers: [provideIcons({ heroCheckMini, heroMinusMini })],
  template: `
    <div class="permissions">
      <div
        [ngpCheckboxGroupAllValues]="mainPermissions"
        [ngpCheckboxGroupValue]="mainValue()"
        (ngpCheckboxGroupValueChange)="onMainValueChange($event)"
        ngpCheckboxGroup
        aria-label="Permissions"
      >
        <label>
          <span #permissions="ngpCheckbox" ngpCheckbox ngpCheckboxParent>
            @if (permissions.state.indeterminate()) {
              <ng-icon name="heroMinusMini" aria-hidden="true" />
            } @else if (permissions.state.checked()) {
              <ng-icon name="heroCheckMini" aria-hidden="true" />
            }
          </span>
          Permissions
        </label>

        <label class="child">
          <span #dashboard="ngpCheckbox" ngpCheckbox ngpCheckboxValue="view-dashboard">
            @if (dashboard.state.checked()) {
              <ng-icon name="heroCheckMini" aria-hidden="true" />
            }
          </span>
          View Dashboard
        </label>

        <label class="child">
          <span #reports="ngpCheckbox" ngpCheckbox ngpCheckboxValue="access-reports">
            @if (reports.state.checked()) {
              <ng-icon name="heroCheckMini" aria-hidden="true" />
            }
          </span>
          Access Reports
        </label>

        <div
          class="nested"
          [ngpCheckboxGroupAllValues]="managementPermissions"
          [ngpCheckboxGroupValue]="managementValue()"
          (ngpCheckboxGroupValueChange)="onManagementValueChange($event)"
          ngpCheckboxGroup
          aria-label="User permissions"
        >
          <label>
            <span #userPermissions="ngpCheckbox" ngpCheckbox ngpCheckboxParent>
              @if (userPermissions.state.indeterminate()) {
                <ng-icon name="heroMinusMini" aria-hidden="true" />
              } @else if (userPermissions.state.checked()) {
                <ng-icon name="heroCheckMini" aria-hidden="true" />
              }
            </span>
            User Permissions
          </label>

          <label class="child">
            <span #createUser="ngpCheckbox" ngpCheckbox ngpCheckboxValue="create-user">
              @if (createUser.state.checked()) {
                <ng-icon name="heroCheckMini" aria-hidden="true" />
              }
            </span>
            Create User
          </label>

          <label class="child">
            <span #editUser="ngpCheckbox" ngpCheckbox ngpCheckboxValue="edit-user">
              @if (editUser.state.checked()) {
                <ng-icon name="heroCheckMini" aria-hidden="true" />
              }
            </span>
            Edit User
          </label>

          <label class="child">
            <span #deleteUser="ngpCheckbox" ngpCheckbox ngpCheckboxValue="delete-user">
              @if (deleteUser.state.checked()) {
                <ng-icon name="heroCheckMini" aria-hidden="true" />
              }
            </span>
            Delete User
          </label>

          <label class="child">
            <span #assignRoles="ngpCheckbox" ngpCheckbox ngpCheckboxValue="assign-roles">
              @if (assignRoles.state.checked()) {
                <ng-icon name="heroCheckMini" aria-hidden="true" />
              }
            </span>
            Assign Roles
          </label>
        </div>
      </div>
    </div>
  `,
  styles: `
    [ngpCheckboxGroup] {
      display: grid;
      gap: 0.625rem;
    }

    .permissions {
      width: 15rem;
    }

    .nested {
      margin-top: 0.25rem;
      margin-left: 1.5rem;
    }

    label {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      color: var(--ngp-text-primary);
      cursor: pointer;
      font-size: 0.875rem;
    }

    label.child {
      margin-left: 1.5rem;
    }

    [ngpCheckbox] {
      display: inline-flex;
      vertical-align: middle;
      width: 1.25rem;
      height: 1.25rem;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      border-radius: 0.4375rem;
      border: 1.5px solid var(--ngp-border-secondary);
      background-color: var(--ngp-background);
      padding: 0;
      outline: none;
      flex: none;
      color: var(--ngp-primary-text);
      font-size: 0.8125rem;
      transition:
        background-color 160ms cubic-bezier(0.4, 0, 0.2, 1),
        border-color 160ms cubic-bezier(0.4, 0, 0.2, 1),
        box-shadow 160ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpCheckbox][data-hover] {
      border-color: var(--ngp-primary);
    }

    [ngpCheckbox][data-checked],
    [ngpCheckbox][data-indeterminate] {
      border-color: var(--ngp-primary);
      background: var(--ngp-primary);
      box-shadow:
        inset 0 1px 0 0 rgba(255, 255, 255, 0.28),
        0 1px 1px 0 rgba(0, 0, 0, 0.06);
    }

    [ngpCheckbox][data-checked][data-hover],
    [ngpCheckbox][data-indeterminate][data-hover] {
      border-color: var(--ngp-primary-hover);
      background: var(--ngp-primary-hover);
    }

    ng-icon {
      width: 0.8125rem;
      height: 0.8125rem;
      color: var(--ngp-primary-text);
    }

    [ngpCheckbox][data-focus-visible] {
      box-shadow:
        0 0 0 2px var(--ngp-background),
        0 0 0 4px var(--ngp-focus-ring);
    }
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

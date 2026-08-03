import { Component, signal } from '@angular/core';
import { NgpCheckbox } from 'ng-primitives/checkbox';
import { NgpCheckboxGroup } from 'ng-primitives/checkbox-group';

@Component({
  selector: 'app-checkbox-group-nested',
  imports: [NgpCheckbox, NgpCheckboxGroup],
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
          <span ngpCheckbox ngpCheckboxParent></span>
          Permissions
        </label>

        <label class="child">
          <span ngpCheckbox ngpCheckboxValue="view-dashboard"></span>
          View Dashboard
        </label>

        <label class="child">
          <span ngpCheckbox ngpCheckboxValue="access-reports"></span>
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
            <span ngpCheckbox ngpCheckboxParent></span>
            User Permissions
          </label>

          <label class="child">
            <span ngpCheckbox ngpCheckboxValue="create-user"></span>
            Create User
          </label>

          <label class="child">
            <span ngpCheckbox ngpCheckboxValue="edit-user"></span>
            Edit User
          </label>

          <label class="child">
            <span ngpCheckbox ngpCheckboxValue="delete-user"></span>
            Delete User
          </label>

          <label class="child">
            <span ngpCheckbox ngpCheckboxValue="assign-roles"></span>
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
      width: 1.125rem;
      height: 1.125rem;
      flex: none;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--ngp-border-secondary);
      border-radius: 0.3125rem;
      outline: none;
    }

    [ngpCheckbox][data-checked],
    [ngpCheckbox][data-indeterminate] {
      border-color: var(--ngp-primary);
      background: var(--ngp-primary);
    }

    [ngpCheckbox][data-checked]::after {
      width: 0.35rem;
      height: 0.6rem;
      border: solid var(--ngp-primary-text);
      border-width: 0 2px 2px 0;
      transform: rotate(45deg) translate(-1px, -1px);
      content: '';
    }

    [ngpCheckbox][data-indeterminate]::after {
      width: 0.55rem;
      height: 2px;
      background: var(--ngp-primary-text);
      content: '';
    }

    [ngpCheckbox][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
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

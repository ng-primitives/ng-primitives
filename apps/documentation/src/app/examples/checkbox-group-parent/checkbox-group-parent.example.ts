import { Component } from '@angular/core';
import { NgpCheckbox } from 'ng-primitives/checkbox';
import { NgpCheckboxGroup } from 'ng-primitives/checkbox-group';

@Component({
  selector: 'app-checkbox-group-parent',
  imports: [NgpCheckbox, NgpCheckboxGroup],
  template: `
    <div
      [ngpCheckboxGroupAllValues]="allValues"
      [ngpCheckboxGroupDefaultValue]="defaultValue"
      ngpCheckboxGroup
      aria-labelledby="checkbox-group-parent-label"
    >
      <div class="label" id="checkbox-group-parent-label">Notification channels</div>

      <label>
        <span ngpCheckbox ngpCheckboxParent></span>
        All notifications
      </label>

      <label class="child">
        <span ngpCheckbox ngpCheckboxValue="email"></span>
        Email
      </label>

      <label class="child">
        <span ngpCheckbox ngpCheckboxValue="sms"></span>
        SMS
      </label>
    </div>
  `,
  styles: `
    [ngpCheckboxGroup] {
      display: grid;
      gap: 0.625rem;
      width: 14rem;
    }

    .label {
      color: var(--ngp-text-secondary);
      font-size: 0.8125rem;
      font-weight: 600;
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
export default class CheckboxGroupParentExample {
  readonly allValues = ['email', 'sms'];
  readonly defaultValue = ['email'];
}

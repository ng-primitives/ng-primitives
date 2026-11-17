import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckMini, heroMinusMini } from '@ng-icons/heroicons/mini';
import { NgpCheckbox } from 'ng-primitives/checkbox';
import { NgpCheckboxGroup } from 'ng-primitives/checkbox-group';

@Component({
  selector: 'app-checkbox-group-parent',
  imports: [NgIcon, NgpCheckbox, NgpCheckboxGroup],
  providers: [provideIcons({ heroCheckMini, heroMinusMini })],
  template: `
    <div
      [ngpCheckboxGroupAllValues]="allValues"
      [ngpCheckboxGroupDefaultValue]="defaultValue"
      ngpCheckboxGroup
      aria-labelledby="checkbox-group-parent-label"
    >
      <div class="label" id="checkbox-group-parent-label">Notification channels</div>

      <label>
        <span #parent="ngpCheckbox" ngpCheckbox ngpCheckboxParent>
          @if (parent.state.indeterminate()) {
            <ng-icon name="heroMinusMini" aria-hidden="true" />
          } @else if (parent.state.checked()) {
            <ng-icon name="heroCheckMini" aria-hidden="true" />
          }
        </span>
        All notifications
      </label>

      <label class="child">
        <span #email="ngpCheckbox" ngpCheckbox ngpCheckboxValue="email">
          @if (email.state.checked()) {
            <ng-icon name="heroCheckMini" aria-hidden="true" />
          }
        </span>
        Email
      </label>

      <label class="child">
        <span #sms="ngpCheckbox" ngpCheckbox ngpCheckboxValue="sms">
          @if (sms.state.checked()) {
            <ng-icon name="heroCheckMini" aria-hidden="true" />
          }
        </span>
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
export default class CheckboxGroupParentExample {
  readonly allValues = ['email', 'sms'];
  readonly defaultValue = ['email'];
}

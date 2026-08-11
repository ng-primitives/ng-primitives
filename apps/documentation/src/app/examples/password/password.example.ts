import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { NgpButton } from 'ng-primitives/button';
import { NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpPassword, NgpPasswordInput, NgpPasswordToggle } from 'ng-primitives/password';

@Component({
  selector: 'app-password',
  imports: [
    NgpFormField,
    NgpLabel,
    NgpPassword,
    NgpPasswordInput,
    NgpPasswordToggle,
    NgpButton,
    NgIcon,
  ],
  providers: [provideIcons({ lucideEye, lucideEyeOff })],
  template: `
    <div ngpFormField>
      <label ngpLabel>Password</label>
      <div #password="ngpPassword" ngpPassword>
        <input
          ngpPasswordInput
          type="password"
          placeholder="Enter your password"
          autocomplete="current-password"
        />
        <button ngpButton ngpPasswordToggle>
          <ng-icon [name]="password.isVisible() ? 'lucideEyeOff' : 'lucideEye'" />
        </button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }

    [ngpFormField] {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 300px;
    }

    [ngpLabel] {
      color: var(--ngp-text-primary);
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 510;
      letter-spacing: -0.014em;
      margin: 0;
    }

    [ngpPassword] {
      position: relative;
    }

    [ngpPasswordInput] {
      height: 2.125rem;
      width: 100%;
      border-radius: 0.5rem;
      padding: 0 40px 0 12px;
      border: none;
      background: var(--ngp-background);
      color: var(--ngp-text-primary);
      font-size: 0.875rem;
      letter-spacing: -0.006em;
      box-shadow: var(--ngp-input-shadow);
      outline: none;
    }

    [ngpPasswordInput][data-focus] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpPasswordInput]::placeholder {
      color: var(--ngp-text-placeholder);
    }

    [ngpPasswordToggle] {
      position: absolute;
      top: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 2.125rem;
      width: 2.125rem;
      border: none;
      border-radius: 0.5rem;
      background-color: transparent;
      color: var(--ngp-text-tertiary);
      font-size: 1.125rem;
      cursor: pointer;
      outline: none;
      transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpPasswordToggle][data-hover] {
      color: var(--ngp-text-secondary);
    }

    /* red = active state: the password is currently visible */
    [ngpPasswordToggle][data-visible] {
      color: var(--ngp-primary);
    }

    [ngpPasswordToggle][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: -2px;
    }
  `,
})
export default class PasswordExample {}

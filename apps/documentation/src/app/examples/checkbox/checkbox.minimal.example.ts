import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckMini } from '@ng-icons/heroicons/mini';
import { NgpCheckbox } from 'ng-primitives/checkbox';

@Component({
  selector: 'app-checkbox-minimal',
  imports: [NgIcon, NgpCheckbox],
  providers: [provideIcons({ heroCheckMini })],
  styles: `
    [ngpCheckbox] {
      display: flex;
      width: 1rem;
      height: 1rem;
      align-items: center;
      justify-content: center;
      border: 2px solid CanvasText;
    }
  `,
  template: `
    <span [(ngpCheckboxChecked)]="checked" ngpCheckbox>
      @if (checked()) {
        <ng-icon name="heroCheckMini" aria-hidden="true" />
      }
    </span>
  `,
})
export default class CheckboxExample {
  /**
   * The checked state of the checkbox.
   */
  readonly checked = signal(true);
}

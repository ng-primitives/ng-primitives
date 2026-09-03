import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { NgpDescription, NgpError, NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpInput } from 'ng-primitives/input';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';

@Component({
  imports: [
    NgpInput,
    NgpLabel,
    NgpDescription,
    NgpError,
    NgpFormField,
    NgpPopoverTrigger,
    NgpPopover,
    ReactiveFormsModule,
    FormField,
  ],
  template: `
    <div class="form">
      <div [ngpFormFieldSource]="reactiveForm.controls.name" ngpFormField>
        <label ngpLabel>Name</label>
        <p ngpDescription>Please provide your name.</p>
        <input
          [ngpPopoverTrigger]="reactiveFormPopover"
          [value]="reactiveForm.controls.name.value"
          ngpInput
          readonly
        />
        <p ngpError ngpErrorValidator="required">This field is required</p>
      </div>

      <div [ngpFormFieldSource]="signalForm.name" ngpFormField>
        <label ngpLabel>Name</label>
        <p ngpDescription>Please provide your name.</p>
        <input
          [ngpPopoverTrigger]="signalFormPopover"
          [value]="signalForm.name().value()"
          ngpInput
          readonly
        />
        <p ngpError ngpErrorValidator="required">This field is required</p>
      </div>
    </div>

    <ng-template #reactiveFormPopover>
      <div ngpPopover>
        <input [formControl]="reactiveForm.controls.name" ngpInput placeholder="What's your name" />
      </div>
    </ng-template>

    <ng-template #signalFormPopover>
      <div ngpPopover>
        <input [formField]="signalForm.name" ngpInput placeholder="What's your name" />
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: contents;
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    [ngpFormField] {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 300px;
    }

    [ngpInput] {
      height: 2.125rem;
      width: 100%;
      border-radius: 0.5rem;
      padding: 0 16px;
      border: none;
      box-shadow: var(--ngp-input-shadow);
      background-color: var(--ngp-background);
      color: var(--ngp-text-primary);
      font-size: 0.875rem;
      letter-spacing: -0.006em;
      outline: none;
    }

    [ngpInput]:focus {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpInput]::placeholder {
      color: var(--ngp-text-placeholder);
    }

    [ngpLabel] {
      color: var(--ngp-text-primary);
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 510;
      margin: 0;
    }

    [ngpDescription] {
      color: var(--ngp-text-secondary);
      font-size: 0.75rem;
      line-height: 1rem;
      margin: 0 0 4px;
    }

    [ngpError] {
      display: none;
      color: var(--ngp-primary);
      font-size: 0.75rem;
      line-height: 1rem;
      margin: 0;
    }

    [ngpError][data-validator='fail'][data-dirty] {
      display: block;
    }

    [ngpPopover] {
      position: absolute;
      display: flex;
      flex-direction: column;
      row-gap: 4px;
      max-width: max-content;
      border-radius: 0.75rem;
      background: var(--ngp-background);
      padding: 0.75rem 1rem;
      box-shadow: var(--ngp-shadow);
      border: 1px solid var(--ngp-border);
      outline: none;
      animation: popover-show 0.1s ease-out;
      transform-origin: var(--ngp-popover-transform-origin);
    }

    [ngpPopover][data-exit] {
      animation: popover-hide 0.1s ease-out;
    }

    @keyframes popover-show {
      0% {
        opacity: 0;
        transform: scale(0.9);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes popover-hide {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(0.9);
      }
    }
  `,
})
export default class OuterFormFieldExample {
  readonly reactiveForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
  });

  readonly signalForm = form(signal({ name: '' }), schema => {
    required(schema.name);
  });
}

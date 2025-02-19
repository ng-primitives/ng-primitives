import { Component } from '@angular/core';
import { NgpDescription, NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpSelect } from 'ng-primitives/select';

@Component({
  selector: 'app-select-form-field',
  imports: [NgpSelect, NgpFormField, NgpLabel, NgpDescription],
  template: `
    <div ngpFormField>
      <label ngpLabel>Time Format</label>
      <p ngpDescription>Choose between 12-hour and 24-hour time formats.</p>
      <select ngpSelect>
        <option value="24">24 hours</option>
        <option value="12">12 hours</option>
      </select>
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
      width: 90%;
    }

    [ngpLabel] {
      color: var(--text-primary);
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 500;
      margin: 0;
    }

    [ngpDescription] {
      color: var(--text-secondary);
      font-size: 0.75rem;
      line-height: 1rem;
      margin: 0 0 4px;
    }

    select {
      all: unset;
      appearance: none;
      display: flex;
      width: 90%;
      align-items: center;
      height: 2.5rem;
      padding: 0 1rem;
      border-radius: 0.5rem;
      background-color: var(--background);
      text-align: start;
      box-shadow: var(--button-shadow);
      outline: none;
      background-position-x: calc(100% - 10px);
      background-position-y: 50%;
      background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0iIzczNzM3MyI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNS4yMiA4LjIyYS43NS43NSAwIDAgMSAxLjA2IDBMMTAgMTEuOTRsMy43Mi0zLjcyYS43NS43NSAwIDEgMSAxLjA2IDEuMDZsLTQuMjUgNC4yNWEuNzUuNzUgMCAwIDEtMS4wNiAwTDUuMjIgOS4yOGEuNzUuNzUgMCAwIDEgMC0xLjA2WiIgY2xpcC1ydWxlPSJldmVub2RkIj48L3BhdGg+PC9zdmc+');
      background-size: 1.25rem;
      background-repeat: no-repeat;
    }

    select[data-hover] {
      background-color: var(--background-hover);
    }

    select[data-focus-visible] {
      outline: 2px solid var(--focus-ring);
      outline-offset: 0;
    }

    select[data-press] {
      background-color: var(--background-active);
    }
  `,
})
export default class SelectFormFieldExample {}

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
      --select-label-color: rgb(9 9 11);
      --select-description-color: rgb(113 113 122);
      --select-background-color: rgb(255 255 255);
      --select-hover-background-color: rgb(250 250 250);
      --select-pressed-background-color: rgb(245 245 245);

      --select-label-color-dark: #e4e4e7;
      --select-description-color-dark: #96969e;
      --select-background-color-dark: rgb(43 43 47);
      --select-hover-background-color-dark: rgb(63 63 70);
      --select-pressed-background-color-dark: rgb(39 39 42);
    }

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
      color: light-dark(var(--select-label-color), var(--select-label-color-dark));
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 500;
      margin: 0;
    }

    [ngpDescription] {
      color: light-dark(var(--select-description-color), var(--select-description-color-dark));
      font-size: 0.75rem;
      line-height: 1rem;
      margin: 0 0 4px;
    }

    select {
      all: unset;
      appearance: none;
      display: flex;
      align-items: center;
      height: 2.5rem;
      padding: 0 1rem;
      border-radius: 0.5rem;
      background-color: light-dark(
        var(--select-background-color),
        var(--select-background-color-dark)
      );
      text-align: start;
      box-shadow:
        0 1px 3px 0 light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1)),
        0 1px 2px -1px light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1)),
        0 0 0 1px light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.05));
      outline: none;
      background-position-x: calc(100% - 10px);
      background-position-y: 50%;
      background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0iIzczNzM3MyI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNS4yMiA4LjIyYS43NS43NSAwIDAgMSAxLjA2IDBMMTAgMTEuOTRsMy43Mi0zLjcyYS43NS43NSAwIDEgMSAxLjA2IDEuMDZsLTQuMjUgNC4yNWEuNzUuNzUgMCAwIDEtMS4wNiAwTDUuMjIgOS4yOGEuNzUuNzUgMCAwIDEgMC0xLjA2WiIgY2xpcC1ydWxlPSJldmVub2RkIj48L3BhdGg+PC9zdmc+');
      background-size: 1.25rem;
      background-repeat: no-repeat;
    }

    select[data-hover] {
      background-color: light-dark(
        var(--select-hover-background-color),
        var(--select-hover-background-color-dark)
      );
    }

    select[data-focus-visible] {
      box-shadow:
        0 0 0 2px rgb(59, 130, 246),
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05);
    }

    select[data-press] {
      background-color: light-dark(
        var(--select-pressed-background-color),
        var(--select-pressed-background-color-dark)
      );
    }
  `,
})
export default class SelectFormFieldExample {}

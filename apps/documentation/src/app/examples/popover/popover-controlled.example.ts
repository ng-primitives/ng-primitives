import { Component, signal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';

@Component({
  selector: 'app-popover-controlled',
  imports: [NgpPopoverTrigger, NgpPopover, NgpButton],
  template: `
    <div class="row">
      <button
        class="title"
        [(ngpPopoverTriggerOpen)]="open"
        [ngpPopoverTrigger]="rename"
        ngpPopoverTriggerPlacement="bottom-start"
        ngpButton
        type="button"
      >
        {{ name() }}
      </button>
      <button class="secondary" (click)="open.set(true)" ngpButton type="button">Rename</button>
    </div>

    <ng-template #rename>
      <form (submit)="save($event, input.value)" ngpPopover>
        <label for="popover-controlled-name">Name</label>
        <input id="popover-controlled-name" #input [value]="name()" />
        <div class="footer">
          <button class="primary" ngpButton type="submit">Save</button>
        </div>
      </form>
    </ng-template>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    button {
      height: 2.125rem;
      padding-inline: 0.625rem;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 510;
      letter-spacing: -0.006em;
      color: var(--ngp-text-primary);
      background-color: transparent;
      outline: none;
      cursor: pointer;
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    button[data-hover] {
      background-color: var(--ngp-background-hover);
    }

    button[data-press] {
      background-color: var(--ngp-background-active);
    }

    button[data-focus-visible] {
      box-shadow: 0 0 0 2px var(--ngp-focus-ring);
    }

    .title {
      font-size: 0.9375rem;
      font-weight: 590;
      letter-spacing: -0.014em;
    }

    .secondary {
      background-color: var(--ngp-background);
      box-shadow:
        inset 0 0 0 1px var(--ngp-border),
        0 1px 2px 0 rgba(0, 0, 0, 0.04);
    }

    .primary {
      padding-inline: 0.875rem;
      color: var(--ngp-primary-text);
      background-color: var(--ngp-primary);
    }

    .primary[data-hover] {
      background-color: var(--ngp-primary-hover);
    }

    .primary[data-press] {
      background-color: var(--ngp-primary-active);
    }

    [ngpPopover] {
      position: absolute;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 16rem;
      margin: 0;
      padding: 0.75rem;
      border-radius: 0.75rem;
      background-color: var(--ngp-background);
      box-shadow:
        inset 0 0 0 1px var(--ngp-border),
        0 8px 16px -4px rgb(0 0 0 / 0.1);
      outline: none;
      transform-origin: var(--ngp-popover-transform-origin);
    }

    [ngpPopover][data-enter] {
      animation: popover-show 150ms ease-out;
    }

    [ngpPopover][data-exit] {
      animation: popover-hide 120ms ease-out;
    }

    label {
      font-size: 0.8125rem;
      font-weight: 510;
      letter-spacing: -0.014em;
      color: var(--ngp-text-primary);
    }

    input {
      height: 2.125rem;
      padding-inline: 0.625rem;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      letter-spacing: -0.006em;
      color: var(--ngp-text-primary);
      background-color: var(--ngp-background);
      box-shadow: inset 0 0 0 1px var(--ngp-border);
      outline: none;
    }

    input:focus {
      box-shadow: inset 0 0 0 2px var(--ngp-focus-ring);
    }

    .footer {
      display: flex;
      justify-content: flex-end;
    }

    @keyframes popover-show {
      0% {
        opacity: 0;
        transform: translateY(-2px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes popover-hide {
      0% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      [ngpPopover][data-enter],
      [ngpPopover][data-exit] {
        animation-duration: 0s;
      }
    }
  `,
})
export default class PopoverControlledExample {
  readonly open = signal(false);
  readonly name = signal('Q3 roadmap');

  save(event: Event, name: string): void {
    event.preventDefault();
    this.name.set(name.trim() || this.name());
    this.open.set(false);
  }
}

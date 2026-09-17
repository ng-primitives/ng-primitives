import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';

@Component({
  selector: 'app-popover-keep-mounted',
  imports: [NgpPopoverTrigger, NgpPopover, NgpButton],
  template: `
    <p class="hint">Type a note, close the popover, then open it again.</p>

    <div class="triggers">
      <button [ngpPopoverTrigger]="defaultPopover" ngpButton type="button">Default</button>

      <button
        [ngpPopoverTrigger]="keptPopover"
        ngpButton
        ngpPopoverTriggerKeepMounted
        type="button"
      >
        Keep mounted
      </button>
    </div>

    <ng-template #defaultPopover>
      <div ngpPopover>
        <h3>Default</h3>
        <textarea rows="2" placeholder="Discarded on close..."></textarea>
        <p>Starts empty every time.</p>
      </div>
    </ng-template>

    <ng-template #keptPopover>
      <div ngpPopover>
        <h3>Kept mounted</h3>
        <textarea rows="2" placeholder="Still here on reopen..."></textarea>
        <p>Whatever you typed is still here.</p>
      </div>
    </ng-template>
  `,
  styles: `
    .hint {
      margin: 0 0 0.75rem;
      font-size: 13px;
      letter-spacing: -0.011em;
      color: var(--ngp-text-tertiary);
      text-align: center;
    }

    .triggers {
      display: flex;
      justify-content: center;
      column-gap: 0.5rem;
    }

    button {
      height: 2.125rem;
      padding-inline: 0.875rem;
      border-radius: 0.5rem;
      background-color: var(--ngp-background);
      color: var(--ngp-text-primary);
      font-weight: 510;
      letter-spacing: -0.006em;
      outline: none;
      box-shadow:
        inset 0 0 0 1px var(--ngp-border),
        0 1px 2px 0 rgba(0, 0, 0, 0.04);
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

    [ngpPopover] {
      position: absolute;
      display: flex;
      width: 260px;
      flex-direction: column;
      row-gap: 0.5rem;
      border: 1px solid var(--ngp-border);
      border-radius: 0.75rem;
      background: var(--ngp-background);
      padding: 0.75rem;
      box-shadow: var(--ngp-shadow);
      outline: none;
      transform-origin: var(--ngp-popover-transform-origin);
      animation: popover-show 0.15s ease-out;
    }

    [ngpPopover][data-exit] {
      animation: popover-hide 0.15s ease-out;
    }

    [ngpPopover] h3 {
      margin: 0;
      font-size: 13px;
      font-weight: 590;
      letter-spacing: -0.014em;
      color: var(--ngp-text-primary);
    }

    [ngpPopover] p {
      margin: 0;
      font-size: 12px;
      letter-spacing: -0.011em;
      color: var(--ngp-text-tertiary);
    }

    [ngpPopover] textarea {
      border: 1px solid var(--ngp-border);
      border-radius: 0.5rem;
      background-color: var(--ngp-background);
      padding: 0.5rem;
      color: var(--ngp-text-primary);
      font-family: inherit;
      font-size: 13px;
      letter-spacing: -0.006em;
      resize: none;
      outline: none;
    }

    [ngpPopover] textarea:focus {
      border-color: var(--ngp-focus-ring);
      box-shadow: 0 0 0 1px var(--ngp-focus-ring);
    }

    @keyframes popover-show {
      0% {
        opacity: 0;
        transform: scale(0.96);
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
        transform: scale(0.96);
      }
    }
  `,
})
export default class PopoverKeepMountedExample {}

import { Component, signal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';

@Component({
  selector: 'app-menu-dynamic-anchor',
  imports: [NgpButton, NgpMenu, NgpMenuTrigger, NgpMenuItem],
  template: `
    <div class="stack">
      <div class="tokens">
        @for (token of tokens; track token) {
          <button
            class="token"
            #element
            [class.selected]="anchor() === element"
            (click)="claim(trigger, element)"
            (pointerdown)="claim(trigger, element)"
            type="button"
          >
            {{ token }}
          </button>
        }
      </div>

      <!-- Below the tokens, so the menu it opens never covers the row it moves across. -->
      <button
        class="open"
        #trigger="ngpMenuTrigger"
        [ngpMenuTrigger]="menu"
        ngpMenuTriggerPlacement="bottom-start"
        ngpMenuTriggerOffset="8"
        ngpButton
      >
        Format value
      </button>
    </div>

    <ng-template #menu>
      <div ngpMenu>
        <button ngpMenuItem>Copy</button>
        <button ngpMenuItem>Copy path</button>
        <button ngpMenuItem>Filter on value</button>
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: contents;
    }

    .stack {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    .tokens {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .open {
      height: 2.125rem;
      padding: 0 0.625rem;
      border: none;
      border-radius: 0.625rem;
      background-color: var(--ngp-background);
      box-shadow:
        inset 0 0 0 1px var(--ngp-border),
        0 1px 2px 0 rgb(0 0 0 / 0.04);
      font-size: 0.875rem;
      font-weight: 510;
      letter-spacing: -0.006em;
      color: var(--ngp-text-primary);
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
    }

    .open[data-hover] {
      background-color: var(--ngp-background-hover);
    }

    .open[data-press] {
      background-color: var(--ngp-background-active);
    }

    .open[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 1px;
    }

    .token {
      height: 2.125rem;
      padding: 0 0.625rem;
      border: none;
      border-radius: 0.5rem;
      background-color: var(--ngp-background);
      box-shadow: inset 0 0 0 1px var(--ngp-border);
      font-family: ui-monospace, monospace;
      font-size: 0.8125rem;
      letter-spacing: -0.006em;
      color: var(--ngp-text-secondary);
      cursor: pointer;
      transition:
        background-color 150ms cubic-bezier(0.4, 0, 0.2, 1),
        box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
    }

    .token:hover {
      background-color: var(--ngp-background-hover);
    }

    .token:active {
      background-color: var(--ngp-background-active);
    }

    .token:focus-visible {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 1px;
    }

    .token.selected {
      box-shadow: inset 0 0 0 1.5px var(--ngp-primary);
      color: var(--ngp-text-primary);
      font-weight: 510;
    }

    [ngpMenu] {
      position: fixed;
      display: flex;
      flex-direction: column;
      width: max-content;
      background: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      box-shadow: var(--ngp-shadow-lg);
      border-radius: 0.625rem;
      padding: 0.25rem;
      outline: none;
      transform-origin: var(--ngp-menu-transform-origin);
    }

    [ngpMenuItem] {
      padding: 0.4375rem 0.75rem;
      border: none;
      background: none;
      cursor: pointer;
      transition: background-color 0.15s ease;
      border-radius: 0.375rem;
      min-width: 140px;
      text-align: start;
      outline: none;
      font-size: 0.875rem;
      font-weight: 510;
      letter-spacing: -0.006em;
      color: var(--ngp-text-primary);
    }

    [ngpMenuItem][data-hover],
    [ngpMenuItem][data-focus-visible] {
      background-color: var(--ngp-background-hover);
    }

    [ngpMenuItem][data-press] {
      background-color: var(--ngp-background-active);
    }
  `,
})
export default class MenuDynamicAnchorExample {
  /** Drives the highlight only - the menu is re-anchored through `setAnchor`. */
  readonly anchor = signal<HTMLElement | null>(null);

  readonly tokens = ['"id"', '"name"', '"createdAt"', '"tags"'];

  /**
   * Called on `pointerdown` so the anchor is claimed before the capture-phase `mouseup`
   * that decides whether the press landed outside - on `click` alone the press would
   * dismiss the menu instead of moving it. `setAnchor` rather than the input, because an
   * input only reaches the trigger on the next change detection pass and a fast tap can
   * outrun it. The `click` binding keeps the targets usable without a pointer, where it
   * claims the anchor for the next open rather than moving a menu already on screen.
   */
  claim(trigger: NgpMenuTrigger, element: HTMLElement): void {
    trigger.setAnchor(element);
    this.anchor.set(element);
  }
}

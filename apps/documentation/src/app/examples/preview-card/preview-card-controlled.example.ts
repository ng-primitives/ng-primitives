import { Component, signal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpPreviewCard, NgpPreviewCardTrigger } from 'ng-primitives/preview-card';

@Component({
  selector: 'app-preview-card-controlled',
  imports: [NgpPreviewCardTrigger, NgpPreviewCard, NgpButton],
  template: `
    <p class="message">
      <a
        [ngpPreviewCardTrigger]="profile"
        [ngpPreviewCardTriggerOpen]="open()"
        (ngpPreviewCardTriggerOpenChange)="onOpenChange($event)"
        href="https://github.com/ng-primitives"
      >
        &#64;sofiachen
      </a>
      requested your review on Add the preview card primitive.
    </p>

    <ng-template #profile>
      <div ngpPreviewCard>
        <div class="header">
          <div>
            <p class="profile-name">Sofia Chen</p>
            <p class="profile-handle">&#64;sofiachen</p>
          </div>
          <button
            [attr.aria-pressed]="pinned()"
            [attr.data-pinned]="pinned() ? '' : null"
            (click)="pinned.set(!pinned())"
            ngpButton
            type="button"
          >
            Pin
          </button>
        </div>

        <p class="profile-bio">
          Design systems engineer. Building accessible components with Angular.
        </p>
      </div>
    </ng-template>
  `,
  styles: `
    .message {
      font-size: 0.875rem;
      letter-spacing: -0.006em;
      color: var(--ngp-text-secondary);
    }

    .message a {
      display: inline-flex;
      text-decoration: underline;
      text-underline-offset: 2px;
      font-weight: 510;
      color: var(--ngp-text-primary);
      border-radius: 0.25rem;
      outline: none;
    }

    .message a:focus-visible {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpPreviewCard] {
      position: absolute;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 17rem;
      max-width: var(--ngp-preview-card-available-width);
      border-radius: 0.75rem;
      background-color: var(--ngp-background);
      padding: 0.75rem;
      box-shadow:
        inset 0 0 0 1px var(--ngp-border),
        0 8px 16px -4px rgb(0 0 0 / 0.1);
      outline: none;
      transform-origin: var(--ngp-preview-card-transform-origin);
    }

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .profile-name {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 590;
      letter-spacing: -0.014em;
      color: var(--ngp-text-primary);
    }

    .profile-handle {
      margin: 0;
      font-size: 0.75rem;
      letter-spacing: -0.011em;
      color: var(--ngp-text-tertiary);
    }

    .profile-bio {
      margin: 0;
      font-size: 0.875rem;
      letter-spacing: -0.006em;
      color: var(--ngp-text-secondary);
    }

    button {
      height: 1.75rem;
      padding-inline: 0.625rem;
      border: none;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 510;
      letter-spacing: -0.011em;
      color: var(--ngp-text-secondary);
      background-color: var(--ngp-background);
      box-shadow:
        inset 0 0 0 1px var(--ngp-border),
        0 1px 2px 0 rgba(0, 0, 0, 0.04);
      outline: none;
      cursor: pointer;
      transition:
        background-color 150ms cubic-bezier(0.4, 0, 0.2, 1),
        color 150ms cubic-bezier(0.4, 0, 0.2, 1);
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

    button[data-pinned] {
      color: var(--ngp-primary);
      box-shadow: inset 0 0 0 1.5px var(--ngp-primary);
    }

    button[data-pinned][data-focus-visible] {
      box-shadow:
        inset 0 0 0 1.5px var(--ngp-primary),
        0 0 0 2px var(--ngp-focus-ring);
    }

    [ngpPreviewCard][data-enter] {
      animation: preview-card-show 150ms ease-out;
    }

    [ngpPreviewCard][data-exit] {
      animation: preview-card-hide 120ms ease-out;
    }

    @keyframes preview-card-show {
      0% {
        opacity: 0;
        transform: translateY(-2px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes preview-card-hide {
      0% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      [ngpPreviewCard][data-enter],
      [ngpPreviewCard][data-exit] {
        animation-duration: 0s;
      }
    }
  `,
})
export default class PreviewCardControlledExample {
  readonly open = signal(false);
  readonly pinned = signal(false);

  onOpenChange(open: boolean): void {
    // a pinned card ignores requests to close
    if (open || !this.pinned()) {
      this.open.set(open);
    }
  }
}

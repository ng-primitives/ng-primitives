import { Component } from '@angular/core';
import { NgpPreviewCard, NgpPreviewCardTrigger } from 'ng-primitives/preview-card';

@Component({
  selector: 'app-preview-card-delays',
  imports: [NgpPreviewCardTrigger, NgpPreviewCard],
  template: `
    <p class="sentence">
      The
      <a [ngpPreviewCardTrigger]="slow" href="https://angularprimitives.com">default delay</a>
      waits 600ms, while a
      <a
        [ngpPreviewCardTrigger]="fast"
        href="https://angularprimitives.com"
        ngpPreviewCardTriggerShowDelay="150"
        ngpPreviewCardTriggerHideDelay="100"
      >
        shorter delay
      </a>
      responds almost immediately.
    </p>

    <ng-template #slow>
      <div ngpPreviewCard>Opened after the default 600ms dwell.</div>
    </ng-template>

    <ng-template #fast>
      <div ngpPreviewCard>Opened after 150ms.</div>
    </ng-template>
  `,
  styles: `
    .sentence {
      font-size: 0.875rem;
      letter-spacing: -0.006em;
      color: var(--ngp-text-secondary);
    }

    .sentence a {
      /* inline-flex trims the whitespace either side of the text, which would
         otherwise be underlined along with it. */
      display: inline-flex;
      /* Never signal a link with colour alone. */
      text-decoration: underline;
      text-underline-offset: 2px;
      font-weight: 510;
      color: var(--ngp-text-primary);
      border-radius: 0.25rem;
      outline: none;
    }

    .sentence a:focus-visible {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpPreviewCard] {
      position: absolute;
      width: 15rem;
      max-width: var(--ngp-preview-card-available-width);
      border-radius: 0.75rem;
      background-color: var(--ngp-background);
      padding: 0.75rem;
      font-size: 0.875rem;
      letter-spacing: -0.006em;
      color: var(--ngp-text-secondary);
      box-shadow:
        inset 0 0 0 1px var(--ngp-border),
        0 8px 16px -4px rgb(0 0 0 / 0.1);
      outline: none;
      transform-origin: var(--ngp-preview-card-transform-origin);
    }

    [ngpPreviewCard][data-enter] {
      animation: preview-card-delays-show 150ms ease-out;
    }

    @keyframes preview-card-delays-show {
      0% {
        opacity: 0;
        transform: translateY(-2px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      [ngpPreviewCard][data-enter] {
        animation-duration: 0s;
      }
    }
  `,
})
export default class PreviewCardDelaysExample {}

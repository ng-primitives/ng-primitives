import { Component } from '@angular/core';
import { NgpPreviewCard, NgpPreviewCardTrigger } from 'ng-primitives/preview-card';

@Component({
  selector: 'app-preview-card',
  imports: [NgpPreviewCardTrigger, NgpPreviewCard],
  template: `
    <p class="prose">
      Built with
      <a [ngpPreviewCardTrigger]="card" href="https://angularprimitives.com">Angular Primitives</a>
      and Angular.
    </p>

    <ng-template #card>
      <div ngpPreviewCard>
        <p class="preview-card-title">Angular Primitives</p>
        <p class="preview-card-description">
          Headless, accessible UI primitives that leave the styling entirely to you.
        </p>
        <p class="preview-card-meta">angularprimitives.com</p>
      </div>
    </ng-template>
  `,
  styles: `
    .prose {
      font-size: 0.875rem;
      letter-spacing: -0.006em;
      color: var(--ngp-text-secondary);
    }

    .prose a {
      /* Never signal a link with colour alone. */
      text-decoration: underline;
      text-underline-offset: 2px;
      font-weight: 510;
      color: var(--ngp-text-primary);
      border-radius: 0.25rem;
      outline: none;
    }

    .prose a:focus-visible {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpPreviewCard] {
      position: absolute;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      width: 18rem;
      max-width: var(--ngp-preview-card-available-width);
      border-radius: 0.75rem;
      background-color: var(--ngp-background);
      padding: 0.75rem;
      /* Elevation on dark comes from a hairline border, not a heavier shadow. */
      box-shadow:
        inset 0 0 0 1px var(--ngp-border),
        0 8px 16px -4px rgb(0 0 0 / 0.1);
      outline: none;
      transform-origin: var(--ngp-preview-card-transform-origin);
    }

    .preview-card-title {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 590;
      letter-spacing: -0.014em;
      color: var(--ngp-text-primary);
    }

    .preview-card-description {
      margin: 0;
      font-size: 0.875rem;
      letter-spacing: -0.006em;
      color: var(--ngp-text-secondary);
    }

    .preview-card-meta {
      margin: 0.25rem 0 0;
      font-size: 0.75rem;
      letter-spacing: -0.011em;
      color: var(--ngp-text-tertiary);
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
export default class PreviewCardExample {}

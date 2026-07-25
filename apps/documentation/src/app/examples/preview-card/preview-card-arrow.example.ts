import { Component } from '@angular/core';
import {
  NgpPreviewCard,
  NgpPreviewCardArrow,
  NgpPreviewCardTrigger,
} from 'ng-primitives/preview-card';

@Component({
  selector: 'app-preview-card-arrow',
  imports: [NgpPreviewCardTrigger, NgpPreviewCard, NgpPreviewCardArrow],
  template: `
    <p class="sentence">
      Built with
      <a [ngpPreviewCardTrigger]="card" href="https://angularprimitives.com">Angular Primitives</a>
      and Angular.
    </p>

    <ng-template #card>
      <div ngpPreviewCard>
        <p class="preview-card-title">Angular Primitives</p>
        <p class="preview-card-description">
          The arrow points back at the trigger it was opened from.
        </p>
        <div ngpPreviewCardArrow></div>
      </div>
    </ng-template>
  `,
  styles: `
    .sentence {
      font-size: 0.875rem;
      letter-spacing: -0.006em;
      color: var(--ngp-text-secondary);
    }

    .sentence a {
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
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      width: 16rem;
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

    [ngpPreviewCardArrow] {
      position: absolute;
      pointer-events: none;
    }

    [ngpPreviewCardArrow][data-placement='top'] {
      bottom: 0;
    }

    [ngpPreviewCardArrow][data-placement='bottom'] {
      top: 0;
    }

    /* Two stacked triangles: the lower one draws the border, the upper the surface. */
    [ngpPreviewCardArrow]:before,
    [ngpPreviewCardArrow]:after {
      content: '';
      display: block;
      position: absolute;
      left: 0;
      width: 0;
      height: 0;
      border: 6px solid transparent;
    }

    [ngpPreviewCardArrow][data-placement='bottom']:before {
      bottom: 100%;
      border-bottom-color: var(--ngp-border);
    }

    [ngpPreviewCardArrow][data-placement='bottom']:after {
      bottom: calc(100% - 1px);
      border-bottom-color: var(--ngp-background);
    }

    [ngpPreviewCardArrow][data-placement='top']:before {
      top: 100%;
      border-top-color: var(--ngp-border);
    }

    [ngpPreviewCardArrow][data-placement='top']:after {
      top: calc(100% - 1px);
      border-top-color: var(--ngp-background);
    }
  `,
})
export default class PreviewCardArrowExample {}

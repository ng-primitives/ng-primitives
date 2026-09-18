import { Component } from '@angular/core';
import { NgpAvatar, NgpAvatarFallback, NgpAvatarImage } from 'ng-primitives/avatar';
import { NgpPreviewCard, NgpPreviewCardTrigger } from 'ng-primitives/preview-card';

@Component({
  selector: 'app-preview-card',
  imports: [NgpPreviewCardTrigger, NgpPreviewCard, NgpAvatar, NgpAvatarImage, NgpAvatarFallback],
  template: `
    <p class="message">
      <a [ngpPreviewCardTrigger]="profile" href="https://github.com/ng-primitives">
        &#64;sofiachen
      </a>
      requested your review on Add the preview card primitive.
    </p>

    <ng-template #profile>
      <div ngpPreviewCard>
        <span ngpAvatar>
          <img
            ngpAvatarImage
            src="https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_5.png"
            alt="Sofia Chen"
          />
          <span ngpAvatarFallback>SC</span>
        </span>

        <div>
          <p class="profile-name">Sofia Chen</p>
          <p class="profile-handle">&#64;sofiachen</p>
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
      /* Elevation on dark comes from a hairline border, not a heavier shadow. */
      box-shadow:
        inset 0 0 0 1px var(--ngp-border),
        0 8px 16px -4px rgb(0 0 0 / 0.1);
      outline: none;
      transform-origin: var(--ngp-preview-card-transform-origin);
    }

    [ngpAvatar] {
      display: inline-flex;
      width: 2.5rem;
      height: 2.5rem;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: var(--ngp-background-active);
    }

    [ngpAvatarImage] {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      object-position: center bottom;
    }

    [ngpAvatarFallback] {
      font-size: 0.8125rem;
      font-weight: 510;
      letter-spacing: -0.011em;
      color: var(--ngp-text-secondary);
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

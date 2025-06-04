import { Component, input } from '@angular/core';
import { NgpAvatar, NgpAvatarFallback, NgpAvatarImage } from 'ng-primitives/avatar';

@Component({
  selector: 'app-avatar',
  hostDirectives: [NgpAvatar],
  imports: [NgpAvatarImage, NgpAvatarFallback],
  template: `
    @if (image()) {
      <img [src]="image()" ngpAvatarImage alt="Profile Image" />
    }
    <span ngpAvatarFallback>{{ fallback() }}</span>
  `,
  styles: `
    :host {
      position: relative;
      display: inline-flex;
      width: 3rem;
      height: 3rem;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      border-width: 2px;
      border-color: var(--ngp-avatar-border);
      background-color: var(--ngp-avatar-background);
      vertical-align: middle;
      overflow: hidden;
    }

    :host:before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 9999px;
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
    }

    [ngpAvatarImage] {
      width: 100%;
      height: 100%;
    }

    [ngpAvatarFallback] {
      text-align: center;
      font-weight: 500;
      color: var(--ngp-text-emphasis);
    }
  `,
})
export class Avatar {
  /** Define the avatar image source */
  readonly image = input<string>();

  /** Define the avatar fallback text */
  readonly fallback = input<string>();
}

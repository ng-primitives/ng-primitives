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
      display: inline-flex;
      width: 50px;
      height: 50px;
    }

    [ngpAvatarImage] {
      border-radius: 50%;
      width: 100%;
      height: 100%;
    }

    [ngpAvatarFallback] {
    }
  `,
})
export class Avatar {
  /** Define the avatar image source */
  readonly image = input<string>();

  /** Define the avatar fallback text */
  readonly fallback = input<string>();
}

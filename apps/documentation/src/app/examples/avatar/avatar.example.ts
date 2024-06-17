import { Component } from '@angular/core';
import { NgpAvatar, NgpAvatarFallback, NgpAvatarImage } from '@ng-primitives/ng-primitives/avatar';

@Component({
  standalone: true,
  selector: 'app-avatar',
  imports: [NgpAvatar, NgpAvatarImage, NgpAvatarFallback],
  template: `
    <span
      class="inline-flex size-14 items-center justify-center overflow-hidden rounded-full bg-neutral-100 shadow ring-1 ring-black/5"
      ngpAvatar
    >
      <img ngpAvatarImage src="./assets/images/avatar-1.jpeg" alt="Profile Image" />
      <span class="text-lg text-neutral-800" ngpAvatarFallback>NG</span>
    </span>
  `,
})
export default class AvatarExample {}

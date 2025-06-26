import { Component } from '@angular/core';
import { NgpAvatar, NgpAvatarFallback, NgpAvatarImage } from 'ng-primitives/avatar';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [NgpAvatar, NgpAvatarImage, NgpAvatarFallback],
  template: `
    <span
      class="relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--ngp-avatar-border)] bg-[var(--ngp-avatar-background)] ring-1 ring-inset ring-black/10"
      ngpAvatar
    >
      <img
        class="h-full w-full object-cover"
        ngpAvatarImage
        src="https://angularprimitives.com/assets/avatar.png"
        alt="Profile Image"
      />
      <span class="font-medium text-[var(--ngp-text-emphasis)]" ngpAvatarFallback>NG</span>
    </span>
  `,
})
export default class AvatarExample {}

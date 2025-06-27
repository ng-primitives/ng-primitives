import { Component } from '@angular/core';
import { NgpAvatar, NgpAvatarFallback, NgpAvatarImage } from 'ng-primitives/avatar';

@Component({
  selector: 'app-avatar',
  imports: [NgpAvatar, NgpAvatarImage, NgpAvatarFallback],
  template: `
    <span
      class="relative inline-flex size-12 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-sky-200 before:absolute before:inset-0 before:rounded-full before:border before:border-black/10 dark:border-zinc-700 dark:bg-sky-900"
      ngpAvatar
    >
      <img
        class="h-full w-full object-cover"
        ngpAvatarImage
        src="https://angularprimitives.com/assets/avatar.png"
        alt="Profile Image"
      />
      <span class="font-medium text-sky-900 dark:text-sky-200" ngpAvatarFallback>NG</span>
    </span>
  `,
})
export default class AvatarExample {}

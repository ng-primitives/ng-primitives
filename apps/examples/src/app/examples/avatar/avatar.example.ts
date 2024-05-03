import { Component } from '@angular/core';
import {
  NgpAvatarDirective,
  NgpAvatarFallbackDirective,
  NgpAvatarImageDirective,
} from '@ng-primitives/ng-primitives/avatar';

@Component({
  standalone: true,
  selector: 'app-avatar',
  imports: [NgpAvatarDirective, NgpAvatarImageDirective, NgpAvatarFallbackDirective],
  template: `
    <span
      class="inline-flex size-14 items-center justify-center overflow-hidden rounded-full bg-zinc-100 shadow ring-1 ring-black/5"
      ngpAvatar
    >
      <img ngpAvatarImage src="./assets/images/avatar-1.jpeg" alt="Profile Image" />
      <span class="text-lg text-zinc-800" ngpAvatarFallback>NG</span>
    </span>
  `,
})
export default class AvatarExample {}

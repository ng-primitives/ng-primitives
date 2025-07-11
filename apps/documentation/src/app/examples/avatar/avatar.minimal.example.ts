import { Component } from '@angular/core';
import { NgpAvatar, NgpAvatarFallback, NgpAvatarImage } from 'ng-primitives/avatar';

@Component({
  selector: 'app-avatar-minimal',
  imports: [NgpAvatar, NgpAvatarImage, NgpAvatarFallback],
  styles: `
    [ngpAvatar] {
      border-radius: 9999px;
    }
  `,
  template: `
    <span ngpAvatar>
      <img
        ngpAvatarImage
        src="https://angularprimitives.com/assets/avatar.png"
        alt="Profile Image"
      />
      <span ngpAvatarFallback>NG</span>
    </span>
  `,
})
export default class AvatarMinimalExample {}

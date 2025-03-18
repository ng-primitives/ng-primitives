import { Component } from '@angular/core';
import { NgpAvatar, NgpAvatarFallback, NgpAvatarImage } from 'ng-primitives/avatar';

@Component({
  selector: 'app-avatar',
  imports: [NgpAvatar, NgpAvatarImage, NgpAvatarFallback],
  styles: `
    [ngpAvatar] {
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
    }

    [ngpAvatar]:before {
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
export default class AvatarExample {}

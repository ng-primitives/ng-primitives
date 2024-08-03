import { Component } from '@angular/core';
import { NgpAvatar, NgpAvatarFallback, NgpAvatarImage } from 'ng-primitives/avatar';

@Component({
  standalone: true,
  selector: 'app-avatar',
  imports: [NgpAvatar, NgpAvatarImage, NgpAvatarFallback],
  styles: `
    :host {
      --avatar-background-color: rgb(186 230 253);
      --avatar-border-color: #fff;
      --avatar-color: #000;

      --avatar-background-color-dark: #18181b;
      --avatar-border-color-dark: #3f3f46;
      --avatar-color-dark: #fff;
    }

    [ngpAvatar] {
      position: relative;
      display: inline-flex;
      width: 3rem;
      height: 3rem;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      border-width: 2px;
      border-color: light-dark(var(--avatar-border-color), var(--avatar-border-color-dark));
      background-color: light-dark(
        var(--avatar-background-color),
        var(--avatar-background-color-dark)
      );
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
      color: light-dark(var(--avatar-color), var(--avatar-color-dark));
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

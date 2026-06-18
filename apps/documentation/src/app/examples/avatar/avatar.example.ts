import { Component } from '@angular/core';
import { NgpAvatar, NgpAvatarFallback, NgpAvatarImage } from 'ng-primitives/avatar';

@Component({
  selector: 'app-avatar',
  imports: [NgpAvatar, NgpAvatarImage, NgpAvatarFallback],
  styles: `
    .avatar-stack {
      display: inline-flex;
      align-items: center;
    }

    [ngpAvatar] {
      position: relative;
      display: inline-flex;
      width: 2.75rem;
      height: 2.75rem;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      background-color: var(--ngp-background-active);
      box-shadow:
        0 0 0 2px var(--ngp-background),
        inset 0 0 0 1px var(--ngp-border);
      vertical-align: middle;
    }

    .avatar-stack [ngpAvatar]:not(:first-child) {
      margin-left: -0.75rem;
    }

    [ngpAvatar].avatar-blue {
      background-color: #dbeafe;
    }

    [ngpAvatar].avatar-amber {
      background-color: #fef3c7;
    }

    [ngpAvatar].avatar-violet {
      background-color: #ede9fe;
    }

    [ngpAvatar].avatar-teal {
      background-color: #cffafe;
    }

    [ngpAvatarImage] {
      width: 100%;
      height: 100%;
      border-radius: 9999px;
      object-fit: cover;
      object-position: center bottom;
    }

    [ngpAvatarFallback] {
      display: flex;
      width: 100%;
      height: 100%;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      font-size: 0.8125rem;
      font-weight: 510;
      letter-spacing: -0.01em;
      color: #3f3f46;
    }
  `,
  template: `
    <div class="avatar-stack">
      <span class="avatar-blue" ngpAvatar>
        <img
          ngpAvatarImage
          src="https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_5.png"
          alt="Sofia Chen"
        />
        <span ngpAvatarFallback>SC</span>
      </span>

      <span class="avatar-amber" ngpAvatar>
        <img
          ngpAvatarImage
          src="https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_2.png"
          alt="Aria Rossi"
        />
        <span ngpAvatarFallback>AR</span>
      </span>

      <span class="avatar-violet" ngpAvatar>
        <img
          ngpAvatarImage
          src="https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_7.png"
          alt="Marco Kim"
        />
        <span ngpAvatarFallback>MK</span>
      </span>

      <span class="avatar-teal" ngpAvatar>
        <img
          ngpAvatarImage
          src="https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_10.png"
          alt="Kai Larsson"
        />
        <span ngpAvatarFallback>KL</span>
      </span>
    </div>
  `,
})
export default class AvatarExample {}

import { Component } from '@angular/core';
import { NgpAvatar, NgpAvatarImage } from 'ng-primitives/avatar';
import { NgpButton } from 'ng-primitives/button';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';

@Component({
  selector: 'app-popover',
  imports: [NgpPopoverTrigger, NgpPopover, NgpButton, NgpAvatar, NgpAvatarImage],
  template: `
    <button [ngpPopoverTrigger]="popover" ngpButton type="button">Popover</button>

    <ng-template #popover>
      <div ngpPopover>
        <span ngpAvatar>
          <img
            ngpAvatarImage
            src="https://angularprimitives.com/assets/avatar.png"
            alt="Profile Image"
          />
        </span>

        <div class="container">
          <p>
            Welcome,
            <strong>John 👋🏻</strong>
          </p>
          <p>john.doe&commat;example.com</p>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    button {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: var(--text-primary);
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: var(--background);
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--button-shadow);
    }

    button[data-hover] {
      background-color: var(--background-hover);
    }

    button[data-focus-visible] {
      outline: 2px solid var(--focus-ring);
    }

    button[data-press] {
      background-color: var(--background-active);
    }

    [ngpAvatar] {
      position: relative;
      display: inline-flex;
      width: 2.8rem;
      height: 2.8rem;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      border-width: 2px;
      border-color: var(--avatar-border);
      background-color: var(--avatar-background);
      vertical-align: middle;
      flex: none;
    }

    [ngpPopover] {
      position: absolute;
      display: flex;
      column-gap: 8px;
      border-radius: 0.75rem;
      background: var(--background);
      padding: 0.5rem 0.75rem;
      font-weight: 500;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
    }

    .container {
      display: flex;
      flex-direction: column;
    }
  `,
})
export default class PopoverExample {}

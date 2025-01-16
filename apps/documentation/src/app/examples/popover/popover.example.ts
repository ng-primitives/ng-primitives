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
      <div class="absolute rounded-lg px-3 py-2 font-medium" ngpPopover>
        <div class="flex items-center gap-x-3">
          <span ngpAvatar>
            <img
              ngpAvatarImage
              src="https://angularprimitives.com/assets/avatar.png"
              alt="Profile Image"
            />
          </span>

          <div>
            <p>
              Welcome,
              <strong>John 👋🏻</strong>
            </p>
            <p class="opacity-80">john.doe&commat;example.com</p>
          </div>
        </div>

        <hr class="my-4" />

        <button ngpButton type="button">Logout</button>
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      --button-color: rgb(10 10 10);
      --button-background-color: rgb(255 255 255);
      --button-hover-background-color: rgb(250 250 250);
      --button-pressed-background-color: rgb(245 245 245);

      --button-color-dark: rgb(255 255 255);
      --button-background-color-dark: rgb(43 43 47);
      --button-hover-background-color-dark: rgb(63 63 70);
      --button-pressed-background-color-dark: rgb(39 39 42);
    }

    button {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: light-dark(var(--button-color), var(--button-color-dark));
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: light-dark(
        var(--button-background-color),
        var(--button-background-color-dark)
      );
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05);
    }

    button[data-hover] {
      background-color: light-dark(
        var(--button-hover-background-color),
        var(--button-hover-background-color-dark)
      );
    }

    button[data-focus-visible] {
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05),
        0 0 0 2px light-dark(#f5f5f5, #3f3f46),
        0 0 0 4px rgb(59 130 246);
    }

    button[data-press] {
      background-color: light-dark(
        var(--button-pressed-background-color),
        var(--button-pressed-background-color-dark)
      );
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
      border-color: light-dark(var(--avatar-border-color), var(--avatar-border-color-dark));
      background-color: light-dark(
        var(--avatar-background-color),
        var(--avatar-background-color-dark)
      );
      vertical-align: middle;
    }

    [ngpPopover] {
      position: absolute;
      border-radius: 0.5rem;
      background: light-dark(#fff, #27272a);
      padding: 0.5rem 0.75rem;
      font-weight: 500;
      box-shadow:
        0 0 10px rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(0, 0, 0, 0.05);
    }
  `,
})
export default class PopoverExample {}

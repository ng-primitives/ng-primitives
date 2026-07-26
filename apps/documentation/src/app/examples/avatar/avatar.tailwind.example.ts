import { Component } from '@angular/core';
import { NgpAvatar, NgpAvatarFallback, NgpAvatarImage } from 'ng-primitives/avatar';

@Component({
  selector: 'app-avatar',
  imports: [NgpAvatar, NgpAvatarImage, NgpAvatarFallback],
  template: `
    <div class="inline-flex items-center">
      <span
        class="relative inline-flex size-11 items-center justify-center rounded-full bg-[#dbeafe] shadow-[0_0_0_2px_#fff,inset_0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_2px_#09090b,inset_0_0_0_1px_#27272a]"
        ngpAvatar
      >
        <img
          class="size-full rounded-full object-cover object-[center_bottom]"
          ngpAvatarImage
          src="https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_5.png"
          alt="Sofia Chen"
        />
        <span
          class="flex size-full items-center justify-center rounded-full text-[0.8125rem] font-[510] tracking-[-0.01em] text-zinc-700"
          ngpAvatarFallback
        >
          SC
        </span>
      </span>

      <span
        class="relative -ml-3 inline-flex size-11 items-center justify-center rounded-full bg-[#fef3c7] shadow-[0_0_0_2px_#fff,inset_0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_2px_#09090b,inset_0_0_0_1px_#27272a]"
        ngpAvatar
      >
        <img
          class="size-full rounded-full object-cover object-[center_bottom]"
          ngpAvatarImage
          src="https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_2.png"
          alt="Aria Rossi"
        />
        <span
          class="flex size-full items-center justify-center rounded-full text-[0.8125rem] font-[510] tracking-[-0.01em] text-zinc-700"
          ngpAvatarFallback
        >
          AR
        </span>
      </span>

      <span
        class="relative -ml-3 inline-flex size-11 items-center justify-center rounded-full bg-[#ede9fe] shadow-[0_0_0_2px_#fff,inset_0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_2px_#09090b,inset_0_0_0_1px_#27272a]"
        ngpAvatar
      >
        <img
          class="size-full rounded-full object-cover object-[center_bottom]"
          ngpAvatarImage
          src="https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_7.png"
          alt="Marco Kim"
        />
        <span
          class="flex size-full items-center justify-center rounded-full text-[0.8125rem] font-[510] tracking-[-0.01em] text-zinc-700"
          ngpAvatarFallback
        >
          MK
        </span>
      </span>

      <span
        class="relative -ml-3 inline-flex size-11 items-center justify-center rounded-full bg-[#cffafe] shadow-[0_0_0_2px_#fff,inset_0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_2px_#09090b,inset_0_0_0_1px_#27272a]"
        ngpAvatar
      >
        <img
          class="size-full rounded-full object-cover object-[center_bottom]"
          ngpAvatarImage
          src="https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_10.png"
          alt="Kai Larsson"
        />
        <span
          class="flex size-full items-center justify-center rounded-full text-[0.8125rem] font-[510] tracking-[-0.01em] text-zinc-700"
          ngpAvatarFallback
        >
          KL
        </span>
      </span>
    </div>
  `,
})
export default class AvatarExample {}

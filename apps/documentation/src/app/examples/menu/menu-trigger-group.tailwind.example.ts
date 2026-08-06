import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChartBar, heroFolder, heroUsers } from '@ng-icons/heroicons/outline';
import { NgpButton } from 'ng-primitives/button';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger, NgpMenuTriggerGroup } from 'ng-primitives/menu';

@Component({
  selector: 'app-menu-trigger-group-tailwind',
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpMenuTriggerGroup, NgpButton, NgIcon],
  providers: [provideIcons({ heroUsers, heroFolder, heroChartBar })],
  template: `
    <nav
      class="flex w-52 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
      ngpMenuTriggerGroup
    >
      <div
        class="px-3 pt-2.5 pb-1 text-xs font-[590] tracking-[-0.011em] text-gray-400 uppercase dark:text-gray-500"
      >
        Workspace
      </div>

      <div class="flex flex-col gap-1 px-2 pb-2">
        <button
          class="flex h-[2.125rem] cursor-pointer items-center gap-2.5 rounded-lg border-none bg-transparent px-2.5 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden hover:bg-gray-100 focus-visible:shadow-[0_0_0_2px_var(--ngp-focus-ring)] active:bg-gray-200 data-open:bg-gray-100 dark:text-gray-100 dark:hover:bg-white/10 dark:active:bg-white/20 dark:data-open:bg-white/10"
          [ngpMenuTrigger]="teamMenu"
          [ngpMenuTriggerOpenTriggers]="['hover']"
          [ngpMenuTriggerCooldown]="300"
          ngpButton
          ngpMenuTriggerPlacement="right-start"
        >
          <ng-icon
            class="text-gray-400 dark:text-gray-500"
            style="--ng-icon__size: 1.125rem"
            name="heroUsers"
          />
          Team
        </button>
        <button
          class="flex h-[2.125rem] cursor-pointer items-center gap-2.5 rounded-lg border-none bg-transparent px-2.5 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden hover:bg-gray-100 focus-visible:shadow-[0_0_0_2px_var(--ngp-focus-ring)] active:bg-gray-200 data-open:bg-gray-100 dark:text-gray-100 dark:hover:bg-white/10 dark:active:bg-white/20 dark:data-open:bg-white/10"
          [ngpMenuTrigger]="projectsMenu"
          [ngpMenuTriggerOpenTriggers]="['hover']"
          [ngpMenuTriggerCooldown]="300"
          ngpButton
          ngpMenuTriggerPlacement="right-start"
        >
          <ng-icon
            class="text-gray-400 dark:text-gray-500"
            style="--ng-icon__size: 1.125rem"
            name="heroFolder"
          />
          Projects
        </button>
        <button
          class="flex h-[2.125rem] cursor-pointer items-center gap-2.5 rounded-lg border-none bg-transparent px-2.5 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden hover:bg-gray-100 focus-visible:shadow-[0_0_0_2px_var(--ngp-focus-ring)] active:bg-gray-200 data-open:bg-gray-100 dark:text-gray-100 dark:hover:bg-white/10 dark:active:bg-white/20 dark:data-open:bg-white/10"
          [ngpMenuTrigger]="reportsMenu"
          [ngpMenuTriggerOpenTriggers]="['hover']"
          [ngpMenuTriggerCooldown]="300"
          ngpButton
          ngpMenuTriggerPlacement="right-start"
        >
          <ng-icon
            class="text-gray-400 dark:text-gray-500"
            style="--ng-icon__size: 1.125rem"
            name="heroChartBar"
          />
          Reports
        </button>
      </div>
    </nav>

    <ng-template #teamMenu>
      <div
        class="animate-in fade-in-0 zoom-in-95 fixed flex w-max origin-(--ngp-menu-transform-origin) flex-col rounded-[0.625rem] border border-gray-200 bg-white p-1 shadow-lg outline-none data-instant:animate-none dark:border-zinc-800 dark:bg-zinc-950"
        ngpMenu
      >
        <button
          class="flex min-w-[140px] cursor-pointer items-center rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpMenuItem
        >
          Members
        </button>
        <button
          class="flex min-w-[140px] cursor-pointer items-center rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpMenuItem
        >
          Roles
        </button>
        <button
          class="flex min-w-[140px] cursor-pointer items-center rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpMenuItem
        >
          Invitations
        </button>
      </div>
    </ng-template>

    <ng-template #projectsMenu>
      <div
        class="animate-in fade-in-0 zoom-in-95 fixed flex w-max origin-(--ngp-menu-transform-origin) flex-col rounded-[0.625rem] border border-gray-200 bg-white p-1 shadow-lg outline-none data-instant:animate-none dark:border-zinc-800 dark:bg-zinc-950"
        ngpMenu
      >
        <button
          class="flex min-w-[140px] cursor-pointer items-center rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpMenuItem
        >
          Active
        </button>
        <button
          class="flex min-w-[140px] cursor-pointer items-center rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpMenuItem
        >
          Archived
        </button>
        <button
          class="flex min-w-[140px] cursor-pointer items-center rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpMenuItem
        >
          Templates
        </button>
      </div>
    </ng-template>

    <ng-template #reportsMenu>
      <div
        class="animate-in fade-in-0 zoom-in-95 fixed flex w-max origin-(--ngp-menu-transform-origin) flex-col rounded-[0.625rem] border border-gray-200 bg-white p-1 shadow-lg outline-none data-instant:animate-none dark:border-zinc-800 dark:bg-zinc-950"
        ngpMenu
      >
        <button
          class="flex min-w-[140px] cursor-pointer items-center rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpMenuItem
        >
          Overview
        </button>
        <button
          class="flex min-w-[140px] cursor-pointer items-center rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpMenuItem
        >
          Usage
        </button>
        <button
          class="flex min-w-[140px] cursor-pointer items-center rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpMenuItem
        >
          Billing
        </button>
      </div>
    </ng-template>
  `,
})
export default class MenuTriggerGroupTailwindExample {}

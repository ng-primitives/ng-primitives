import { Component } from '@angular/core';
import {
  NgpNavigationMenu,
  NgpNavigationMenuContent,
  NgpNavigationMenuContentItem,
  NgpNavigationMenuItem,
  NgpNavigationMenuList,
  NgpNavigationMenuTrigger,
} from 'ng-primitives/navigation-menu';

@Component({
  selector: 'app-navigation-menu',
  imports: [
    NgpNavigationMenu,
    NgpNavigationMenuList,
    NgpNavigationMenuItem,
    NgpNavigationMenuTrigger,
    NgpNavigationMenuContent,
    NgpNavigationMenuContentItem,
  ],
  template: `
    <nav class="relative flex flex-col items-center" ngpNavigationMenu>
      <ul
        class="relative m-0 flex list-none gap-0.5 rounded-[10px] border border-black/10 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950"
        ngpNavigationMenuList
      >
        <li class="relative z-1" ngpNavigationMenuItem>
          <button
            class="flex h-8 cursor-pointer items-center rounded-md border-none bg-none px-3 text-[0.8125rem] font-[510] text-gray-900 transition-colors duration-150 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-open:bg-gray-50 dark:text-gray-100 dark:hover:bg-zinc-900 dark:focus-visible:outline-blue-400 dark:data-open:bg-zinc-900"
            [ngpNavigationMenuTrigger]="learnMenu"
            [ngpNavigationMenuTriggerOffset]="8"
            [ngpNavigationMenuTriggerCooldown]="0"
            ngpNavigationMenuTriggerPlacement="bottom"
          >
            Learn
          </button>
          <ng-template #learnMenu>
            <div
              class="navigation-menu-content fixed rounded-lg border border-black/10 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
              ngpNavigationMenuContent
            >
              <ul class="m-0 grid w-[500px] list-none grid-cols-2 gap-2 p-0">
                <li class="row-span-3">
                  <a
                    class="flex h-full flex-col rounded-md border border-black/10 bg-[linear-gradient(135deg,#fafafa,#ffffff)] px-2 py-1.5 no-underline transition-colors duration-150 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:border-zinc-800 dark:bg-[linear-gradient(135deg,#18181b,#09090b)] dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    <div class="mb-2 text-[2rem]">🚀</div>
                    <div class="flex-1">
                      <div class="mb-2 text-base font-[590] text-gray-900 dark:text-gray-100">
                        Getting Started
                      </div>
                      <p class="m-0 text-[0.8rem]/[1.5]! text-gray-600 dark:text-gray-300">
                        Learn the basics and get up and running quickly.
                      </p>
                    </div>
                  </a>
                </li>
                <li>
                  <a
                    class="block rounded-md px-2 py-1.5 no-underline transition-colors duration-150 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    <div
                      class="mb-1 text-[0.8125rem]/[1.2] font-[510] text-gray-900 dark:text-gray-100"
                    >
                      Introduction
                    </div>
                    <p class="m-0 text-xs/[1.2]! text-gray-600 dark:text-gray-300">
                      Build accessible components.
                    </p>
                  </a>
                </li>
                <li>
                  <a
                    class="block rounded-md px-2 py-1.5 no-underline transition-colors duration-150 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    <div
                      class="mb-1 text-[0.8125rem]/[1.2] font-[510] text-gray-900 dark:text-gray-100"
                    >
                      Installation
                    </div>
                    <p class="m-0 text-xs/[1.2]! text-gray-600 dark:text-gray-300">
                      Step-by-step installation guide.
                    </p>
                  </a>
                </li>
                <li>
                  <a
                    class="block rounded-md px-2 py-1.5 no-underline transition-colors duration-150 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    <div
                      class="mb-1 text-[0.8125rem]/[1.2] font-[510] text-gray-900 dark:text-gray-100"
                    >
                      Styling
                    </div>
                    <p class="m-0 text-xs/[1.2]! text-gray-600 dark:text-gray-300">
                      Learn how to style primitives.
                    </p>
                  </a>
                </li>
              </ul>
            </div>
          </ng-template>
        </li>

        <li class="relative z-1" ngpNavigationMenuItem>
          <button
            class="flex h-8 cursor-pointer items-center rounded-md border-none bg-none px-3 text-[0.8125rem] font-[510] text-gray-900 transition-colors duration-150 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-open:bg-gray-50 dark:text-gray-100 dark:hover:bg-zinc-900 dark:focus-visible:outline-blue-400 dark:data-open:bg-zinc-900"
            [ngpNavigationMenuTrigger]="componentsMenu"
            [ngpNavigationMenuTriggerOffset]="8"
            [ngpNavigationMenuTriggerCooldown]="0"
            ngpNavigationMenuTriggerPlacement="bottom"
          >
            Components
          </button>
          <ng-template #componentsMenu>
            <div
              class="navigation-menu-content fixed rounded-lg border border-black/10 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
              ngpNavigationMenuContent
              ngpNavigationMenuContentOrientation="horizontal"
            >
              <ul class="m-0 grid w-[500px] list-none grid-cols-3 gap-2 p-0">
                <li>
                  <a
                    class="block rounded-md px-2 py-1.5 no-underline transition-colors duration-150 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    <div
                      class="mb-1 text-[0.8125rem]/[1.2] font-[510] text-gray-900 dark:text-gray-100"
                    >
                      Button
                    </div>
                    <p class="m-0 text-xs/[1.2]! text-gray-600 dark:text-gray-300">
                      Trigger actions.
                    </p>
                  </a>
                </li>
                <li>
                  <a
                    class="block rounded-md px-2 py-1.5 no-underline transition-colors duration-150 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    <div
                      class="mb-1 text-[0.8125rem]/[1.2] font-[510] text-gray-900 dark:text-gray-100"
                    >
                      Dialog
                    </div>
                    <p class="m-0 text-xs/[1.2]! text-gray-600 dark:text-gray-300">
                      Modal dialogs.
                    </p>
                  </a>
                </li>
                <li>
                  <a
                    class="block rounded-md px-2 py-1.5 no-underline transition-colors duration-150 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    <div
                      class="mb-1 text-[0.8125rem]/[1.2] font-[510] text-gray-900 dark:text-gray-100"
                    >
                      Tooltip
                    </div>
                    <p class="m-0 text-xs/[1.2]! text-gray-600 dark:text-gray-300">
                      Display information.
                    </p>
                  </a>
                </li>
                <li>
                  <a
                    class="block rounded-md px-2 py-1.5 no-underline transition-colors duration-150 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    <div
                      class="mb-1 text-[0.8125rem]/[1.2] font-[510] text-gray-900 dark:text-gray-100"
                    >
                      Popover
                    </div>
                    <p class="m-0 text-xs/[1.2]! text-gray-600 dark:text-gray-300">
                      Floating content.
                    </p>
                  </a>
                </li>
                <li>
                  <a
                    class="block rounded-md px-2 py-1.5 no-underline transition-colors duration-150 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    <div
                      class="mb-1 text-[0.8125rem]/[1.2] font-[510] text-gray-900 dark:text-gray-100"
                    >
                      Tabs
                    </div>
                    <p class="m-0 text-xs/[1.2]! text-gray-600 dark:text-gray-300">
                      Organize content.
                    </p>
                  </a>
                </li>
                <li>
                  <a
                    class="block rounded-md px-2 py-1.5 no-underline transition-colors duration-150 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    <div
                      class="mb-1 text-[0.8125rem]/[1.2] font-[510] text-gray-900 dark:text-gray-100"
                    >
                      Menu
                    </div>
                    <p class="m-0 text-xs/[1.2]! text-gray-600 dark:text-gray-300">
                      Dropdown menus.
                    </p>
                  </a>
                </li>
              </ul>
            </div>
          </ng-template>
        </li>

        <li class="relative z-1" ngpNavigationMenuItem>
          <button
            class="flex h-8 cursor-pointer items-center rounded-md border-none bg-none px-3 text-[0.8125rem] font-[510] text-gray-900 transition-colors duration-150 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-open:bg-gray-50 dark:text-gray-100 dark:hover:bg-zinc-900 dark:focus-visible:outline-blue-400 dark:data-open:bg-zinc-900"
            [ngpNavigationMenuTrigger]="resourcesMenu"
            [ngpNavigationMenuTriggerOffset]="8"
            [ngpNavigationMenuTriggerCooldown]="0"
            ngpNavigationMenuTriggerPlacement="bottom"
          >
            Resources
          </button>
          <ng-template #resourcesMenu>
            <div
              class="navigation-menu-content fixed rounded-lg border border-black/10 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
              ngpNavigationMenuContent
            >
              <ul class="m-0 grid w-[200px] list-none gap-2 p-0">
                <li>
                  <a
                    class="block rounded-md px-2 py-1.5 no-underline transition-colors duration-150 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    <div
                      class="mb-1 text-[0.8125rem]/[1.2] font-[510] text-gray-900 dark:text-gray-100"
                    >
                      Documentation
                    </div>
                    <p class="m-0 text-xs/[1.2]! text-gray-600 dark:text-gray-300">
                      Full API reference.
                    </p>
                  </a>
                </li>
                <li>
                  <a
                    class="block rounded-md px-2 py-1.5 no-underline transition-colors duration-150 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    <div
                      class="mb-1 text-[0.8125rem]/[1.2] font-[510] text-gray-900 dark:text-gray-100"
                    >
                      GitHub
                    </div>
                    <p class="m-0 text-xs/[1.2]! text-gray-600 dark:text-gray-300">
                      View the source code.
                    </p>
                  </a>
                </li>
              </ul>
            </div>
          </ng-template>
        </li>
      </ul>
    </nav>
  `,
  styles: `
    .navigation-menu-content[data-enter] {
      animation: contentOpen 200ms ease forwards;
    }

    .navigation-menu-content[data-exit] {
      animation: contentClose 150ms ease forwards;
    }

    @keyframes contentOpen {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes contentClose {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-4px);
      }
    }
  `,
})
export default class NavigationMenuExample {}

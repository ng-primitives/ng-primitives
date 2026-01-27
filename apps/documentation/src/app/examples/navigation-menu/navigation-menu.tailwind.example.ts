import { Component } from '@angular/core';
import {
  NgpNavigationMenu,
  NgpNavigationMenuContent,
  NgpNavigationMenuIndicator,
  NgpNavigationMenuItem,
  NgpNavigationMenuLink,
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
    NgpNavigationMenuLink,
    NgpNavigationMenuIndicator,
  ],
  template: `
    <nav ngpNavigationMenu class="flex justify-center">
      <ul ngpNavigationMenuList class="relative flex gap-1 list-none p-1 m-0 bg-white dark:bg-neutral-900 rounded-lg shadow-sm">
        <div
          ngpNavigationMenuIndicator
          class="bg-neutral-100 dark:bg-neutral-800 rounded-md transition-all duration-150 data-[state=hidden]:opacity-0"
        ></div>
        <li ngpNavigationMenuItem ngpNavigationMenuItemValue="getting-started" class="relative">
          <button
            ngpNavigationMenuTrigger
            class="px-4 py-2 border-none bg-transparent rounded-md text-sm font-medium cursor-pointer text-neutral-700 dark:text-neutral-300 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 data-[state=open]:bg-neutral-100 dark:data-[state=open]:bg-neutral-800"
          >
            Getting Started
          </button>
          <div
              ngpNavigationMenuContent
              class="absolute top-full left-0 mt-2 min-w-[200px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 shadow-lg data-[state=closed]:hidden data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[motion=from-start]:slide-in-from-left-2 data-[motion=from-end]:slide-in-from-right-2"
            >
              <ul class="list-none p-0 m-0">
                <li>
                  <a
                    ngpNavigationMenuLink
                    href="#"
                    class="block px-3 py-2 rounded-md no-underline text-sm text-neutral-600 dark:text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 data-[active]:text-neutral-900 dark:data-[active]:text-neutral-100 data-[active]:font-medium"
                  >
                    Introduction
                  </a>
                </li>
                <li>
                  <a
                    ngpNavigationMenuLink
                    href="#"
                    class="block px-3 py-2 rounded-md no-underline text-sm text-neutral-600 dark:text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    Installation
                  </a>
                </li>
                <li>
                  <a
                    ngpNavigationMenuLink
                    href="#"
                    class="block px-3 py-2 rounded-md no-underline text-sm text-neutral-600 dark:text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    Quick Start
                  </a>
                </li>
              </ul>
            </div>
        </li>
        <li ngpNavigationMenuItem ngpNavigationMenuItemValue="components" class="relative">
          <button
            ngpNavigationMenuTrigger
            class="px-4 py-2 border-none bg-transparent rounded-md text-sm font-medium cursor-pointer text-neutral-700 dark:text-neutral-300 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 data-[state=open]:bg-neutral-100 dark:data-[state=open]:bg-neutral-800"
          >
            Components
          </button>
          <div
              ngpNavigationMenuContent
              class="absolute top-full left-0 mt-2 min-w-[200px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 shadow-lg data-[state=closed]:hidden data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[motion=from-start]:slide-in-from-left-2 data-[motion=from-end]:slide-in-from-right-2"
            >
              <ul class="list-none p-0 m-0">
                <li>
                  <a
                    ngpNavigationMenuLink
                    href="#"
                    class="block px-3 py-2 rounded-md no-underline text-sm text-neutral-600 dark:text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    Button
                  </a>
                </li>
                <li>
                  <a
                    ngpNavigationMenuLink
                    href="#"
                    class="block px-3 py-2 rounded-md no-underline text-sm text-neutral-600 dark:text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    Input
                  </a>
                </li>
                <li>
                  <a
                    ngpNavigationMenuLink
                    href="#"
                    class="block px-3 py-2 rounded-md no-underline text-sm text-neutral-600 dark:text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    Select
                  </a>
                </li>
              </ul>
            </div>
        </li>
        <li ngpNavigationMenuItem ngpNavigationMenuItemValue="resources" class="relative">
          <button
            ngpNavigationMenuTrigger
            class="px-4 py-2 border-none bg-transparent rounded-md text-sm font-medium cursor-pointer text-neutral-700 dark:text-neutral-300 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 data-[state=open]:bg-neutral-100 dark:data-[state=open]:bg-neutral-800"
          >
            Resources
          </button>
          <div
              ngpNavigationMenuContent
              class="absolute top-full left-0 mt-2 min-w-[200px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 shadow-lg data-[state=closed]:hidden data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[motion=from-start]:slide-in-from-left-2 data-[motion=from-end]:slide-in-from-right-2"
            >
              <ul class="list-none p-0 m-0">
                <li>
                  <a
                    ngpNavigationMenuLink
                    href="#"
                    class="block px-3 py-2 rounded-md no-underline text-sm text-neutral-600 dark:text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    ngpNavigationMenuLink
                    href="#"
                    class="block px-3 py-2 rounded-md no-underline text-sm text-neutral-600 dark:text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    ngpNavigationMenuLink
                    href="#"
                    class="block px-3 py-2 rounded-md no-underline text-sm text-neutral-600 dark:text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    Discord
                  </a>
                </li>
              </ul>
            </div>
        </li>
      </ul>
    </nav>
  `,
})
export default class NavigationMenuTailwindExample {}

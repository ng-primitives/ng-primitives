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
    <nav class="flex justify-center" ngpNavigationMenu>
      <ul
        class="relative m-0 flex list-none gap-1 rounded-lg bg-white p-1 shadow-sm dark:bg-neutral-900"
        ngpNavigationMenuList
      >
        <div
          class="rounded-md bg-neutral-100 transition-all duration-150 data-[state=hidden]:opacity-0 dark:bg-neutral-800"
          ngpNavigationMenuIndicator
        ></div>
        <li class="relative" ngpNavigationMenuItem ngpNavigationMenuItemValue="getting-started">
          <button
            class="cursor-pointer rounded-md border-none bg-transparent px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-[state=open]:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:data-[state=open]:bg-neutral-800"
            ngpNavigationMenuTrigger
          >
            Getting Started
          </button>
          <div
            class="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[motion=from-start]:slide-in-from-left-2 data-[motion=from-end]:slide-in-from-right-2 absolute top-full left-0 mt-2 min-w-[200px] rounded-lg border border-neutral-200 bg-white p-2 shadow-lg data-[state=closed]:hidden dark:border-neutral-700 dark:bg-neutral-900"
            ngpNavigationMenuContent
          >
            <ul class="m-0 list-none p-0">
              <li>
                <a
                  class="block rounded-md px-3 py-2 text-sm text-neutral-600 no-underline transition-colors hover:bg-neutral-100 hover:text-neutral-900 data-[active]:font-medium data-[active]:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 dark:data-[active]:text-neutral-100"
                  ngpNavigationMenuLink
                  href="#"
                >
                  Introduction
                </a>
              </li>
              <li>
                <a
                  class="block rounded-md px-3 py-2 text-sm text-neutral-600 no-underline transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                  ngpNavigationMenuLink
                  href="#"
                >
                  Installation
                </a>
              </li>
              <li>
                <a
                  class="block rounded-md px-3 py-2 text-sm text-neutral-600 no-underline transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                  ngpNavigationMenuLink
                  href="#"
                >
                  Quick Start
                </a>
              </li>
            </ul>
          </div>
        </li>
        <li class="relative" ngpNavigationMenuItem ngpNavigationMenuItemValue="components">
          <button
            class="cursor-pointer rounded-md border-none bg-transparent px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-[state=open]:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:data-[state=open]:bg-neutral-800"
            ngpNavigationMenuTrigger
          >
            Components
          </button>
          <div
            class="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[motion=from-start]:slide-in-from-left-2 data-[motion=from-end]:slide-in-from-right-2 absolute top-full left-0 mt-2 min-w-[200px] rounded-lg border border-neutral-200 bg-white p-2 shadow-lg data-[state=closed]:hidden dark:border-neutral-700 dark:bg-neutral-900"
            ngpNavigationMenuContent
          >
            <ul class="m-0 list-none p-0">
              <li>
                <a
                  class="block rounded-md px-3 py-2 text-sm text-neutral-600 no-underline transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                  ngpNavigationMenuLink
                  href="#"
                >
                  Button
                </a>
              </li>
              <li>
                <a
                  class="block rounded-md px-3 py-2 text-sm text-neutral-600 no-underline transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                  ngpNavigationMenuLink
                  href="#"
                >
                  Input
                </a>
              </li>
              <li>
                <a
                  class="block rounded-md px-3 py-2 text-sm text-neutral-600 no-underline transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                  ngpNavigationMenuLink
                  href="#"
                >
                  Select
                </a>
              </li>
            </ul>
          </div>
        </li>
        <li class="relative" ngpNavigationMenuItem ngpNavigationMenuItemValue="resources">
          <button
            class="cursor-pointer rounded-md border-none bg-transparent px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-[state=open]:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:data-[state=open]:bg-neutral-800"
            ngpNavigationMenuTrigger
          >
            Resources
          </button>
          <div
            class="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[motion=from-start]:slide-in-from-left-2 data-[motion=from-end]:slide-in-from-right-2 absolute top-full left-0 mt-2 min-w-[200px] rounded-lg border border-neutral-200 bg-white p-2 shadow-lg data-[state=closed]:hidden dark:border-neutral-700 dark:bg-neutral-900"
            ngpNavigationMenuContent
          >
            <ul class="m-0 list-none p-0">
              <li>
                <a
                  class="block rounded-md px-3 py-2 text-sm text-neutral-600 no-underline transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                  ngpNavigationMenuLink
                  href="#"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  class="block rounded-md px-3 py-2 text-sm text-neutral-600 no-underline transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                  ngpNavigationMenuLink
                  href="#"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  class="block rounded-md px-3 py-2 text-sm text-neutral-600 no-underline transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                  ngpNavigationMenuLink
                  href="#"
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

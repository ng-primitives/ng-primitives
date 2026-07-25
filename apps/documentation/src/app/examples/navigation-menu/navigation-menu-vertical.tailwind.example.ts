import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroBell,
  heroChartBar,
  heroCog6Tooth,
  heroDocumentText,
  heroFolder,
  heroMagnifyingGlass,
  heroSquares2x2,
  heroUsers,
} from '@ng-icons/heroicons/outline';
import {
  NgpNavigationMenu,
  NgpNavigationMenuContent,
  NgpNavigationMenuContentItem,
  NgpNavigationMenuItem,
  NgpNavigationMenuList,
  NgpNavigationMenuTrigger,
} from 'ng-primitives/navigation-menu';

@Component({
  selector: 'app-navigation-menu-vertical',
  imports: [
    NgIcon,
    NgpNavigationMenu,
    NgpNavigationMenuList,
    NgpNavigationMenuItem,
    NgpNavigationMenuTrigger,
    NgpNavigationMenuContent,
    NgpNavigationMenuContentItem,
  ],
  viewProviders: [
    provideIcons({
      heroMagnifyingGlass,
      heroSquares2x2,
      heroDocumentText,
      heroUsers,
      heroCog6Tooth,
      heroChartBar,
      heroFolder,
      heroBell,
    }),
  ],
  host: {
    class: 'block h-[420px]',
  },
  template: `
    <nav
      class="relative flex h-full"
      ngpNavigationMenu
      ngpNavigationMenuOrientation="vertical"
      ngpNavigationMenuShowDelay="0"
    >
      <ul
        class="relative m-0 flex list-none flex-col gap-1 rounded-xl border border-black/10 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950"
        ngpNavigationMenuList
      >
        <li class="relative z-1" ngpNavigationMenuItem>
          <button
            class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border-none bg-none p-0 text-zinc-600 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-open:bg-zinc-100 data-open:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:outline-blue-400 dark:data-open:bg-zinc-800 dark:data-open:text-zinc-100"
            [ngpNavigationMenuTrigger]="searchMenu"
            [ngpNavigationMenuTriggerOffset]="16"
            ngpNavigationMenuTriggerPlacement="right-start"
            aria-label="Search"
          >
            <ng-icon name="heroMagnifyingGlass" size="20" aria-hidden="true" />
          </button>
          <ng-template #searchMenu>
            <div
              class="sidebar-content fixed rounded-xl border border-black/10 bg-white p-1.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
              ngpNavigationMenuContent
            >
              <div
                class="px-2 pt-2 pb-1.5 text-[0.6875rem]/[1] font-[590] tracking-[0.05em] text-zinc-500 uppercase dark:text-zinc-400"
              >
                Search
              </div>
              <ul class="m-0 min-w-[140px] list-none p-0">
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    Quick Search
                  </a>
                </li>
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    Advanced Search
                  </a>
                </li>
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    Recent Searches
                  </a>
                </li>
              </ul>
            </div>
          </ng-template>
        </li>

        <li class="relative z-1" ngpNavigationMenuItem>
          <button
            class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border-none bg-none p-0 text-zinc-600 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-open:bg-zinc-100 data-open:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:outline-blue-400 dark:data-open:bg-zinc-800 dark:data-open:text-zinc-100"
            [ngpNavigationMenuTrigger]="dashboardMenu"
            [ngpNavigationMenuTriggerOffset]="16"
            ngpNavigationMenuTriggerPlacement="right-start"
            aria-label="Dashboard"
          >
            <ng-icon name="heroSquares2x2" size="20" aria-hidden="true" />
          </button>
          <ng-template #dashboardMenu>
            <div
              class="sidebar-content fixed rounded-xl border border-black/10 bg-white p-1.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
              ngpNavigationMenuContent
            >
              <div
                class="px-2 pt-2 pb-1.5 text-[0.6875rem]/[1] font-[590] tracking-[0.05em] text-zinc-500 uppercase dark:text-zinc-400"
              >
                Dashboard
              </div>
              <ul class="m-0 min-w-[140px] list-none p-0">
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    Overview
                  </a>
                </li>
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    Analytics
                  </a>
                </li>
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    Reports
                  </a>
                </li>
              </ul>
            </div>
          </ng-template>
        </li>

        <li class="relative z-1" ngpNavigationMenuItem>
          <button
            class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border-none bg-none p-0 text-zinc-600 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-open:bg-zinc-100 data-open:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:outline-blue-400 dark:data-open:bg-zinc-800 dark:data-open:text-zinc-100"
            [ngpNavigationMenuTrigger]="analyticsMenu"
            [ngpNavigationMenuTriggerOffset]="16"
            ngpNavigationMenuTriggerPlacement="right-start"
            aria-label="Analytics"
          >
            <ng-icon name="heroChartBar" size="20" aria-hidden="true" />
          </button>
          <ng-template #analyticsMenu>
            <div
              class="sidebar-content fixed rounded-xl border border-black/10 bg-white p-1.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
              ngpNavigationMenuContent
            >
              <div
                class="px-2 pt-2 pb-1.5 text-[0.6875rem]/[1] font-[590] tracking-[0.05em] text-zinc-500 uppercase dark:text-zinc-400"
              >
                Analytics
              </div>
              <ul class="m-0 min-w-[140px] list-none p-0">
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    Traffic
                  </a>
                </li>
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    Conversions
                  </a>
                </li>
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    Revenue
                  </a>
                </li>
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    Engagement
                  </a>
                </li>
              </ul>
            </div>
          </ng-template>
        </li>

        <li class="relative z-1" ngpNavigationMenuItem>
          <button
            class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border-none bg-none p-0 text-zinc-600 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-open:bg-zinc-100 data-open:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:outline-blue-400 dark:data-open:bg-zinc-800 dark:data-open:text-zinc-100"
            [ngpNavigationMenuTrigger]="documentsMenu"
            [ngpNavigationMenuTriggerOffset]="16"
            ngpNavigationMenuTriggerPlacement="right-start"
            aria-label="Documents"
          >
            <ng-icon name="heroDocumentText" size="20" aria-hidden="true" />
          </button>
          <ng-template #documentsMenu>
            <div
              class="sidebar-content fixed rounded-xl border border-black/10 bg-white p-1.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
              ngpNavigationMenuContent
            >
              <div
                class="px-2 pt-2 pb-1.5 text-[0.6875rem]/[1] font-[590] tracking-[0.05em] text-zinc-500 uppercase dark:text-zinc-400"
              >
                Documents
              </div>
              <ul class="m-0 min-w-[140px] list-none p-0">
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    All Documents
                  </a>
                </li>
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    Shared with Me
                  </a>
                </li>
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    Favorites
                  </a>
                </li>
              </ul>
            </div>
          </ng-template>
        </li>

        <li class="relative z-1" ngpNavigationMenuItem>
          <button
            class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border-none bg-none p-0 text-zinc-600 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-open:bg-zinc-100 data-open:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:outline-blue-400 dark:data-open:bg-zinc-800 dark:data-open:text-zinc-100"
            [ngpNavigationMenuTrigger]="projectsMenu"
            [ngpNavigationMenuTriggerOffset]="16"
            ngpNavigationMenuTriggerPlacement="right-start"
            aria-label="Projects"
          >
            <ng-icon name="heroFolder" size="20" aria-hidden="true" />
          </button>
          <ng-template #projectsMenu>
            <div
              class="sidebar-content fixed rounded-xl border border-black/10 bg-white p-1.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
              ngpNavigationMenuContent
            >
              <div
                class="px-2 pt-2 pb-1.5 text-[0.6875rem]/[1] font-[590] tracking-[0.05em] text-zinc-500 uppercase dark:text-zinc-400"
              >
                Projects
              </div>
              <ul class="m-0 min-w-[140px] list-none p-0">
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    Active
                  </a>
                </li>
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    Archived
                  </a>
                </li>
              </ul>
            </div>
          </ng-template>
        </li>

        <li class="relative z-1" ngpNavigationMenuItem>
          <button
            class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border-none bg-none p-0 text-zinc-600 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-open:bg-zinc-100 data-open:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:outline-blue-400 dark:data-open:bg-zinc-800 dark:data-open:text-zinc-100"
            [ngpNavigationMenuTrigger]="usersMenu"
            [ngpNavigationMenuTriggerOffset]="16"
            ngpNavigationMenuTriggerPlacement="right-start"
            aria-label="Users"
          >
            <ng-icon name="heroUsers" size="20" aria-hidden="true" />
          </button>
          <ng-template #usersMenu>
            <div
              class="sidebar-content fixed rounded-xl border border-black/10 bg-white p-1.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
              ngpNavigationMenuContent
            >
              <div
                class="px-2 pt-2 pb-1.5 text-[0.6875rem]/[1] font-[590] tracking-[0.05em] text-zinc-500 uppercase dark:text-zinc-400"
              >
                Users
              </div>
              <ul class="m-0 min-w-[140px] list-none p-0">
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    All Users
                  </a>
                </li>
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    Teams
                  </a>
                </li>
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    Permissions
                  </a>
                </li>
              </ul>
            </div>
          </ng-template>
        </li>

        <li class="mx-1 my-2 h-px bg-black/10 dark:bg-zinc-800"></li>

        <li class="relative z-1" ngpNavigationMenuItem>
          <button
            class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border-none bg-none p-0 text-zinc-600 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-open:bg-zinc-100 data-open:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:outline-blue-400 dark:data-open:bg-zinc-800 dark:data-open:text-zinc-100"
            [ngpNavigationMenuTrigger]="notificationsMenu"
            [ngpNavigationMenuTriggerOffset]="16"
            ngpNavigationMenuTriggerPlacement="right-start"
            aria-label="Notifications"
          >
            <ng-icon name="heroBell" size="20" aria-hidden="true" />
          </button>
          <ng-template #notificationsMenu>
            <div
              class="sidebar-content fixed rounded-xl border border-black/10 bg-white p-1.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
              ngpNavigationMenuContent
            >
              <div
                class="px-2 pt-2 pb-1.5 text-[0.6875rem]/[1] font-[590] tracking-[0.05em] text-zinc-500 uppercase dark:text-zinc-400"
              >
                Notifications
              </div>
              <ul class="m-0 min-w-[140px] list-none p-0">
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    All
                  </a>
                </li>
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    Unread
                  </a>
                </li>
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    Mentions
                  </a>
                </li>
              </ul>
            </div>
          </ng-template>
        </li>

        <li class="relative z-1" ngpNavigationMenuItem>
          <button
            class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border-none bg-none p-0 text-zinc-600 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-open:bg-zinc-100 data-open:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:outline-blue-400 dark:data-open:bg-zinc-800 dark:data-open:text-zinc-100"
            [ngpNavigationMenuTrigger]="settingsMenu"
            [ngpNavigationMenuTriggerOffset]="16"
            ngpNavigationMenuTriggerPlacement="right-start"
            aria-label="Settings"
          >
            <ng-icon name="heroCog6Tooth" size="20" aria-hidden="true" />
          </button>
          <ng-template #settingsMenu>
            <div
              class="sidebar-content fixed rounded-xl border border-black/10 bg-white p-1.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
              ngpNavigationMenuContent
            >
              <div
                class="px-2 pt-2 pb-1.5 text-[0.6875rem]/[1] font-[590] tracking-[0.05em] text-zinc-500 uppercase dark:text-zinc-400"
              >
                Settings
              </div>
              <ul class="m-0 min-w-[140px] list-none p-0">
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    General
                  </a>
                </li>
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    Appearance
                  </a>
                </li>
                <li>
                  <a
                    class="flex h-8 items-center rounded-md px-2 text-[0.8125rem] whitespace-nowrap text-zinc-900 no-underline transition-colors duration-150 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:focus-visible:outline-blue-400"
                    ngpNavigationMenuContentItem
                    href="#"
                  >
                    Notifications
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
    .sidebar-content[data-enter] {
      animation: contentOpen 200ms ease forwards;
    }

    .sidebar-content[data-exit] {
      animation: contentClose 150ms ease forwards;
    }

    /* Skip animations during instant transitions (cooldown) */
    .sidebar-content[data-instant][data-enter],
    .sidebar-content[data-instant][data-exit] {
      animation: none;
    }

    @keyframes contentOpen {
      from {
        opacity: 0;
        transform: translateX(-4px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes contentClose {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(-4px);
      }
    }
  `,
})
export default class NavigationMenuVerticalExample {}

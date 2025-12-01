import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronRight, lucideMoreHorizontal } from '@ng-icons/lucide';
import {
  NgpBreadcrumbEllipsis,
  NgpBreadcrumbItem,
  NgpBreadcrumbLink,
  NgpBreadcrumbList,
  NgpBreadcrumbPage,
  NgpBreadcrumbs,
  NgpBreadcrumbSeparator,
} from 'ng-primitives/breadcrumbs';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';

@Component({
  selector: 'app-breadcrumbs-tailwind',
  imports: [
    NgpBreadcrumbs,
    NgpBreadcrumbList,
    NgpBreadcrumbItem,
    NgpBreadcrumbLink,
    NgpBreadcrumbPage,
    NgpBreadcrumbSeparator,
    NgpBreadcrumbEllipsis,
    NgpMenu,
    NgpMenuTrigger,
    NgpMenuItem,
    NgIcon,
  ],
  providers: [provideIcons({ lucideChevronRight, lucideMoreHorizontal })],
  template: `
    <nav aria-label="Breadcrumb" ngpBreadcrumbs>
      <ol
        class="flex flex-wrap items-center gap-1.5 text-sm text-zinc-500 sm:gap-2.5 dark:text-zinc-400"
        ngpBreadcrumbList
      >
        <li class="inline-flex items-center gap-1.5" ngpBreadcrumbItem>
          <a
            class="transition-colors duration-150 hover:text-zinc-900 dark:hover:text-zinc-50"
            href="#"
            ngpBreadcrumbLink
          >
            Home
          </a>
        </li>
        <li class="text-zinc-300 dark:text-zinc-700" ngpBreadcrumbSeparator>
          <ng-icon
            class="text-current"
            style="--ng-icon__size: 0.85rem"
            name="lucideChevronRight"
          />
        </li>
        <li class="inline-flex items-center gap-1.5" ngpBreadcrumbItem>
          <button
            class="inline-flex h-9 w-9 items-center justify-center text-zinc-500 transition-colors duration-150 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            [ngpMenuTrigger]="menu"
            type="button"
            aria-label="Toggle breadcrumb menu"
          >
            <span class="flex h-full w-full items-center justify-center" ngpBreadcrumbEllipsis>
              <ng-icon
                class="text-current"
                style="--ng-icon__size: 1.1rem"
                name="lucideMoreHorizontal"
              />
            </span>
          </button>

          <ng-template #menu>
            <div
              class="fixed z-50 flex min-w-[140px] flex-col rounded-lg border border-zinc-200 bg-white p-1 text-left text-sm shadow-lg ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-900"
              ngpMenu
            >
              <button
                class="rounded-md px-3 py-2 text-left text-zinc-700 transition-colors duration-150 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800/80"
                ngpMenuItem
              >
                Documentation
              </button>
              <button
                class="rounded-md px-3 py-2 text-left text-zinc-700 transition-colors duration-150 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800/80"
                ngpMenuItem
              >
                Themes
              </button>
              <button
                class="rounded-md px-3 py-2 text-left text-zinc-700 transition-colors duration-150 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800/80"
                ngpMenuItem
              >
                GitHub
              </button>
            </div>
          </ng-template>
        </li>
        <li class="text-zinc-300 dark:text-zinc-700" ngpBreadcrumbSeparator>
          <ng-icon
            class="text-current"
            style="--ng-icon__size: 0.85rem"
            name="lucideChevronRight"
          />
        </li>
        <li class="inline-flex items-center gap-1.5" ngpBreadcrumbItem>
          <a
            class="transition-colors duration-150 hover:text-zinc-900 dark:hover:text-zinc-50"
            href="#"
            ngpBreadcrumbLink
          >
            Components
          </a>
        </li>
        <li class="text-zinc-300 dark:text-zinc-700" ngpBreadcrumbSeparator>
          <ng-icon
            class="text-current"
            style="--ng-icon__size: 0.85rem"
            name="lucideChevronRight"
          />
        </li>
        <li class="inline-flex items-center gap-1.5" ngpBreadcrumbItem>
          <span class="font-medium text-zinc-900 dark:text-zinc-50" ngpBreadcrumbPage>
            Breadcrumbs
          </span>
        </li>
      </ol>
    </nav>
  `,
})
export default class BreadcrumbsTailwindExample {}

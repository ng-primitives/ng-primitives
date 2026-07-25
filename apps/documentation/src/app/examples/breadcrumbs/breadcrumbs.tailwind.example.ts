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
  host: {
    class: 'contents',
  },
  template: `
    <nav aria-label="Breadcrumb" ngpBreadcrumbs>
      <ol
        class="m-0 flex list-none flex-wrap items-center gap-1.5 p-0 text-[0.875rem] tracking-[-0.006em] text-zinc-600 dark:text-zinc-300"
        ngpBreadcrumbList
      >
        <li class="inline-flex items-center gap-1.5" ngpBreadcrumbItem>
          <a
            class="inline-flex items-center text-inherit no-underline transition-colors duration-150 outline-none data-focus-visible:rounded-sm data-focus-visible:outline-2 data-focus-visible:outline-offset-[3px] data-focus-visible:outline-blue-500 data-hover:text-zinc-900 dark:data-focus-visible:outline-blue-400 dark:data-hover:text-zinc-100"
            href="#"
            ngpBreadcrumbLink
          >
            Home
          </a>
        </li>
        <li
          class="inline-flex items-center p-0 text-zinc-300 dark:text-zinc-700"
          ngpBreadcrumbSeparator
        >
          <ng-icon
            class="text-current!"
            style="--ng-icon__size: 0.85rem"
            name="lucideChevronRight"
          />
        </li>
        <li class="inline-flex items-center gap-1.5" ngpBreadcrumbItem>
          <button
            class="inline-flex cursor-pointer items-center justify-center border-none bg-none p-0"
            [ngpMenuTrigger]="menu"
            type="button"
            aria-label="Toggle breadcrumb menu"
          >
            <span
              class="inline-flex size-7 cursor-pointer items-center justify-center rounded-lg border-none bg-none p-0 text-zinc-500 transition-colors duration-150 outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 data-hover:text-zinc-900 dark:text-zinc-400 dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-zinc-900 dark:data-hover:text-zinc-100"
              ngpBreadcrumbEllipsis
            >
              <ng-icon
                class="text-current!"
                style="--ng-icon__size: 1rem"
                name="lucideMoreHorizontal"
              />
            </span>
          </button>

          <ng-template #menu>
            <div
              class="fixed z-50 flex min-w-[140px] flex-col rounded-lg border border-gray-200 bg-white p-1 text-left text-sm shadow-lg ring-1 ring-black/5 outline-none dark:border-zinc-800 dark:bg-zinc-950"
              ngpMenu
            >
              <button
                class="rounded-md px-2.5 py-1.5 text-left font-[510] tracking-[-0.006em] text-zinc-700 transition-colors duration-150 outline-none hover:bg-zinc-100 data-focus-visible:bg-zinc-100 data-press:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-800/80 dark:data-focus-visible:bg-zinc-800/80 dark:data-press:bg-zinc-700"
                ngpMenuItem
              >
                Documentation
              </button>
              <button
                class="rounded-md px-2.5 py-1.5 text-left font-[510] tracking-[-0.006em] text-zinc-700 transition-colors duration-150 outline-none hover:bg-zinc-100 data-focus-visible:bg-zinc-100 data-press:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-800/80 dark:data-focus-visible:bg-zinc-800/80 dark:data-press:bg-zinc-700"
                ngpMenuItem
              >
                Themes
              </button>
              <button
                class="rounded-md px-2.5 py-1.5 text-left font-[510] tracking-[-0.006em] text-zinc-700 transition-colors duration-150 outline-none hover:bg-zinc-100 data-focus-visible:bg-zinc-100 data-press:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-800/80 dark:data-focus-visible:bg-zinc-800/80 dark:data-press:bg-zinc-700"
                ngpMenuItem
              >
                GitHub
              </button>
            </div>
          </ng-template>
        </li>
        <li
          class="inline-flex items-center p-0 text-zinc-300 dark:text-zinc-700"
          ngpBreadcrumbSeparator
        >
          <ng-icon
            class="text-current!"
            style="--ng-icon__size: 0.85rem"
            name="lucideChevronRight"
          />
        </li>
        <li class="inline-flex items-center gap-1.5" ngpBreadcrumbItem>
          <a
            class="inline-flex items-center text-inherit no-underline transition-colors duration-150 outline-none data-focus-visible:rounded-sm data-focus-visible:outline-2 data-focus-visible:outline-offset-[3px] data-focus-visible:outline-blue-500 data-hover:text-zinc-900 dark:data-focus-visible:outline-blue-400 dark:data-hover:text-zinc-100"
            href="#"
            ngpBreadcrumbLink
          >
            Components
          </a>
        </li>
        <li
          class="inline-flex items-center p-0 text-zinc-300 dark:text-zinc-700"
          ngpBreadcrumbSeparator
        >
          <ng-icon
            class="text-current!"
            style="--ng-icon__size: 0.85rem"
            name="lucideChevronRight"
          />
        </li>
        <li class="inline-flex items-center gap-1.5" ngpBreadcrumbItem>
          <span class="font-[510] text-zinc-900 dark:text-zinc-50" ngpBreadcrumbPage>
            Breadcrumbs
          </span>
        </li>
      </ol>
    </nav>
  `,
})
export default class BreadcrumbsTailwindExample {}

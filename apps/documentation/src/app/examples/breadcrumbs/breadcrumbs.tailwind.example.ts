import { Component } from '@angular/core';
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
  standalone: true,
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
  ],
  template: `
    <nav
      class="inline-flex rounded-full border border-neutral-200/80 bg-white/80 px-2 py-1 text-sm shadow-sm ring-1 ring-black/5 backdrop-blur dark:border-white/10 dark:bg-neutral-900/70 dark:text-neutral-200"
      aria-label="Breadcrumb"
      ngpBreadcrumbs
    >
      <ol class="flex items-center gap-1" ngpBreadcrumbList>
        <li class="flex items-center" ngpBreadcrumbItem>
          <a
            class="rounded-full px-2 py-1 text-neutral-500 transition-colors duration-150 data-[hover]:bg-neutral-100 data-[hover]:text-neutral-900 data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-blue-500 dark:text-neutral-400 dark:data-[hover]:bg-white/10 dark:data-[hover]:text-white"
            href="/"
            ngpBreadcrumbLink
          >
            Home
          </a>
        </li>
        <li class="px-1 text-neutral-300 dark:text-neutral-600" ngpBreadcrumbSeparator>/</li>
        <li class="flex items-center" ngpBreadcrumbItem>
          <button
            class="inline-flex items-center gap-1 rounded-full p-1 text-neutral-500 transition-colors duration-150 data-[hover]:bg-neutral-100 data-[hover]:text-neutral-900 dark:text-neutral-400 dark:data-[hover]:bg-white/10 dark:data-[hover]:text-white"
            [ngpMenuTrigger]="menu"
            type="button"
            aria-label="Toggle breadcrumb menu"
          >
            <span ngpBreadcrumbEllipsis>...</span>
          </button>

          <ng-template #menu>
            <div
              class="flex min-w-[140px] flex-col rounded-lg border border-neutral-200/70 bg-white/90 p-1 text-left shadow-lg ring-1 ring-black/5 dark:border-white/10 dark:bg-neutral-900/80"
              ngpMenu
            >
              <button
                class="rounded-md px-3 py-2 text-sm text-neutral-700 transition-colors duration-150 data-[hover]:bg-neutral-100 dark:text-neutral-200 dark:data-[hover]:bg-white/10"
                ngpMenuItem
              >
                Documentation
              </button>
              <button
                class="rounded-md px-3 py-2 text-sm text-neutral-700 transition-colors duration-150 data-[hover]:bg-neutral-100 dark:text-neutral-200 dark:data-[hover]:bg-white/10"
                ngpMenuItem
              >
                Themes
              </button>
              <button
                class="rounded-md px-3 py-2 text-sm text-neutral-700 transition-colors duration-150 data-[hover]:bg-neutral-100 dark:text-neutral-200 dark:data-[hover]:bg-white/10"
                ngpMenuItem
              >
                GitHub
              </button>
            </div>
          </ng-template>
        </li>
        <li class="px-1 text-neutral-300 dark:text-neutral-600" ngpBreadcrumbSeparator>/</li>
        <li class="flex items-center" ngpBreadcrumbItem>
          <a
            class="rounded-full px-2 py-1 text-neutral-500 transition-colors duration-150 data-[hover]:bg-neutral-100 data-[hover]:text-neutral-900 data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-blue-500 dark:text-neutral-400 dark:data-[hover]:bg-white/10 dark:data-[hover]:text-white"
            href="/docs/components"
            ngpBreadcrumbLink
          >
            Components
          </a>
        </li>
        <li class="px-1 text-neutral-300 dark:text-neutral-600" ngpBreadcrumbSeparator>/</li>
        <li class="flex items-center" ngpBreadcrumbItem>
          <span
            class="rounded-full bg-neutral-100 px-2 py-1 font-semibold text-neutral-900 dark:bg-white/10 dark:text-white"
            ngpBreadcrumbPage
          >
            Breadcrumbs
          </span>
        </li>
      </ol>
    </nav>
  `,
})
export default class BreadcrumbsTailwindExample {}

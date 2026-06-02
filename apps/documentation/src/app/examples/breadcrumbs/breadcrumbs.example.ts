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
  selector: 'app-breadcrumbs',
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
  styles: `
    :host {
      display: contents;
    }

    [ngpBreadcrumbs] {
      display: block;
    }

    [ngpBreadcrumbList] {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.375rem;
      list-style: none;
      margin: 0;
      padding: 0;
      font-size: 0.875rem;
      letter-spacing: -0.006em;
      color: var(--ngp-text-secondary);
    }

    [ngpBreadcrumbItem] {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
    }

    [ngpBreadcrumbLink] {
      display: inline-flex;
      align-items: center;
      color: inherit;
      text-decoration: none;
      transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpBreadcrumbLink][data-hover] {
      color: var(--ngp-text-primary);
    }

    [ngpBreadcrumbLink][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 3px;
      border-radius: 0.25rem;
    }

    [ngpBreadcrumbPage] {
      font-weight: 510;
      color: var(--ngp-text-primary);
    }

    [ngpBreadcrumbSeparator] {
      color: var(--ngp-border-secondary);
      display: inline-flex;
      align-items: center;
      padding: 0;
    }

    /* Reset the default chrome on the menu trigger button */
    button[aria-label='Toggle breadcrumb menu'] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      border: none;
      background: none;
      cursor: pointer;
    }

    [ngpBreadcrumbEllipsis] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 0.5rem;
      color: var(--ngp-text-tertiary);
      padding: 0;
      border: none;
      background: none;
      cursor: pointer;
      transition:
        color 150ms ease,
        background-color 150ms ease;
    }

    [ngpBreadcrumbEllipsis] ng-icon {
      --ng-icon__size: 1rem;
    }

    [ngpBreadcrumbEllipsis][data-hover] {
      color: var(--ngp-text-primary);
      background-color: var(--ngp-background-hover);
    }

    [ngpBreadcrumbEllipsis][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpBreadcrumbSeparator] ng-icon {
      --ng-icon__size: 0.85rem;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    [ngpMenu] {
      position: fixed;
      display: flex;
      flex-direction: column;
      width: max-content;
      background: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      box-shadow: var(--ngp-shadow-lg);
      border-radius: 0.625rem;
      padding: 0.25rem;
      outline: none;
      transform-origin: var(--ngp-menu-transform-origin);
    }

    [ngpMenuItem] {
      padding: 0.4375rem 0.625rem;
      border: none;
      background: none;
      cursor: pointer;
      transition: background-color 0.15s ease;
      border-radius: 0.375rem;
      min-width: 150px;
      text-align: start;
      outline: none;
      font-size: 0.875rem;
      font-weight: 510;
      letter-spacing: -0.006em;
      color: var(--ngp-text-primary);
    }

    [ngpMenuItem][data-hover],
    [ngpMenuItem][data-focus-visible] {
      background-color: var(--ngp-background-hover);
    }

    [ngpMenuItem][data-press] {
      background-color: var(--ngp-background-active);
    }
  `,
  template: `
    <nav aria-label="Breadcrumb" ngpBreadcrumbs>
      <ol ngpBreadcrumbList>
        <li ngpBreadcrumbItem>
          <a ngpBreadcrumbLink href="#">Home</a>
        </li>
        <li ngpBreadcrumbSeparator aria-hidden="true">
          <ng-icon name="lucideChevronRight" />
        </li>
        <li ngpBreadcrumbItem>
          <button
            [ngpMenuTrigger]="breadcrumbMenu"
            type="button"
            aria-label="Toggle breadcrumb menu"
          >
            <span ngpBreadcrumbEllipsis>
              <ng-icon name="lucideMoreHorizontal" />
            </span>
          </button>

          <ng-template #breadcrumbMenu>
            <div ngpMenu>
              <button ngpMenuItem>Documentation</button>
              <button ngpMenuItem>Themes</button>
              <button ngpMenuItem>GitHub</button>
            </div>
          </ng-template>
        </li>
        <li ngpBreadcrumbSeparator>
          <ng-icon name="lucideChevronRight" />
        </li>
        <li ngpBreadcrumbItem>
          <a ngpBreadcrumbLink href="#">Components</a>
        </li>
        <li ngpBreadcrumbSeparator>
          <ng-icon name="lucideChevronRight" />
        </li>
        <li ngpBreadcrumbItem>
          <span ngpBreadcrumbPage>Breadcrumbs</span>
        </li>
      </ol>
    </nav>
  `,
})
export default class BreadcrumbsExample {}

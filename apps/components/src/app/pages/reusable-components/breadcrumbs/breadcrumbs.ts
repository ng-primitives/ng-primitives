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
  ],
  template: `
    <nav class="breadcrumbs" aria-label="Breadcrumb" ngpBreadcrumbs>
      <ol ngpBreadcrumbList>
        <li ngpBreadcrumbItem>
          <a class="breadcrumbs-link" href="/" ngpBreadcrumbLink>Home</a>
        </li>
        <li class="breadcrumbs-separator" ngpBreadcrumbSeparator>/</li>
        <li ngpBreadcrumbItem>
          <button
            class="breadcrumbs-ellipsis"
            [ngpMenuTrigger]="breadcrumbMenu"
            ngpBreadcrumbEllipsis
            type="button"
            aria-label="Toggle breadcrumb menu"
          >
            <span aria-hidden="true">...</span>
          </button>

          <ng-template #breadcrumbMenu>
            <div class="breadcrumbs-menu" ngpMenu>
              <button ngpMenuItem>Documentation</button>
              <button ngpMenuItem>Themes</button>
              <button ngpMenuItem>GitHub</button>
            </div>
          </ng-template>
        </li>
        <li class="breadcrumbs-separator" ngpBreadcrumbSeparator>/</li>
        <li ngpBreadcrumbItem>
          <a class="breadcrumbs-link" href="/docs/components" ngpBreadcrumbLink>Components</a>
        </li>
        <li class="breadcrumbs-separator" ngpBreadcrumbSeparator>/</li>
        <li ngpBreadcrumbItem>
          <span class="breadcrumbs-page" ngpBreadcrumbPage>Breadcrumbs</span>
        </li>
      </ol>
    </nav>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    .breadcrumbs {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border-radius: 999px;
      border: 1px solid rgba(15, 23, 42, 0.08);
      background-color: var(--ngp-background, #fff);
      padding: 0.35rem 0.75rem;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
    }

    [ngpBreadcrumbList] {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      margin: 0;
      padding: 0;
      list-style: none;
      font-size: 0.875rem;
    }

    [ngpBreadcrumbItem] {
      display: inline-flex;
      align-items: center;
    }

    .breadcrumbs-link {
      text-decoration: none;
      color: var(--ngp-text-secondary);
      border-radius: 999px;
      padding: 0.35rem 0.6rem;
      transition:
        background-color 150ms ease,
        color 150ms ease;
    }

    .breadcrumbs-link[data-hover] {
      background-color: var(--ngp-background-secondary);
      color: var(--ngp-text-primary);
    }

    .breadcrumbs-link[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    .breadcrumbs-page {
      font-weight: 600;
      color: var(--ngp-text-primary);
      padding: 0.35rem 0.6rem;
      border-radius: 999px;
      background-color: var(--ngp-background-secondary);
    }

    .breadcrumbs-ellipsis {
      border: none;
      background: none;
      border-radius: 999px;
      padding: 0.25rem 0.45rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--ngp-text-secondary);
      cursor: pointer;
      font-size: 1rem;
    }

    .breadcrumbs-ellipsis[data-hover] {
      background-color: var(--ngp-background-secondary);
    }

    .breadcrumbs-ellipsis[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    .breadcrumbs-separator {
      color: var(--ngp-border-strong);
      padding: 0 0.25rem;
    }

    .breadcrumbs-menu {
      position: fixed;
      display: flex;
      flex-direction: column;
      width: max-content;
      background: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      box-shadow: var(--ngp-shadow-lg);
      border-radius: 8px;
      padding: 4px;
      transform-origin: var(--ngp-menu-transform-origin);
    }

    .breadcrumbs-menu [ngpMenuItem] {
      padding: 6px 14px;
      border: none;
      background: none;
      cursor: pointer;
      transition: background-color 0.2s;
      border-radius: 4px;
      min-width: 120px;
      text-align: start;
      outline: none;
      font-size: 14px;
      font-weight: 400;
    }

    .breadcrumbs-menu [ngpMenuItem][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    .breadcrumbs-menu [ngpMenuItem][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
    }
  `,
})
export class Breadcrumbs {}

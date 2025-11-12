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
  styles: `
    :host {
      display: contents;
    }

    [ngpBreadcrumbs] {
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
      list-style: none;
      margin: 0;
      padding: 0;
      font-size: 0.875rem;
    }

    [ngpBreadcrumbItem] {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    [ngpBreadcrumbLink] {
      color: var(--ngp-text-secondary);
      text-decoration: none;
      border-radius: 999px;
      padding: 0.35rem 0.6rem;
      transition:
        background-color 150ms ease,
        color 150ms ease;
    }

    [ngpBreadcrumbLink][data-hover] {
      background-color: var(--ngp-background-secondary);
      color: var(--ngp-text-primary);
    }

    [ngpBreadcrumbLink][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpBreadcrumbPage] {
      font-weight: 600;
      color: var(--ngp-text-primary);
      padding: 0.35rem 0.6rem;
      border-radius: 999px;
      background-color: var(--ngp-background-secondary);
    }

    [ngpBreadcrumbSeparator] {
      color: var(--ngp-border-strong);
      padding: 0 0.25rem;
    }

    [ngpBreadcrumbEllipsis] {
      border: none;
      background: none;
      border-radius: 999px;
      color: var(--ngp-text-secondary);
      padding: 0.25rem 0.45rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1rem;
    }

    [ngpBreadcrumbEllipsis][data-hover] {
      background-color: var(--ngp-background-secondary);
    }

    [ngpBreadcrumbEllipsis][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpMenu] {
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

    [ngpMenuItem] {
      padding: 6px 14px;
      border: none;
      background: none;
      cursor: pointer;
      transition: background-color 0.2s;
      border-radius: 4px;
      min-width: 140px;
      text-align: start;
      outline: none;
      font-size: 14px;
      font-weight: 400;
    }

    [ngpMenuItem][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpMenuItem][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
    }
  `,
  template: `
    <nav aria-label="Breadcrumb" ngpBreadcrumbs>
      <ol ngpBreadcrumbList>
        <li ngpBreadcrumbItem>
          <a ngpBreadcrumbLink href="/">Home</a>
        </li>
        <li ngpBreadcrumbSeparator>/</li>
        <li ngpBreadcrumbItem>
          <button
            [ngpMenuTrigger]="breadcrumbMenu"
            type="button"
            aria-label="Toggle breadcrumb menu"
          >
            <span ngpBreadcrumbEllipsis>...</span>
          </button>

          <ng-template #breadcrumbMenu>
            <div ngpMenu>
              <button ngpMenuItem>Documentation</button>
              <button ngpMenuItem>Themes</button>
              <button ngpMenuItem>GitHub</button>
            </div>
          </ng-template>
        </li>
        <li ngpBreadcrumbSeparator>/</li>
        <li ngpBreadcrumbItem>
          <a ngpBreadcrumbLink href="/docs/components">Components</a>
        </li>
        <li ngpBreadcrumbSeparator>/</li>
        <li ngpBreadcrumbItem>
          <span ngpBreadcrumbPage>Breadcrumbs</span>
        </li>
      </ol>
    </nav>
  `,
})
export default class BreadcrumbsExample {}

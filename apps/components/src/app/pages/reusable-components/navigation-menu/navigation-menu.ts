import { Component, input } from '@angular/core';
import { Placement } from '@floating-ui/dom';
import {
  NgpNavigationMenu,
  NgpNavigationMenuContent,
  NgpNavigationMenuIndicator,
  NgpNavigationMenuItem,
  NgpNavigationMenuLink,
  NgpNavigationMenuList,
  NgpNavigationMenuPortal,
  NgpNavigationMenuTrigger,
  NgpNavigationMenuViewport,
} from 'ng-primitives/navigation-menu';

/**
 * A link within a navigation menu item.
 */
export interface NavigationMenuLink {
  /**
   * The title of the link.
   */
  title: string;

  /**
   * Optional description text.
   */
  description?: string;

  /**
   * The URL the link points to.
   */
  href: string;

  /**
   * Whether this link is the current active page.
   */
  active?: boolean;
}

/**
 * Configuration for a navigation menu item.
 */
export interface NavigationMenuItemConfig {
  /**
   * Unique identifier for this menu item.
   */
  value: string;

  /**
   * The label shown on the trigger button.
   */
  label: string;

  /**
   * The links to display in the dropdown content.
   */
  links: NavigationMenuLink[];

  /**
   * Number of columns for the link grid.
   * @default 1
   */
  columns?: number;

  /**
   * Width of the content panel.
   * @default 'default'
   */
  width?: 'narrow' | 'default' | 'wide';
}

@Component({
  selector: 'app-navigation-menu',
  imports: [
    NgpNavigationMenuList,
    NgpNavigationMenuItem,
    NgpNavigationMenuTrigger,
    NgpNavigationMenuContent,
    NgpNavigationMenuIndicator,
    NgpNavigationMenuPortal,
    NgpNavigationMenuViewport,
    NgpNavigationMenuLink,
  ],
  hostDirectives: [
    {
      directive: NgpNavigationMenu,
      inputs: [
        'ngpNavigationMenuValue:value',
        'ngpNavigationMenuOrientation:orientation',
        'ngpNavigationMenuShowDelay:showDelay',
        'ngpNavigationMenuCooldown:cooldown',
      ],
      outputs: ['ngpNavigationMenuValueChange:valueChange'],
    },
  ],
  template: `
    <ul ngpNavigationMenuList>
      <div ngpNavigationMenuIndicator></div>
      @for (item of items(); track item.value) {
        <li [ngpNavigationMenuItemValue]="item.value" ngpNavigationMenuItem>
          <button ngpNavigationMenuTrigger>
            {{ item.label }}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M2.5 4.5L6 8L9.5 4.5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <ul
            class="content-list"
            *ngpNavigationMenuContent
            [class.content-list-narrow]="item.width === 'narrow'"
            [class.content-list-wide]="item.width === 'wide'"
            [style.grid-template-columns]="
              item.columns ? 'repeat(' + item.columns + ', 1fr)' : null
            "
          >
            @for (link of item.links; track $index) {
              <li>
                <a
                  class="link"
                  [ngpNavigationMenuLinkActive]="link.active ?? false"
                  [href]="link.href"
                  ngpNavigationMenuLink
                >
                  <span class="link-title">{{ link.title }}</span>
                  @if (link.description) {
                    <span class="link-description">{{ link.description }}</span>
                  }
                </a>
              </li>
            }
          </ul>
        </li>
      }
    </ul>
    <ng-template
      [ngpNavigationMenuPortalPlacement]="placement()"
      [ngpNavigationMenuPortalOffset]="offset()"
      ngpNavigationMenuPortal
    >
      <div ngpNavigationMenuViewport></div>
    </ng-template>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    [ngpNavigationMenuList] {
      position: relative;
      display: flex;
      gap: 2px;
      list-style: none;
      padding: 4px;
      margin: 0;
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      border-radius: 10px;
    }

    [ngpNavigationMenuIndicator] {
      z-index: 0 !important;
      background-color: var(--ngp-background-hover);
      border-radius: 6px;
      transition:
        top 150ms ease,
        left 150ms ease,
        width 150ms ease,
        height 150ms ease,
        opacity 150ms ease;
    }

    [ngpNavigationMenuIndicator][data-state='hidden'] {
      opacity: 0;
      transition: none;
    }

    [ngpNavigationMenuItem] {
      position: relative;
      z-index: 1;
    }

    [ngpNavigationMenuTrigger] {
      display: flex;
      align-items: center;
      gap: 4px;
      height: 32px;
      padding: 0 12px;
      border: none;
      background: none;
      border-radius: 6px;
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      color: var(--ngp-text-primary);
      transition: color 150ms ease;
    }

    [ngpNavigationMenuTrigger]:focus-visible {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpNavigationMenuTrigger] svg {
      transition: transform 150ms ease;
    }

    [ngpNavigationMenuTrigger][data-state='open'] svg {
      transform: rotate(180deg);
    }

    .content-list {
      list-style: none;
      padding: 1rem;
      margin: 0;
      display: grid;
      gap: 0.5rem;
      width: 300px;
      position: absolute;
      top: 0;
      left: 0;
      animation-duration: 200ms;
      animation-timing-function: ease;
    }

    .content-list-narrow {
      width: 200px;
    }

    .content-list-wide {
      width: 400px;
    }

    .content-list[data-motion='from-start'] {
      animation-name: slideFromLeft;
    }

    .content-list[data-motion='from-end'] {
      animation-name: slideFromRight;
    }

    @keyframes slideFromLeft {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes slideFromRight {
      from {
        opacity: 0;
        transform: translateX(10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .link {
      display: block;
      padding: 0.375rem 0.5rem;
      border-radius: 6px;
      text-decoration: none;
      transition: background-color 150ms ease;
    }

    .link:hover {
      background-color: var(--ngp-background-hover);
    }

    .link:focus-visible {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: -2px;
    }

    .link-title {
      display: block;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--ngp-text-primary);
      line-height: 1.2;
      margin-bottom: 4px;
    }

    .link-description {
      display: block;
      font-size: 0.75rem;
      color: var(--ngp-text-secondary);
      margin: 0;
      line-height: 1.2;
    }

    [ngpNavigationMenuViewport] {
      position: relative;
      width: var(--ngp-navigation-menu-viewport-width, 0);
      height: var(--ngp-navigation-menu-viewport-height, 0);
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      border-radius: 0.5rem;
      box-shadow: var(--ngp-shadow-lg);
      overflow: hidden;
      opacity: 0;
      transition:
        width 250ms ease,
        height 250ms ease;
    }

    [ngpNavigationMenuViewport][data-state='closed'] {
      width: 0;
      height: 0;
      opacity: 0;
      pointer-events: none;
    }

    [ngpNavigationMenuViewport][data-enter] {
      animation: viewportOpen 200ms ease forwards;
    }

    @keyframes viewportOpen {
      from {
        opacity: 0;
        transform: rotateX(-10deg) scale(0.96);
      }
      to {
        opacity: 1;
        transform: rotateX(0deg) scale(1);
      }
    }
  `,
})
export class NavigationMenu {
  /**
   * The menu items to display.
   */
  readonly items = input.required<NavigationMenuItemConfig[]>();

  /**
   * The placement of the dropdown viewport.
   * @default 'bottom'
   */
  readonly placement = input<Placement>('bottom');

  /**
   * The offset from the trigger.
   * @default 8
   */
  readonly offset = input<number>(8);
}

import { Component } from '@angular/core';
import {
  NgpNavigationMenu,
  NgpNavigationMenuContent,
  NgpNavigationMenuContentItem,
  NgpNavigationMenuItem,
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
    NgpNavigationMenuContentItem,
  ],
  template: `
    <nav class="navigation-menu" ngpNavigationMenu>
      <ul class="navigation-menu-list" ngpNavigationMenuList>
        <li ngpNavigationMenuItem>
          <button
            class="navigation-menu-trigger"
            [ngpNavigationMenuTrigger]="learnMenu"
            [ngpNavigationMenuTriggerOffset]="8"
            [ngpNavigationMenuTriggerCooldown]="0"
          >
            Learn
          </button>
          <ng-template #learnMenu>
            <div class="navigation-menu-content" ngpNavigationMenuContent>
              <ul class="content-list content-list-wide">
                <li>
                  <a class="navigation-menu-link callout" ngpNavigationMenuContentItem href="#">
                    <div class="callout-icon">🚀</div>
                    <div class="callout-content">
                      <div class="callout-title">Getting Started</div>
                      <p class="callout-description">
                        Learn the basics and get up and running quickly.
                      </p>
                    </div>
                  </a>
                </li>
                <li>
                  <a class="navigation-menu-link" ngpNavigationMenuContentItem href="#">
                    <div class="link-title">Introduction</div>
                    <p class="link-description">Build accessible components.</p>
                  </a>
                </li>
                <li>
                  <a class="navigation-menu-link" ngpNavigationMenuContentItem href="#">
                    <div class="link-title">Installation</div>
                    <p class="link-description">Step-by-step installation guide.</p>
                  </a>
                </li>
                <li>
                  <a class="navigation-menu-link" ngpNavigationMenuContentItem href="#">
                    <div class="link-title">Styling</div>
                    <p class="link-description">Learn how to style primitives.</p>
                  </a>
                </li>
              </ul>
            </div>
          </ng-template>
        </li>

        <li ngpNavigationMenuItem>
          <button
            class="navigation-menu-trigger"
            [ngpNavigationMenuTrigger]="componentsMenu"
            [ngpNavigationMenuTriggerOffset]="8"
            [ngpNavigationMenuTriggerCooldown]="0"
          >
            Components
          </button>
          <ng-template #componentsMenu>
            <div
              class="navigation-menu-content"
              ngpNavigationMenuContent
              ngpNavigationMenuContentOrientation="horizontal"
            >
              <ul class="content-list content-list-grid">
                <li>
                  <a class="navigation-menu-link" ngpNavigationMenuContentItem href="#">
                    <div class="link-title">Button</div>
                    <p class="link-description">Trigger actions.</p>
                  </a>
                </li>
                <li>
                  <a class="navigation-menu-link" ngpNavigationMenuContentItem href="#">
                    <div class="link-title">Dialog</div>
                    <p class="link-description">Modal dialogs.</p>
                  </a>
                </li>
                <li>
                  <a class="navigation-menu-link" ngpNavigationMenuContentItem href="#">
                    <div class="link-title">Tooltip</div>
                    <p class="link-description">Display information.</p>
                  </a>
                </li>
                <li>
                  <a class="navigation-menu-link" ngpNavigationMenuContentItem href="#">
                    <div class="link-title">Popover</div>
                    <p class="link-description">Floating content.</p>
                  </a>
                </li>
                <li>
                  <a class="navigation-menu-link" ngpNavigationMenuContentItem href="#">
                    <div class="link-title">Tabs</div>
                    <p class="link-description">Organize content.</p>
                  </a>
                </li>
                <li>
                  <a class="navigation-menu-link" ngpNavigationMenuContentItem href="#">
                    <div class="link-title">Menu</div>
                    <p class="link-description">Dropdown menus.</p>
                  </a>
                </li>
              </ul>
            </div>
          </ng-template>
        </li>

        <li ngpNavigationMenuItem>
          <button
            class="navigation-menu-trigger"
            [ngpNavigationMenuTrigger]="resourcesMenu"
            [ngpNavigationMenuTriggerOffset]="8"
            [ngpNavigationMenuTriggerCooldown]="0"
          >
            Resources
          </button>
          <ng-template #resourcesMenu>
            <div class="navigation-menu-content" ngpNavigationMenuContent>
              <ul class="content-list content-list-narrow">
                <li>
                  <a class="navigation-menu-link" ngpNavigationMenuContentItem href="#">
                    <div class="link-title">Documentation</div>
                    <p class="link-description">Full API reference.</p>
                  </a>
                </li>
                <li>
                  <a class="navigation-menu-link" ngpNavigationMenuContentItem href="#">
                    <div class="link-title">GitHub</div>
                    <p class="link-description">View the source code.</p>
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
    .navigation-menu {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    .navigation-menu-list {
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

    [ngpNavigationMenuItem] {
      position: relative;
      z-index: 1;
    }

    .navigation-menu-trigger {
      display: flex;
      align-items: center;
      height: 32px;
      padding: 0 12px;
      border: none;
      background: none;
      border-radius: 6px;
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      color: var(--ngp-text-primary);
      transition:
        color 150ms ease,
        background-color 150ms ease;
    }

    .navigation-menu-trigger:hover,
    .navigation-menu-trigger[data-open] {
      background-color: var(--ngp-background-hover);
    }

    .navigation-menu-trigger:focus-visible {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    .navigation-menu-content {
      position: fixed;
      padding: 1rem;
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      border-radius: 0.5rem;
      box-shadow: var(--ngp-shadow-lg);
    }

    .navigation-menu-content[data-enter] {
      animation: contentOpen 200ms ease forwards;
    }

    .navigation-menu-content[data-exit] {
      animation: contentClose 150ms ease forwards;
    }

    /* Skip animations during instant transitions (cooldown) */
    .navigation-menu-content[data-instant][data-enter],
    .navigation-menu-content[data-instant][data-exit] {
      animation: none;
    }

    @keyframes contentOpen {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes contentClose {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-4px);
      }
    }

    /* Content list layouts */
    .content-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 0.5rem;
    }

    .content-list-wide {
      grid-template-columns: 1fr 1fr;
      width: 500px;
    }

    .content-list-wide > li:first-child {
      grid-row: span 3;
    }

    .content-list-grid {
      grid-template-columns: 1fr 1fr 1fr;
      width: 500px;
    }

    .content-list-narrow {
      width: 200px;
    }

    /* Link styles */
    .navigation-menu-link {
      display: block;
      padding: 0.375rem 0.5rem;
      border-radius: 6px;
      text-decoration: none;
      transition: background-color 150ms ease;
    }

    .navigation-menu-link:hover,
    .navigation-menu-link:focus {
      background-color: var(--ngp-background-hover);
      outline: none;
    }

    .navigation-menu-link:focus-visible {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: -2px;
    }

    .link-title {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--ngp-text-primary);
      line-height: 1.2;
      margin-bottom: 4px;
    }

    .link-description {
      font-size: 0.75rem;
      color: var(--ngp-text-secondary);
      margin: 0;
      line-height: 1.2;
    }

    /* Callout link style */
    .callout {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: linear-gradient(135deg, var(--ngp-background-hover), var(--ngp-background));
      border: 1px solid var(--ngp-border);
    }

    .callout-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .callout-content {
      flex: 1;
    }

    .callout-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--ngp-text-primary);
      margin-bottom: 0.5rem;
    }

    .callout-description {
      font-size: 0.8rem;
      color: var(--ngp-text-secondary);
      margin: 0;
      line-height: 1.5;
    }
  `,
})
export default class NavigationMenuExample {}

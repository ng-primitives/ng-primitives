import { Component } from '@angular/core';
import {
  NgpNavigationMenu,
  NgpNavigationMenuContent,
  NgpNavigationMenuIndicator,
  NgpNavigationMenuItem,
  NgpNavigationMenuLink,
  NgpNavigationMenuList,
  NgpNavigationMenuTrigger,
  NgpNavigationMenuViewport,
} from 'ng-primitives/navigation-menu';

@Component({
  selector: 'app-navigation-menu-viewport',
  imports: [
    NgpNavigationMenu,
    NgpNavigationMenuList,
    NgpNavigationMenuItem,
    NgpNavigationMenuTrigger,
    NgpNavigationMenuContent,
    NgpNavigationMenuLink,
    NgpNavigationMenuIndicator,
    NgpNavigationMenuViewport,
  ],
  template: `
    <nav class="navigation-menu" ngpNavigationMenu>
      <ul class="navigation-menu-list" ngpNavigationMenuList>
        <div class="navigation-menu-indicator" ngpNavigationMenuIndicator></div>

        <li ngpNavigationMenuItem ngpNavigationMenuItemValue="learn">
          <button class="navigation-menu-trigger" ngpNavigationMenuTrigger>Learn</button>
          <div class="navigation-menu-content" ngpNavigationMenuContent>
            <ul class="content-list content-list-wide">
              <li>
                <a class="navigation-menu-link callout" ngpNavigationMenuLink href="#">
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
                <a class="navigation-menu-link" ngpNavigationMenuLink href="#">
                  <div class="link-title">Introduction</div>
                  <p class="link-description">Build accessible components.</p>
                </a>
              </li>
              <li>
                <a class="navigation-menu-link" ngpNavigationMenuLink href="#">
                  <div class="link-title">Installation</div>
                  <p class="link-description">Step-by-step installation guide.</p>
                </a>
              </li>
              <li>
                <a class="navigation-menu-link" ngpNavigationMenuLink href="#">
                  <div class="link-title">Styling</div>
                  <p class="link-description">Learn how to style primitives.</p>
                </a>
              </li>
            </ul>
          </div>
        </li>

        <li ngpNavigationMenuItem ngpNavigationMenuItemValue="components">
          <button class="navigation-menu-trigger" ngpNavigationMenuTrigger>Components</button>
          <div class="navigation-menu-content" ngpNavigationMenuContent>
            <ul class="content-list content-list-grid">
              <li>
                <a class="navigation-menu-link" ngpNavigationMenuLink href="#">
                  <div class="link-title">Button</div>
                  <p class="link-description">Trigger actions.</p>
                </a>
              </li>
              <li>
                <a class="navigation-menu-link" ngpNavigationMenuLink href="#">
                  <div class="link-title">Dialog</div>
                  <p class="link-description">Modal dialogs.</p>
                </a>
              </li>
              <li>
                <a class="navigation-menu-link" ngpNavigationMenuLink href="#">
                  <div class="link-title">Tooltip</div>
                  <p class="link-description">Display information.</p>
                </a>
              </li>
              <li>
                <a class="navigation-menu-link" ngpNavigationMenuLink href="#">
                  <div class="link-title">Popover</div>
                  <p class="link-description">Floating content.</p>
                </a>
              </li>
              <li>
                <a class="navigation-menu-link" ngpNavigationMenuLink href="#">
                  <div class="link-title">Tabs</div>
                  <p class="link-description">Organize content.</p>
                </a>
              </li>
              <li>
                <a class="navigation-menu-link" ngpNavigationMenuLink href="#">
                  <div class="link-title">Menu</div>
                  <p class="link-description">Dropdown menus.</p>
                </a>
              </li>
            </ul>
          </div>
        </li>

        <li ngpNavigationMenuItem ngpNavigationMenuItemValue="resources">
          <button class="navigation-menu-trigger" ngpNavigationMenuTrigger>Resources</button>
          <div class="navigation-menu-content" ngpNavigationMenuContent>
            <ul class="content-list content-list-narrow">
              <li>
                <a class="navigation-menu-link" ngpNavigationMenuLink href="#">
                  <div class="link-title">Documentation</div>
                  <p class="link-description">Full API reference.</p>
                </a>
              </li>
              <li>
                <a class="navigation-menu-link" ngpNavigationMenuLink href="#">
                  <div class="link-title">GitHub</div>
                  <p class="link-description">View the source code.</p>
                </a>
              </li>
            </ul>
          </div>
        </li>
      </ul>

      <!-- Viewport provides CSS variables for animated dimensions -->
      <div class="viewport-container">
        <div class="navigation-menu-viewport" ngpNavigationMenuViewport></div>
      </div>
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
      gap: 0.25rem;
      list-style: none;
      padding: 0.25rem;
      margin: 0;
      background-color: var(--ngp-background);
      border-radius: 0.5rem;
    }

    .navigation-menu-indicator {
      background-color: var(--ngp-background-hover);
      border-radius: 0.375rem;
      transition: all 150ms ease;
    }

    .navigation-menu-indicator[data-state='hidden'] {
      opacity: 0;
    }

    .navigation-menu-trigger {
      padding: 0.5rem 1rem;
      border: none;
      background: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      color: var(--ngp-text-primary);
      transition: background-color 150ms ease;
    }

    .navigation-menu-trigger[data-state='open'],
    .navigation-menu-trigger:hover {
      background-color: var(--ngp-background-hover);
    }

    .navigation-menu-trigger:focus-visible {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    /* Viewport container positions the viewport below the menu */
    .viewport-container {
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      perspective: 2000px;
      margin-top: 0.5rem;
    }

    /* Viewport animates its dimensions using CSS variables */
    .navigation-menu-viewport {
      position: relative;
      width: var(--ngp-navigation-menu-viewport-width, 0);
      height: var(--ngp-navigation-menu-viewport-height, 0);
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      border-radius: 0.5rem;
      box-shadow: var(--ngp-shadow-lg);
      overflow: hidden;
      transition:
        width 250ms ease,
        height 250ms ease;
    }

    .navigation-menu-viewport[data-state='closed'] {
      width: 0;
      height: 0;
      opacity: 0;
      pointer-events: none;
    }

    .navigation-menu-viewport[data-state='open'] {
      animation: viewportOpen 200ms ease;
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

    /* Content panels are absolutely positioned */
    .navigation-menu-content {
      position: absolute;
      top: 0;
      left: 0;
      padding: 1rem;
      animation-duration: 200ms;
      animation-timing-function: ease;
    }

    .navigation-menu-content[data-state='closed'] {
      display: none;
    }

    .navigation-menu-content[data-motion='from-start'] {
      animation-name: slideFromLeft;
    }

    .navigation-menu-content[data-motion='from-end'] {
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
      padding: 0.75rem;
      border-radius: 0.375rem;
      text-decoration: none;
      transition:
        background-color 150ms ease,
        color 150ms ease;
    }

    .navigation-menu-link:hover {
      background-color: var(--ngp-background-hover);
    }

    .navigation-menu-link:focus-visible {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: -2px;
    }

    .link-title {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--ngp-text-primary);
      margin-bottom: 0.25rem;
    }

    .link-description {
      font-size: 0.75rem;
      color: var(--ngp-text-secondary);
      margin: 0;
      line-height: 1.4;
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
export default class NavigationMenuViewportExample {}

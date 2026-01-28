import { Component } from '@angular/core';
import {
  NgpNavigationMenu,
  NgpNavigationMenuContent,
  NgpNavigationMenuIndicator,
  NgpNavigationMenuItem,
  NgpNavigationMenuLink,
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
    NgpNavigationMenuLink,
    NgpNavigationMenuIndicator,
  ],
  template: `
    <nav ngpNavigationMenu>
      <ul ngpNavigationMenuList>
        <div ngpNavigationMenuIndicator></div>
        <li ngpNavigationMenuItem ngpNavigationMenuItemValue="getting-started">
          <button ngpNavigationMenuTrigger>Getting Started</button>
          <div ngpNavigationMenuContent>
            <ul>
              <li><a ngpNavigationMenuLink href="#">Introduction</a></li>
              <li><a ngpNavigationMenuLink href="#">Installation</a></li>
              <li><a ngpNavigationMenuLink href="#">Quick Start</a></li>
            </ul>
          </div>
        </li>
        <li ngpNavigationMenuItem ngpNavigationMenuItemValue="components">
          <button ngpNavigationMenuTrigger>Components</button>
          <div ngpNavigationMenuContent>
            <ul>
              <li><a ngpNavigationMenuLink href="#">Button</a></li>
              <li><a ngpNavigationMenuLink href="#">Input</a></li>
              <li><a ngpNavigationMenuLink href="#">Select</a></li>
            </ul>
          </div>
        </li>
        <li ngpNavigationMenuItem ngpNavigationMenuItemValue="resources">
          <button ngpNavigationMenuTrigger>Resources</button>
          <div ngpNavigationMenuContent>
            <ul>
              <li><a ngpNavigationMenuLink href="#">Documentation</a></li>
              <li><a ngpNavigationMenuLink href="#">GitHub</a></li>
              <li><a ngpNavigationMenuLink href="#">Discord</a></li>
            </ul>
          </div>
        </li>
      </ul>
    </nav>
  `,
  styles: `
    [ngpNavigationMenu] {
      display: flex;
      justify-content: center;
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
      background-color: var(--ngp-background-hover);
      border-radius: 6px;
      transition: all 150ms ease;
    }

    [ngpNavigationMenuIndicator][data-state='hidden'] {
      opacity: 0;
    }

    [ngpNavigationMenuItem] {
      position: relative;
    }

    [ngpNavigationMenuTrigger] {
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
      transition: background-color 150ms ease;
    }

    [ngpNavigationMenuTrigger][data-state='open'],
    [ngpNavigationMenuTrigger]:hover {
      background-color: var(--ngp-background-hover);
    }

    [ngpNavigationMenuTrigger]:focus-visible {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpNavigationMenuContent] {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 0.5rem;
      min-width: 140px;
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      border-radius: 0.5rem;
      padding: 0.375rem;
      box-shadow: var(--ngp-shadow-lg);
      animation-duration: 150ms;
      animation-timing-function: ease;
    }

    [ngpNavigationMenuContent][data-state='open'] {
      animation-name: fadeIn;
    }

    [ngpNavigationMenuContent][data-state='closed'] {
      display: none;
    }

    [ngpNavigationMenuContent][data-motion='from-start'] {
      animation-name: enterFromLeft;
    }

    [ngpNavigationMenuContent][data-motion='from-end'] {
      animation-name: enterFromRight;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes enterFromLeft {
      from {
        opacity: 0;
        transform: translateX(-8px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes enterFromRight {
      from {
        opacity: 0;
        transform: translateX(8px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    [ngpNavigationMenuContent] ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    [ngpNavigationMenuLink] {
      display: flex;
      align-items: center;
      height: 32px;
      padding: 0 0.5rem;
      border-radius: 6px;
      text-decoration: none;
      font-size: 0.8125rem;
      color: var(--ngp-text-primary);
      transition: background-color 150ms ease;
    }

    [ngpNavigationMenuLink]:hover {
      background-color: var(--ngp-background-hover);
    }

    [ngpNavigationMenuLink][data-active] {
      font-weight: 500;
    }
  `,
})
export default class NavigationMenuExample {}

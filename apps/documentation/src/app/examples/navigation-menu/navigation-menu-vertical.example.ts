import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroMagnifyingGlass,
  heroSquares2x2,
  heroDocumentText,
  heroUsers,
  heroCog6Tooth,
  heroChartBar,
  heroFolder,
  heroBell,
} from '@ng-icons/heroicons/outline';
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
import { NgpTooltip, NgpTooltipTrigger } from 'ng-primitives/tooltip';

@Component({
  selector: 'app-navigation-menu-vertical',
  imports: [
    NgIcon,
    NgpNavigationMenu,
    NgpNavigationMenuList,
    NgpNavigationMenuItem,
    NgpNavigationMenuTrigger,
    NgpNavigationMenuContent,
    NgpNavigationMenuLink,
    NgpNavigationMenuIndicator,
    NgpNavigationMenuViewport,
    NgpTooltip,
    NgpTooltipTrigger,
  ],
  providers: [
    provideIcons({
      heroMagnifyingGlass,
      heroSquares2x2,
      heroDocumentText,
      heroUsers,
      heroCog6Tooth,
      heroChartBar,
      heroFolder,
      heroBell,
    }),
  ],
  template: `
    <nav class="sidebar" ngpNavigationMenu ngpNavigationMenuOrientation="vertical">
      <ul class="sidebar-list" ngpNavigationMenuList>
        <div class="sidebar-indicator" ngpNavigationMenuIndicator></div>

        <li class="sidebar-item" ngpNavigationMenuItem ngpNavigationMenuItemValue="search">
          <button
            class="sidebar-trigger"
            ngpNavigationMenuTrigger
            ngpTooltipTrigger="Search"
            ngpTooltipPlacement="right"
          >
            <ng-icon name="heroMagnifyingGlass" size="20" />
          </button>
          <div class="sidebar-content" ngpNavigationMenuContent>
            <div class="content-header">Search</div>
            <ul class="content-list">
              <li><a class="content-link" ngpNavigationMenuLink href="#">Quick Search</a></li>
              <li><a class="content-link" ngpNavigationMenuLink href="#">Advanced Search</a></li>
              <li><a class="content-link" ngpNavigationMenuLink href="#">Recent Searches</a></li>
            </ul>
          </div>
        </li>

        <li class="sidebar-item" ngpNavigationMenuItem ngpNavigationMenuItemValue="dashboard">
          <button
            class="sidebar-trigger"
            ngpNavigationMenuTrigger
            ngpTooltipTrigger="Dashboard"
            ngpTooltipPlacement="right"
          >
            <ng-icon name="heroSquares2x2" size="20" />
          </button>
          <div class="sidebar-content" ngpNavigationMenuContent>
            <div class="content-header">Dashboard</div>
            <ul class="content-list">
              <li><a class="content-link" ngpNavigationMenuLink href="#">Overview</a></li>
              <li><a class="content-link" ngpNavigationMenuLink href="#">Analytics</a></li>
              <li><a class="content-link" ngpNavigationMenuLink href="#">Reports</a></li>
            </ul>
          </div>
        </li>

        <li class="sidebar-item" ngpNavigationMenuItem ngpNavigationMenuItemValue="analytics">
          <button
            class="sidebar-trigger"
            ngpNavigationMenuTrigger
            ngpTooltipTrigger="Analytics"
            ngpTooltipPlacement="right"
          >
            <ng-icon name="heroChartBar" size="20" />
          </button>
          <div class="sidebar-content" ngpNavigationMenuContent>
            <div class="content-header">Analytics</div>
            <ul class="content-list">
              <li><a class="content-link" ngpNavigationMenuLink href="#">Traffic</a></li>
              <li><a class="content-link" ngpNavigationMenuLink href="#">Conversions</a></li>
              <li><a class="content-link" ngpNavigationMenuLink href="#">Revenue</a></li>
              <li><a class="content-link" ngpNavigationMenuLink href="#">Engagement</a></li>
            </ul>
          </div>
        </li>

        <li class="sidebar-item" ngpNavigationMenuItem ngpNavigationMenuItemValue="documents">
          <button
            class="sidebar-trigger"
            ngpNavigationMenuTrigger
            ngpTooltipTrigger="Documents"
            ngpTooltipPlacement="right"
          >
            <ng-icon name="heroDocumentText" size="20" />
          </button>
          <div class="sidebar-content" ngpNavigationMenuContent>
            <div class="content-header">Documents</div>
            <ul class="content-list">
              <li><a class="content-link" ngpNavigationMenuLink href="#">All Documents</a></li>
              <li><a class="content-link" ngpNavigationMenuLink href="#">Shared with Me</a></li>
              <li><a class="content-link" ngpNavigationMenuLink href="#">Favorites</a></li>
            </ul>
          </div>
        </li>

        <li class="sidebar-item" ngpNavigationMenuItem ngpNavigationMenuItemValue="projects">
          <button
            class="sidebar-trigger"
            ngpNavigationMenuTrigger
            ngpTooltipTrigger="Projects"
            ngpTooltipPlacement="right"
          >
            <ng-icon name="heroFolder" size="20" />
          </button>
          <div class="sidebar-content" ngpNavigationMenuContent>
            <div class="content-header">Projects</div>
            <ul class="content-list">
              <li><a class="content-link" ngpNavigationMenuLink href="#">Active</a></li>
              <li><a class="content-link" ngpNavigationMenuLink href="#">Archived</a></li>
            </ul>
          </div>
        </li>

        <li class="sidebar-item" ngpNavigationMenuItem ngpNavigationMenuItemValue="users">
          <button
            class="sidebar-trigger"
            ngpNavigationMenuTrigger
            ngpTooltipTrigger="Users"
            ngpTooltipPlacement="right"
          >
            <ng-icon name="heroUsers" size="20" />
          </button>
          <div class="sidebar-content" ngpNavigationMenuContent>
            <div class="content-header">Users</div>
            <ul class="content-list">
              <li><a class="content-link" ngpNavigationMenuLink href="#">All Users</a></li>
              <li><a class="content-link" ngpNavigationMenuLink href="#">Teams</a></li>
              <li><a class="content-link" ngpNavigationMenuLink href="#">Permissions</a></li>
            </ul>
          </div>
        </li>

        <li class="sidebar-divider"></li>

        <li class="sidebar-item" ngpNavigationMenuItem ngpNavigationMenuItemValue="notifications">
          <button
            class="sidebar-trigger"
            ngpNavigationMenuTrigger
            ngpTooltipTrigger="Notifications"
            ngpTooltipPlacement="right"
          >
            <ng-icon name="heroBell" size="20" />
          </button>
          <div class="sidebar-content" ngpNavigationMenuContent>
            <div class="content-header">Notifications</div>
            <ul class="content-list">
              <li><a class="content-link" ngpNavigationMenuLink href="#">All</a></li>
              <li><a class="content-link" ngpNavigationMenuLink href="#">Unread</a></li>
              <li><a class="content-link" ngpNavigationMenuLink href="#">Mentions</a></li>
            </ul>
          </div>
        </li>

        <li class="sidebar-item" ngpNavigationMenuItem ngpNavigationMenuItemValue="settings">
          <button
            class="sidebar-trigger"
            ngpNavigationMenuTrigger
            ngpTooltipTrigger="Settings"
            ngpTooltipPlacement="right"
          >
            <ng-icon name="heroCog6Tooth" size="20" />
          </button>
          <div class="sidebar-content" ngpNavigationMenuContent>
            <div class="content-header">Settings</div>
            <ul class="content-list">
              <li><a class="content-link" ngpNavigationMenuLink href="#">General</a></li>
              <li><a class="content-link" ngpNavigationMenuLink href="#">Appearance</a></li>
              <li><a class="content-link" ngpNavigationMenuLink href="#">Notifications</a></li>
            </ul>
          </div>
        </li>
      </ul>

      <div class="viewport-container">
        <div class="sidebar-viewport" ngpNavigationMenuViewport></div>
      </div>
    </nav>
  `,
  styles: `
    :host {
      display: block;
      height: 420px;
    }

    .sidebar {
      display: flex;
      position: relative;
      height: 100%;
    }

    .sidebar-list {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      list-style: none;
      padding: 0.5rem;
      margin: 0;
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      border-radius: 0.75rem;
    }

    .sidebar-indicator {
      z-index: 0 !important;
      background-color: var(--ngp-background-active);
      border-radius: 0.5rem;
      transition:
        top 150ms ease,
        left 150ms ease,
        width 150ms ease,
        height 150ms ease,
        opacity 150ms ease;
    }

    .sidebar-indicator::before {
      content: '';
      position: absolute;
      left: -0.5rem;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 20px;
      background-color: var(--ngp-text-blue);
      border-radius: 0 2px 2px 0;
    }

    .sidebar-indicator[data-state='hidden'] {
      opacity: 0;
      transition: none;
    }

    .sidebar-item {
      position: relative;
      z-index: 1;
    }

    .sidebar-trigger {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      padding: 0;
      border: none;
      background: none;
      border-radius: 0.5rem;
      cursor: pointer;
      color: var(--ngp-text-secondary);
      transition: color 150ms ease;
    }

    .sidebar-trigger:hover,
    .sidebar-trigger[data-state='open'] {
      color: var(--ngp-text-primary);
    }

    .sidebar-trigger:focus-visible {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    .viewport-container {
      position: absolute;
      left: 100%;
      top: 0;
      margin-left: 0.5rem;
      perspective: 2000px;
    }

    .sidebar-viewport {
      position: relative;
      width: var(--ngp-navigation-menu-viewport-width, 0);
      height: var(--ngp-navigation-menu-viewport-height, 0);
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      border-radius: 0.5rem;
      box-shadow: var(--ngp-shadow-lg);
      overflow: hidden;
      transform: translateY(var(--ngp-navigation-menu-viewport-top, 0));
      transition:
        width 200ms ease,
        height 200ms ease;
    }

    .sidebar-viewport[data-state='closed'] {
      width: 0;
      height: 0;
      opacity: 0;
      pointer-events: none;
    }

    .sidebar-viewport[data-state='open'] {
      animation: viewportOpen 200ms ease;
    }

    @keyframes viewportOpen {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .sidebar-content {
      position: absolute;
      top: 0;
      left: 0;
      padding: 0.75rem;
      animation-duration: 150ms;
      animation-timing-function: ease;
    }

    .sidebar-content[data-state='closed'] {
      display: none;
    }

    .sidebar-content[data-motion='from-start'] {
      animation-name: slideFromTop;
    }

    .sidebar-content[data-motion='from-end'] {
      animation-name: slideFromBottom;
    }

    @keyframes slideFromTop {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideFromBottom {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .content-header {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--ngp-text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.25rem 0.5rem;
      margin-bottom: 0.25rem;
    }

    .content-list {
      list-style: none;
      padding: 0;
      margin: 0;
      min-width: 160px;
    }

    .content-link {
      display: block;
      padding: 0.5rem;
      border-radius: 0.375rem;
      text-decoration: none;
      font-size: 0.875rem;
      color: var(--ngp-text-secondary);
      white-space: nowrap;
      transition: all 150ms ease;
    }

    .content-link:hover {
      background-color: var(--ngp-background-hover);
      color: var(--ngp-text-primary);
    }

    .content-link:focus-visible {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: -2px;
    }

    .sidebar-divider {
      height: 1px;
      margin: 0.5rem 0.25rem;
      background-color: var(--ngp-border);
    }
  `,
})
export default class NavigationMenuVerticalExample {}

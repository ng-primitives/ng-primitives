import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroBell,
  heroChartBar,
  heroCog6Tooth,
  heroDocumentText,
  heroFolder,
  heroMagnifyingGlass,
  heroSquares2x2,
  heroUsers,
} from '@ng-icons/heroicons/outline';
import {
  NgpNavigationMenu,
  NgpNavigationMenuContent,
  NgpNavigationMenuContentItem,
  NgpNavigationMenuItem,
  NgpNavigationMenuList,
  NgpNavigationMenuTrigger,
} from 'ng-primitives/navigation-menu';

@Component({
  selector: 'app-navigation-menu-vertical',
  imports: [
    NgIcon,
    NgpNavigationMenu,
    NgpNavigationMenuList,
    NgpNavigationMenuItem,
    NgpNavigationMenuTrigger,
    NgpNavigationMenuContent,
    NgpNavigationMenuContentItem,
  ],
  viewProviders: [
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
    <nav
      class="sidebar"
      ngpNavigationMenu
      ngpNavigationMenuOrientation="vertical"
      ngpNavigationMenuShowDelay="0"
    >
      <ul class="sidebar-list" ngpNavigationMenuList>
        <li class="sidebar-item" ngpNavigationMenuItem>
          <button
            class="sidebar-trigger"
            [ngpNavigationMenuTrigger]="searchMenu"
            ngpNavigationMenuTriggerPlacement="right-start"
            [ngpNavigationMenuTriggerOffset]="16"
            aria-label="Search"
          >
            <ng-icon name="heroMagnifyingGlass" size="20" aria-hidden="true" />
          </button>
          <ng-template #searchMenu>
            <div class="sidebar-content" ngpNavigationMenuContent>
              <div class="content-header">Search</div>
              <ul class="content-list">
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">Quick Search</a></li>
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">Advanced Search</a></li>
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">Recent Searches</a></li>
              </ul>
            </div>
          </ng-template>
        </li>

        <li class="sidebar-item" ngpNavigationMenuItem>
          <button
            class="sidebar-trigger"
            [ngpNavigationMenuTrigger]="dashboardMenu"
            ngpNavigationMenuTriggerPlacement="right-start"
            [ngpNavigationMenuTriggerOffset]="16"
            aria-label="Dashboard"
          >
            <ng-icon name="heroSquares2x2" size="20" aria-hidden="true" />
          </button>
          <ng-template #dashboardMenu>
            <div class="sidebar-content" ngpNavigationMenuContent>
              <div class="content-header">Dashboard</div>
              <ul class="content-list">
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">Overview</a></li>
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">Analytics</a></li>
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">Reports</a></li>
              </ul>
            </div>
          </ng-template>
        </li>

        <li class="sidebar-item" ngpNavigationMenuItem>
          <button
            class="sidebar-trigger"
            [ngpNavigationMenuTrigger]="analyticsMenu"
            ngpNavigationMenuTriggerPlacement="right-start"
            [ngpNavigationMenuTriggerOffset]="16"
            aria-label="Analytics"
          >
            <ng-icon name="heroChartBar" size="20" aria-hidden="true" />
          </button>
          <ng-template #analyticsMenu>
            <div class="sidebar-content" ngpNavigationMenuContent>
              <div class="content-header">Analytics</div>
              <ul class="content-list">
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">Traffic</a></li>
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">Conversions</a></li>
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">Revenue</a></li>
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">Engagement</a></li>
              </ul>
            </div>
          </ng-template>
        </li>

        <li class="sidebar-item" ngpNavigationMenuItem>
          <button
            class="sidebar-trigger"
            [ngpNavigationMenuTrigger]="documentsMenu"
            ngpNavigationMenuTriggerPlacement="right-start"
            [ngpNavigationMenuTriggerOffset]="16"
            aria-label="Documents"
          >
            <ng-icon name="heroDocumentText" size="20" aria-hidden="true" />
          </button>
          <ng-template #documentsMenu>
            <div class="sidebar-content" ngpNavigationMenuContent>
              <div class="content-header">Documents</div>
              <ul class="content-list">
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">All Documents</a></li>
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">Shared with Me</a></li>
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">Favorites</a></li>
              </ul>
            </div>
          </ng-template>
        </li>

        <li class="sidebar-item" ngpNavigationMenuItem>
          <button
            class="sidebar-trigger"
            [ngpNavigationMenuTrigger]="projectsMenu"
            ngpNavigationMenuTriggerPlacement="right-start"
            [ngpNavigationMenuTriggerOffset]="16"
            aria-label="Projects"
          >
            <ng-icon name="heroFolder" size="20" aria-hidden="true" />
          </button>
          <ng-template #projectsMenu>
            <div class="sidebar-content" ngpNavigationMenuContent>
              <div class="content-header">Projects</div>
              <ul class="content-list">
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">Active</a></li>
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">Archived</a></li>
              </ul>
            </div>
          </ng-template>
        </li>

        <li class="sidebar-item" ngpNavigationMenuItem>
          <button
            class="sidebar-trigger"
            [ngpNavigationMenuTrigger]="usersMenu"
            ngpNavigationMenuTriggerPlacement="right-start"
            [ngpNavigationMenuTriggerOffset]="16"
            aria-label="Users"
          >
            <ng-icon name="heroUsers" size="20" aria-hidden="true" />
          </button>
          <ng-template #usersMenu>
            <div class="sidebar-content" ngpNavigationMenuContent>
              <div class="content-header">Users</div>
              <ul class="content-list">
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">All Users</a></li>
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">Teams</a></li>
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">Permissions</a></li>
              </ul>
            </div>
          </ng-template>
        </li>

        <li class="sidebar-divider"></li>

        <li class="sidebar-item" ngpNavigationMenuItem>
          <button
            class="sidebar-trigger"
            [ngpNavigationMenuTrigger]="notificationsMenu"
            ngpNavigationMenuTriggerPlacement="right-start"
            [ngpNavigationMenuTriggerOffset]="16"
            aria-label="Notifications"
          >
            <ng-icon name="heroBell" size="20" aria-hidden="true" />
          </button>
          <ng-template #notificationsMenu>
            <div class="sidebar-content" ngpNavigationMenuContent>
              <div class="content-header">Notifications</div>
              <ul class="content-list">
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">All</a></li>
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">Unread</a></li>
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">Mentions</a></li>
              </ul>
            </div>
          </ng-template>
        </li>

        <li class="sidebar-item" ngpNavigationMenuItem>
          <button
            class="sidebar-trigger"
            [ngpNavigationMenuTrigger]="settingsMenu"
            ngpNavigationMenuTriggerPlacement="right-start"
            [ngpNavigationMenuTriggerOffset]="16"
            aria-label="Settings"
          >
            <ng-icon name="heroCog6Tooth" size="20" aria-hidden="true" />
          </button>
          <ng-template #settingsMenu>
            <div class="sidebar-content" ngpNavigationMenuContent>
              <div class="content-header">Settings</div>
              <ul class="content-list">
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">General</a></li>
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">Appearance</a></li>
                <li><a class="content-link" ngpNavigationMenuContentItem href="#">Notifications</a></li>
              </ul>
            </div>
          </ng-template>
        </li>
      </ul>
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
      border-radius: 8px;
      cursor: pointer;
      color: var(--ngp-text-secondary);
      transition:
        color 150ms ease,
        background-color 150ms ease;
    }

    .sidebar-trigger:hover,
    .sidebar-trigger[data-open] {
      color: var(--ngp-text-primary);
      background-color: var(--ngp-background-active);
    }

    .sidebar-trigger:focus-visible {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    .sidebar-content {
      position: fixed;
      padding: 0.375rem;
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      border-radius: 12px;
      box-shadow: var(--ngp-shadow-lg);
    }

    .sidebar-content[data-enter] {
      animation: contentOpen 200ms ease forwards;
    }

    .sidebar-content[data-exit] {
      animation: contentClose 150ms ease forwards;
    }

    /* Skip animations during instant transitions (cooldown) */
    .sidebar-content[data-instant][data-enter],
    .sidebar-content[data-instant][data-exit] {
      animation: none;
    }

    @keyframes contentOpen {
      from {
        opacity: 0;
        transform: translateX(-4px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes contentClose {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(-4px);
      }
    }

    .content-header {
      font-size: 0.6875rem;
      font-weight: 600;
      line-height: 1;
      color: var(--ngp-text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.5rem 0.5rem 0.375rem;
    }

    .content-list {
      list-style: none;
      padding: 0;
      margin: 0;
      min-width: 140px;
    }

    .content-link {
      display: flex;
      align-items: center;
      height: 32px;
      padding: 0 0.5rem;
      border-radius: 6px;
      text-decoration: none;
      font-size: 0.8125rem;
      color: var(--ngp-text-primary);
      white-space: nowrap;
      transition: background-color 150ms ease;
    }

    .content-link:hover,
    .content-link:focus {
      background-color: var(--ngp-background-hover);
      outline: none;
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

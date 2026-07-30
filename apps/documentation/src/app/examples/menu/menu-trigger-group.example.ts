import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChartBar, heroFolder, heroUsers } from '@ng-icons/heroicons/outline';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger, NgpMenuTriggerGroup } from 'ng-primitives/menu';

@Component({
  selector: 'app-menu-trigger-group',
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpMenuTriggerGroup, NgIcon],
  providers: [provideIcons({ heroUsers, heroFolder, heroChartBar })],
  template: `
    <nav class="sidebar" ngpMenuTriggerGroup>
      <div class="sidebar-header">Workspace</div>

      <div class="sidebar-body">
        <button
          class="sidebar-item"
          [ngpMenuTrigger]="teamMenu"
          [ngpMenuTriggerOpenTriggers]="['hover']"
          ngpMenuTriggerPlacement="right-start"
        >
          <ng-icon name="heroUsers" />
          Team
        </button>
        <button
          class="sidebar-item"
          [ngpMenuTrigger]="projectsMenu"
          [ngpMenuTriggerOpenTriggers]="['hover']"
          ngpMenuTriggerPlacement="right-start"
        >
          <ng-icon name="heroFolder" />
          Projects
        </button>
        <button
          class="sidebar-item"
          [ngpMenuTrigger]="reportsMenu"
          [ngpMenuTriggerOpenTriggers]="['hover']"
          ngpMenuTriggerPlacement="right-start"
        >
          <ng-icon name="heroChartBar" />
          Reports
        </button>
      </div>
    </nav>

    <ng-template #teamMenu>
      <div ngpMenu>
        <button ngpMenuItem>Members</button>
        <button ngpMenuItem>Roles</button>
        <button ngpMenuItem>Invitations</button>
      </div>
    </ng-template>

    <ng-template #projectsMenu>
      <div ngpMenu>
        <button ngpMenuItem>Active</button>
        <button ngpMenuItem>Archived</button>
        <button ngpMenuItem>Templates</button>
      </div>
    </ng-template>

    <ng-template #reportsMenu>
      <div ngpMenu>
        <button ngpMenuItem>Overview</button>
        <button ngpMenuItem>Usage</button>
        <button ngpMenuItem>Billing</button>
      </div>
    </ng-template>
  `,
  styles: `
    .sidebar {
      display: flex;
      flex-direction: column;
      width: 13rem;
      border-radius: 0.75rem;
      border: 1px solid var(--ngp-border);
      background-color: var(--ngp-background);
      overflow: hidden;
    }

    .sidebar-header {
      padding: 0.625rem 0.75rem 0.25rem;
      font-size: 0.75rem;
      font-weight: 590;
      letter-spacing: -0.011em;
      text-transform: uppercase;
      color: var(--ngp-text-tertiary);
    }

    .sidebar-body {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0 0.5rem 0.5rem;
    }

    .sidebar-item {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      height: 2.125rem;
      padding-inline: 0.625rem;
      border: none;
      border-radius: 0.5rem;
      background: none;
      cursor: pointer;
      text-align: start;
      font-size: 0.875rem;
      font-weight: 510;
      letter-spacing: -0.006em;
      color: var(--ngp-text-primary);
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
    }

    .sidebar-item ng-icon {
      color: var(--ngp-text-tertiary);
      --ng-icon__size: 1.125rem;
    }

    .sidebar-item:hover,
    .sidebar-item[data-open] {
      background-color: var(--ngp-background-hover);
    }

    .sidebar-item:hover ng-icon,
    .sidebar-item[data-open] ng-icon {
      color: var(--ngp-text-primary);
    }

    .sidebar-item:focus-visible {
      box-shadow: 0 0 0 2px var(--ngp-focus-ring);
    }

    .sidebar-item:active {
      background-color: var(--ngp-background-active);
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
      animation: menu-show 0.2s ease-out;
      transform-origin: var(--ngp-menu-transform-origin);
    }

    [ngpMenu][data-exit] {
      animation: menu-hide 0.2s ease-out;
    }

    [ngpMenuItem] {
      display: flex;
      align-items: center;
      padding: 0.4375rem 0.5rem 0.4375rem 0.75rem;
      border: none;
      background: none;
      cursor: pointer;
      transition: background-color 0.15s ease;
      border-radius: 0.375rem;
      min-width: 140px;
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

    @keyframes menu-show {
      0% {
        opacity: 0;
        transform: scale(0.9);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes menu-hide {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(0.9);
      }
    }
  `,
})
export default class MenuTriggerGroupExample {}

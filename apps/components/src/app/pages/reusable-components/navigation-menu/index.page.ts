import { Component } from '@angular/core';
import { NavigationMenu } from './navigation-menu';
import { NavigationMenuItem } from './navigation-menu-item';

@Component({
  selector: 'app-navigation-menu-example',
  imports: [NavigationMenu, NavigationMenuItem],
  template: `
    <app-navigation-menu>
      <app-navigation-menu-item value="products" label="Products">
        <ul class="content-list content-list-grid">
          <li>
            <a class="link" href="#">
              <span class="link-title">Analytics</span>
              <span class="link-description">Track and analyze your data</span>
            </a>
          </li>
          <li>
            <a class="link" href="#">
              <span class="link-title">Engagement</span>
              <span class="link-description">Increase user interaction</span>
            </a>
          </li>
          <li>
            <a class="link" href="#">
              <span class="link-title">Security</span>
              <span class="link-description">Protect your data</span>
            </a>
          </li>
          <li>
            <a class="link" href="#">
              <span class="link-title">Integrations</span>
              <span class="link-description">Connect with other tools</span>
            </a>
          </li>
        </ul>
      </app-navigation-menu-item>

      <app-navigation-menu-item value="solutions" label="Solutions">
        <ul class="content-list">
          <li>
            <a class="link" href="#">
              <span class="link-title">Enterprise</span>
              <span class="link-description">Solutions for large organizations</span>
            </a>
          </li>
          <li>
            <a class="link" href="#">
              <span class="link-title">Small Business</span>
              <span class="link-description">Perfect for growing teams</span>
            </a>
          </li>
          <li>
            <a class="link" href="#">
              <span class="link-title">Startups</span>
              <span class="link-description">Get started quickly</span>
            </a>
          </li>
        </ul>
      </app-navigation-menu-item>

      <app-navigation-menu-item value="resources" label="Resources">
        <ul class="content-list content-list-narrow">
          <li>
            <a class="link" href="#">
              <span class="link-title">Documentation</span>
              <span class="link-description">Full API reference</span>
            </a>
          </li>
          <li>
            <a class="link" href="#">
              <span class="link-title">Blog</span>
              <span class="link-description">Latest news and updates</span>
            </a>
          </li>
        </ul>
      </app-navigation-menu-item>
    </app-navigation-menu>
  `,
  styles: `
    :host {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }

    .content-list {
      list-style: none;
      padding: 1rem;
      margin: 0;
      display: grid;
      gap: 0.5rem;
      width: 300px;
    }

    .content-list-grid {
      grid-template-columns: 1fr 1fr;
      width: 400px;
    }

    .content-list-narrow {
      width: 200px;
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
  `,
})
export default class App {}

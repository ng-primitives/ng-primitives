import { Component } from '@angular/core';
import { NavigationMenu, NavigationMenuItemConfig } from './navigation-menu';

@Component({
  selector: 'app-navigation-menu-example',
  imports: [NavigationMenu],
  template: `
    <app-navigation-menu [items]="menuItems" />
  `,
  styles: `
    :host {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }
  `,
})
export default class App {
  readonly menuItems: NavigationMenuItemConfig[] = [
    {
      value: 'products',
      label: 'Products',
      columns: 2,
      width: 'wide',
      links: [
        {
          title: 'Analytics',
          description: 'Track and analyze your data',
          href: '#',
        },
        {
          title: 'Engagement',
          description: 'Increase user interaction',
          href: '#',
        },
        {
          title: 'Security',
          description: 'Protect your data',
          href: '#',
        },
        {
          title: 'Integrations',
          description: 'Connect with other tools',
          href: '#',
        },
      ],
    },
    {
      value: 'solutions',
      label: 'Solutions',
      links: [
        {
          title: 'Enterprise',
          description: 'Solutions for large organizations',
          href: '#',
        },
        {
          title: 'Small Business',
          description: 'Perfect for growing teams',
          href: '#',
        },
        {
          title: 'Startups',
          description: 'Get started quickly',
          href: '#',
        },
      ],
    },
    {
      value: 'resources',
      label: 'Resources',
      width: 'narrow',
      links: [
        {
          title: 'Documentation',
          description: 'Full API reference',
          href: '#',
        },
        {
          title: 'Blog',
          description: 'Latest news and updates',
          href: '#',
        },
      ],
    },
  ];
}

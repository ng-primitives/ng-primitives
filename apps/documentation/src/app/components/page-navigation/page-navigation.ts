import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroArrowRight } from '@ng-icons/heroicons/outline';
import { filter } from 'rxjs';
import { getRouterLinks } from '../../utils/router';

interface NavLink {
  path: string;
  name: string;
  section: string;
  order: number;
}

@Component({
  selector: 'docs-page-navigation',
  imports: [RouterLink, NgIcon],
  providers: [provideIcons({ heroArrowLeft, heroArrowRight })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (previous() || next()) {
      <nav
        class="not-prose mt-12 flex items-stretch gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800"
        aria-label="Page navigation"
      >
        @if (previous(); as prev) {
          <a
            class="group flex flex-1 flex-col items-start gap-1 rounded-lg border border-zinc-200 px-4 py-3 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
            [routerLink]="'/' + prev.path"
          >
            <span class="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <ng-icon class="text-sm" name="heroArrowLeft" />
              Previous
            </span>
            <span class="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {{ prev.name }}
            </span>
          </a>
        } @else {
          <div class="flex-1"></div>
        }

        @if (next(); as nxt) {
          <a
            class="group flex flex-1 flex-col items-end gap-1 rounded-lg border border-zinc-200 px-4 py-3 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
            [routerLink]="'/' + nxt.path"
          >
            <span class="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              Next
              <ng-icon class="text-sm" name="heroArrowRight" />
            </span>
            <span class="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {{ nxt.name }}
            </span>
          </a>
        } @else {
          <div class="flex-1"></div>
        }
      </nav>
    }
  `,
})
export class PageNavigation {
  private readonly router = inject(Router);

  private readonly currentUrl = signal(this.router.url);

  private readonly allLinks: NavLink[];

  readonly previous = computed(() => {
    const idx = this.currentIndex();
    return idx > 0 ? this.allLinks[idx - 1] : null;
  });

  readonly next = computed(() => {
    const idx = this.currentIndex();
    return idx >= 0 && idx < this.allLinks.length - 1 ? this.allLinks[idx + 1] : null;
  });

  constructor() {
    const sectionOrder = ['Getting Started', 'Primitives', 'Interactions', 'Utilities'];

    this.allLinks = Object.entries(getRouterLinks())
      .map(([path, data]) => {
        const normalizedPath = path
          .replace('../pages/', '')
          .replace('.md', '')
          .replace('(documentation)/', '');

        const [section] = normalizedPath.split('/');
        const sectionTitle = section
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        return {
          path: normalizedPath,
          name: data['name'],
          section: sectionTitle,
          order: data['order'] ?? Infinity,
        };
      })
      .sort((a, b) => {
        const sectionDiff = sectionOrder.indexOf(a.section) - sectionOrder.indexOf(b.section);
        if (sectionDiff !== 0) return sectionDiff;
        return a.order - b.order;
      });

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      this.currentUrl.set(event.urlAfterRedirects);
    });
  }

  private readonly currentIndex = computed(() => {
    const url = this.currentUrl().split('#')[0].split('?')[0];
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    return this.allLinks.findIndex(link => link.path === cleanUrl);
  });
}

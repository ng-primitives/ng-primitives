import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
        class="not-prose border-border-subtle mt-16 flex items-stretch gap-4 border-t pt-8"
        aria-label="Page navigation"
      >
        @if (previous(); as prev) {
          <a
            class="group border-border-default bg-surface hover:border-border-strong hover:bg-surface-raised flex flex-1 flex-col items-start gap-1 rounded-xl border px-4 py-3.5 transition-all"
            [routerLink]="'/' + prev.path"
          >
            <span class="text-fg-tertiary flex items-center gap-1.5 text-xs">
              <ng-icon
                class="text-sm transition-transform group-hover:-translate-x-0.5"
                name="heroArrowLeft"
              />
              Previous
            </span>
            <span class="text-fg group-hover:text-primary text-sm font-medium transition-colors">
              {{ prev.name }}
            </span>
          </a>
        } @else {
          <div class="flex-1"></div>
        }

        @if (next(); as nxt) {
          <a
            class="group border-border-default bg-surface hover:border-border-strong hover:bg-surface-raised flex flex-1 flex-col items-end gap-1 rounded-xl border px-4 py-3.5 transition-all"
            [routerLink]="'/' + nxt.path"
          >
            <span class="text-fg-tertiary flex items-center gap-1.5 text-xs">
              Next
              <ng-icon
                class="text-sm transition-transform group-hover:translate-x-0.5"
                name="heroArrowRight"
              />
            </span>
            <span class="text-fg group-hover:text-primary text-sm font-medium transition-colors">
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

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(event => {
        this.currentUrl.set(event.urlAfterRedirects);
      });
  }

  private readonly currentIndex = computed(() => {
    const url = this.currentUrl().split('#')[0].split('?')[0];
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    return this.allLinks.findIndex(link => link.path === cleanUrl);
  });
}

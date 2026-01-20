import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorGithubLogoDuotone } from '@ng-icons/phosphor-icons/duotone';
import { filter, map, startWith } from 'rxjs';
import { getRouterLinks } from '../../utils/router';

@Component({
  selector: 'docs-source-link',
  imports: [NgIcon],
  providers: [
    provideIcons({
      phosphorGithubLogoDuotone,
    }),
  ],
  template: `
    @if (sourceUrl(); as url) {
      <a
        class="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        [href]="url"
        target="_blank"
        rel="noopener noreferrer"
      >
        <ng-icon class="text-base" name="phosphorGithubLogoDuotone" />
        View Source
      </a>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block mb-6',
  },
})
export class SourceLink {
  private readonly router = inject(Router);

  private readonly currentRoute = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
  );

  readonly sourceUrl = computed(() => {
    const route = this.currentRoute();
    if (!route) return null;

    // Get all router links with their metadata
    const links = getRouterLinks();

    // Find the matching route
    for (const [path, data] of Object.entries(links)) {
      const normalizedPath = path
        .replace('../pages/', '')
        .replace('.md', '')
        .replace('(documentation)/', '');

      if (route === `/${normalizedPath}`) {
        return data['sourceUrl'] as string | undefined;
      }
    }

    return null;
  });
}

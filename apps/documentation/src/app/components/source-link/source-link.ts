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
        class="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none dark:text-zinc-600 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-300 dark:focus-visible:ring-zinc-600"
        [href]="url"
        [attr.aria-label]="'View source code on GitHub'"
        [attr.title]="'View source code'"
        target="_blank"
        rel="noopener noreferrer"
      >
        <ng-icon class="text-lg" name="phosphorGithubLogoDuotone" />
      </a>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex ml-3 align-middle',
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

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { QuickLinks } from '../../components/quick-links/quick-links';
import { HeadingAnchor } from '../../directives/heading-anchor';
import { SourceLink } from '../../directives/source-link';

@Component({
  selector: 'docs-utilites',
  template: `
    <div class="flex gap-x-12">
      <div
        class="prose prose-sm prose-zinc dark:prose-invert flex-1 overflow-hidden px-px"
        data-page-content
        docsHeadingAnchor
        docsSourceLink
      >
        <div class="mx-auto w-fit max-w-full">
          <p
            class="from-primary to-accent mb-2 inline-block bg-linear-to-r bg-clip-text text-sm font-medium text-transparent"
          >
            Utilities
          </p>
          <div class="max-w-3xl">
            <router-outlet />
          </div>
        </div>
      </div>
      <docs-quick-links />
    </div>
  `,
  imports: [RouterOutlet, QuickLinks, HeadingAnchor, SourceLink],
  host: {
    class: 'flex-1 max-w-full',
  },
})
export default class UtilitiesPage {}

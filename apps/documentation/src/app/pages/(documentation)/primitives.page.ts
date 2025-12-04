import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { QuickLinks } from '../../components/quick-links/quick-links';
import { HeadingAnchorDirective } from '../../directives/heading-anchor.directive';

@Component({
  selector: 'docs-primitives',
  template: `
    <div class="flex gap-x-12">
      <div
        class="prose prose-sm prose-zinc dark:prose-invert flex-1 overflow-hidden px-px"
        data-page-content
        docsHeadingAnchor
      >
        <div class="mx-auto w-fit max-w-full">
          <p
            class="from-primary to-accent mt-0 mb-2 inline-block bg-linear-to-r bg-clip-text text-sm font-medium text-transparent"
          >
            Primitives
          </p>
          <div class="max-w-3xl">
            <router-outlet />
          </div>
        </div>
      </div>
      <docs-quick-links />
    </div>
  `,
  imports: [RouterOutlet, QuickLinks, HeadingAnchorDirective],
  host: {
    class: 'flex-1 max-w-full',
  },
})
export default class PrimitivesPage {}

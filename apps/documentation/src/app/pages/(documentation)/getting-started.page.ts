import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { QuickLinks } from '../../components/quick-links/quick-links';

@Component({
  selector: 'docs-getting-started',
  template: `
    <div class="flex gap-x-12">
      <div
        class="prose prose-sm prose-zinc dark:prose-invert flex-1 overflow-hidden px-px"
        data-page-content
      >
        <div class="mx-auto w-fit max-w-full">
          <p
            class="from-primary to-accent mb-2 inline-block bg-gradient-to-r bg-clip-text text-sm font-medium text-transparent"
          >
            Getting Started
          </p>
          <div class="max-w-3xl">
            <router-outlet />
          </div>
        </div>
      </div>
      <docs-quick-links />
    </div>
  `,
  imports: [RouterOutlet, QuickLinks],
  host: {
    class: 'flex-1 max-w-full',
  },
})
export default class GettingStartedPage {}

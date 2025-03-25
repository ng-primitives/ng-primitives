import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { QuickLinksComponent } from '../components/quick-links/quick-links.component';

@Component({
  selector: 'docs-primitives',
  template: `
    <div class="flex gap-x-12">
      <div
        class="prose prose-sm prose-zinc dark:prose-invert flex-1 overflow-hidden px-px"
        data-page-content
      >
        <p
          class="from-primary to-accent mb-2 inline-block bg-gradient-to-r bg-clip-text text-sm font-medium text-transparent"
        >
          Utilities
        </p>
        <div class="max-w-3xl">
          <router-outlet />
        </div>
      </div>
      <docs-quick-links />
    </div>
  `,
  imports: [RouterOutlet, QuickLinksComponent],
  host: {
    class: 'flex-1 overflow-hidden',
  },
})
export default class PrimitivesPage {}

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { QuickLinksComponent } from '../components/quick-links/quick-links.component';

@Component({
  selector: 'docs-interactions',
  template: `
    <div class="flex gap-x-12">
      <div
        class="prose prose-sm prose-zinc dark:prose-invert max-w-3xl flex-1 overflow-hidden px-px"
        data-page-content
      >
        <p
          class="from-primary to-accent mb-2 inline-block bg-gradient-to-r bg-clip-text text-sm font-medium text-transparent"
        >
          Interactions
        </p>

        <router-outlet />
      </div>
      <docs-quick-links />
    </div>
  `,
  imports: [RouterOutlet, QuickLinksComponent],
  host: {
    class: 'flex-1 overflow-hidden',
  },
})
export default class InteractionsPage {}

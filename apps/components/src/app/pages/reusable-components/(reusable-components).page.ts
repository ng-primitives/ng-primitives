import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { getComponentMeta } from '../../utils/router';

@Component({
  selector: 'app-reusable-components-layout',
  imports: [RouterOutlet],
  template: `
    @if (meta(); as m) {
      <header>
        <h1>
          {{ m.name }}
          @if (m.status) {
            <span class="badge" [attr.data-status]="m.status">
              {{ m.status }}
            </span>
          }
        </h1>
      </header>
    }
    <div class="content">
      <router-outlet />
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid var(--ngp-border);
    }

    h1 {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--ngp-text-primary);
    }

    .badge {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      letter-spacing: 0.025em;
    }

    .badge[data-status='beta'] {
      background-color: #fef3c7;
      color: #92400e;
    }

    .badge[data-status='new'] {
      background-color: #d1fae5;
      color: #065f46;
    }

    .badge[data-status='deprecated'] {
      background-color: #fee2e2;
      color: #991b1b;
    }

    .content {
      flex: 1;
      overflow-y: auto;
    }
  `,
})
export default class ReusableComponentsLayout {
  private readonly router = inject(Router);
  private readonly metaFiles = getComponentMeta();

  private readonly path = toSignal(
    this.router.events.pipe(map(() => this.extractPath(this.router.url))),
    { initialValue: this.extractPath(this.router.url) },
  );

  readonly meta = computed(() => {
    const componentPath = this.path();
    if (!componentPath) return undefined;

    // Find meta for this component
    for (const [filePath, meta] of Object.entries(this.metaFiles)) {
      const match = filePath.match(/reusable-components\/([^/]+)\/meta\.json$/);
      if (match && match[1] === componentPath) {
        return meta;
      }
    }
    return undefined;
  });

  private extractPath(url: string): string | undefined {
    const match = url.match(/\/reusable-components\/([^/?#]+)/);
    return match ? match[1] : undefined;
  }
}

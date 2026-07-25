import { Component } from '@angular/core';
import { PreviewCardTrigger } from './preview-card-trigger';

@Component({
  selector: 'app-preview-card-example',
  imports: [PreviewCardTrigger],
  template: `
    <p>
      Maintained by
      <a
        [appPreviewCardTrigger]="{
          title: 'Angular Primitives',
          description: 'Headless, accessible UI primitives for Angular applications.',
          meta: 'angularprimitives.com',
        }"
        href="https://angularprimitives.com"
      >
        Angular Primitives
      </a>
      and its contributors.
    </p>
  `,
  styles: `
    /* These styles rely on CSS variables that can be imported from ng-primitives/example-theme/index.css in your global styles */

    p {
      font-size: 0.875rem;
      letter-spacing: -0.006em;
      color: var(--ngp-text-secondary);
    }

    a {
      /* Never rely on colour alone to mark a link. */
      text-decoration: underline;
      text-underline-offset: 2px;
      font-weight: 510;
      color: var(--ngp-text-primary);
      border-radius: 0.25rem;
      outline: none;
    }

    a:focus-visible {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }
  `,
})
export default class App {}

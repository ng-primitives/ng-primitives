import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * Directive that adds anchor links to all headings with IDs within the host element.
 * Clicking the link icon copies the full URL with anchor to clipboard.
 */
@Directive({
  selector: '[docsHeadingAnchor]',
})
export class HeadingAnchor implements AfterViewInit {
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Add anchors to headings initially
      this.addAnchorsToHeadings();

      // Re-add anchors when navigation changes (for route transitions)
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
        // Use setTimeout to ensure content is rendered
        setTimeout(() => this.addAnchorsToHeadings(), 0);
      });
    }
  }

  private addAnchorsToHeadings(): void {
    const element = this.elementRef.nativeElement as HTMLElement;
    const headings = element.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
    const currentPath = this.router.url.split('#')[0]; // Get current path without hash

    headings.forEach(heading => {
      // Skip if anchor already exists
      if (heading.querySelector('.heading-anchor')) {
        return;
      }

      const id = heading.getAttribute('id');
      if (!id) {
        return;
      }

      // Create anchor link
      const anchor = this.renderer.createElement('a');
      this.renderer.setAttribute(anchor, 'href', `${currentPath}#${id}`);
      this.renderer.setAttribute(anchor, 'aria-label', `Link to ${heading.textContent}`);
      this.renderer.addClass(anchor, 'heading-anchor');

      // Add link icon (SVG)
      anchor.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      `;

      // Append anchor to end of heading
      this.renderer.appendChild(heading, anchor);
    });
  }
}

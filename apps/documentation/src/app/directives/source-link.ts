import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  computed,
  Directive,
  ElementRef,
  inject,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { getRouterLinks } from '../utils/router';

/**
 * Directive that adds a source code link button next to H1 headings
 * when a sourceUrl is present in the page's frontmatter.
 */
@Directive({
  selector: '[docsSourceLink]',
})
export class SourceLink implements AfterViewInit {
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly platformId = inject(PLATFORM_ID);
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

    // Strip query parameters and fragments from the route
    const routePath = route.split(/[?#]/)[0];

    // Get all router links with their metadata
    const links = getRouterLinks();

    // Find the matching route
    for (const [path, data] of Object.entries(links)) {
      const normalizedPath = path
        .replace('../pages/', '')
        .replace('.md', '')
        .replace('(documentation)/', '');

      if (routePath === `/${normalizedPath}`) {
        return data['sourceUrl'] as string | undefined;
      }
    }

    return null;
  });

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Add source link initially
      this.addSourceLinkToHeading();

      // Re-add when navigation changes
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
        setTimeout(() => this.addSourceLinkToHeading(), 0);
      });
    }
  }

  private addSourceLinkToHeading(): void {
    const url = this.sourceUrl();
    if (!url) return;

    const element = this.elementRef.nativeElement as HTMLElement;
    const h1 = element.querySelector('h1');
    if (!h1) return;

    // Skip if source link already exists
    if (h1.querySelector('.source-link')) {
      return;
    }

    // Wrap existing H1 content (including heading anchor) in a container
    const contentWrapper = this.renderer.createElement('span');
    this.renderer.setStyle(contentWrapper, 'display', 'inline-flex');
    this.renderer.setStyle(contentWrapper, 'alignItems', 'center');

    // Move all existing children into the content wrapper
    while (h1.firstChild) {
      this.renderer.appendChild(contentWrapper, h1.firstChild);
    }

    // Make H1 a flex container with space-between
    this.renderer.setStyle(h1, 'display', 'flex');
    this.renderer.setStyle(h1, 'justifyContent', 'space-between');
    this.renderer.setStyle(h1, 'alignItems', 'center');

    // Append the content wrapper back to h1
    this.renderer.appendChild(h1, contentWrapper);

    // Create wrapper span to hold the button
    const wrapper = this.renderer.createElement('span');
    this.renderer.addClass(wrapper, 'source-link');
    this.renderer.setStyle(wrapper, 'display', 'inline-flex');
    this.renderer.setStyle(wrapper, 'alignItems', 'center');

    // Create anchor link
    const anchor = this.renderer.createElement('a');
    this.renderer.setAttribute(anchor, 'href', url);
    this.renderer.setAttribute(anchor, 'target', '_blank');
    this.renderer.setAttribute(anchor, 'rel', 'noopener noreferrer');
    this.renderer.setAttribute(anchor, 'aria-label', 'View source code on GitHub');
    this.renderer.setAttribute(anchor, 'title', 'View source code');
    this.renderer.setStyle(anchor, 'display', 'inline-flex');
    this.renderer.setStyle(anchor, 'alignItems', 'center');
    this.renderer.setStyle(anchor, 'justifyContent', 'center');
    this.renderer.setStyle(anchor, 'width', '1.75rem');
    this.renderer.setStyle(anchor, 'height', '1.75rem');
    this.renderer.setStyle(anchor, 'color', 'rgb(161 161 170)'); // text-zinc-400
    this.renderer.setStyle(anchor, 'transition', 'color 200ms');

    // Add code icon SVG
    anchor.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
        <path d="M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.29l-48-40a8,8,0,0,1,0-12.29l48-40a8,8,0,0,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.29l48-40a8,8,0,0,0,0-12.29ZM162.73,32.48a8,8,0,0,0-10.25,4.79l-64,176a8,8,0,0,0,4.79,10.26A8.14,8.14,0,0,0,96,224a8,8,0,0,0,7.52-5.27l64-176A8,8,0,0,0,162.73,32.48Z"/>
      </svg>
    `;

    // Add hover effect - only change color, no background
    this.renderer.listen(anchor, 'mouseenter', () => {
      this.renderer.setStyle(anchor, 'color', 'rgb(63 63 70)'); // text-zinc-700
    });

    this.renderer.listen(anchor, 'mouseleave', () => {
      this.renderer.setStyle(anchor, 'color', 'rgb(161 161 170)'); // text-zinc-400
    });

    // Append anchor to wrapper, then wrapper to heading
    this.renderer.appendChild(wrapper, anchor);
    this.renderer.appendChild(h1, wrapper);
  }
}

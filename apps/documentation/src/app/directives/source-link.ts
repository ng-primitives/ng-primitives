import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  computed,
  Directive,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { lucideCode2 } from '@ng-icons/lucide';
import { filter, map, startWith, Subscription } from 'rxjs';
import { getRouterLinks } from '../utils/router';

/**
 * Directive that adds a source code link button next to H1 headings
 * when a sourceUrl is present in the page's frontmatter.
 */
@Directive({
  selector: '[docsSourceLink]',
})
export class SourceLink implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private routerSubscription?: Subscription;

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
      this.routerSubscription = this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          setTimeout(() => this.addSourceLinkToHeading(), 0);
        });
    }
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
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
    this.renderer.setAttribute(contentWrapper, 'class', 'inline-flex items-center');

    // Move all existing children into the content wrapper
    while (h1.firstChild) {
      this.renderer.appendChild(contentWrapper, h1.firstChild);
    }

    // Make H1 a flex container with space-between
    this.renderer.setAttribute(h1, 'class', 'flex justify-between items-center');

    // Append the content wrapper back to h1
    this.renderer.appendChild(h1, contentWrapper);

    // Create wrapper span to hold the button
    const wrapper = this.renderer.createElement('span');
    this.renderer.setAttribute(wrapper, 'class', 'source-link inline-flex items-center');

    // Create anchor link
    const anchor = this.renderer.createElement('a');
    this.renderer.setAttribute(anchor, 'href', url);
    this.renderer.setAttribute(anchor, 'target', '_blank');
    this.renderer.setAttribute(anchor, 'rel', 'noopener noreferrer');
    this.renderer.setAttribute(anchor, 'aria-label', 'View source code on GitHub');
    this.renderer.setAttribute(anchor, 'title', 'View source code');
    this.renderer.setAttribute(anchor, 'class', 'inline-flex items-center justify-center w-7 h-7 text-zinc-400 transition-colors duration-200 hover:text-zinc-700 [&>svg]:w-5 [&>svg]:h-5');

    // Add code icon from ng-icons
    this.renderer.setProperty(anchor, 'innerHTML', lucideCode2);

    // Append anchor to wrapper, then wrapper to heading
    this.renderer.appendChild(wrapper, anchor);
    this.renderer.appendChild(h1, wrapper);
  }
}

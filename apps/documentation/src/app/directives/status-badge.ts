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
import { getRouterLinks } from '../utils/router';

interface StatusConfig {
  title: string;
  message: string;
  borderClass: string;
  titleClass: string;
}

/**
 * Directive that adds a status alert below the page's H1 heading
 * based on the frontmatter metadata.
 */
@Directive({
  selector: '[docsStatusBadge]',
})
export class StatusBadge implements AfterViewInit {
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly routerLinks = getRouterLinks();

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.addStatusAlert();

      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
        setTimeout(() => this.addStatusAlert(), 0);
      });
    }
  }

  private addStatusAlert(): void {
    const element = this.elementRef.nativeElement as HTMLElement;
    const h1 = element.querySelector('h1');

    if (!h1) {
      return;
    }

    // Remove any existing status alert
    const existingAlert = element.querySelector('.status-alert');
    if (existingAlert) {
      existingAlert.remove();
    }

    // Find the status for the current page
    const status = this.getStatusForCurrentPage();
    if (!status) {
      return;
    }

    // Create the alert element
    const alert = this.createAlertElement(status);
    if (!alert) {
      return;
    }

    // Insert alert after the H1
    h1.parentNode?.insertBefore(alert, h1.nextSibling);
  }

  private createAlertElement(status: string): HTMLElement | null {
    const config = this.getStatusConfig(status);
    if (!config) {
      return null;
    }

    // Create container - clean, minimal design with left border accent
    const alert = this.renderer.createElement('div');
    alert.className = `status-alert not-prose flex items-center gap-2.5 rounded-md border-l-2 bg-zinc-50 py-2.5 pr-4 pl-3 mt-6 dark:bg-zinc-800/50 ${config.borderClass}`;

    // Create text
    const text = this.renderer.createElement('p');
    text.className = 'text-sm text-zinc-600 dark:text-zinc-400';
    text.innerHTML = `<span class="font-medium ${config.titleClass}">${config.title}:</span> ${config.message}`;

    alert.appendChild(text);

    return alert;
  }

  private getStatusForCurrentPage(): string | undefined {
    const currentPath = this.router.url.split('#')[0].split('?')[0];

    for (const [filePath, data] of Object.entries(this.routerLinks)) {
      const normalizedPath =
        '/' + filePath.replace('../pages/', '').replace('.md', '').replace('(documentation)/', '');

      if (normalizedPath === currentPath) {
        return data['status'] as string | undefined;
      }
    }

    return undefined;
  }

  private getStatusConfig(status: string): StatusConfig | null {
    switch (status) {
      case 'beta':
        return {
          title: 'Beta',
          message: 'This component is in beta and may have breaking changes in minor releases.',
          borderClass: 'border-primary',
          titleClass: 'text-primary',
        };
      case 'new':
        return {
          title: 'New',
          message: 'This component was recently added. We welcome your feedback!',
          borderClass: 'border-emerald-500',
          titleClass: 'text-emerald-600 dark:text-emerald-400',
        };
      case 'deprecated':
        return {
          title: 'Deprecated',
          message: 'This component is deprecated and will be removed in a future version.',
          borderClass: 'border-red-500',
          titleClass: 'text-red-600 dark:text-red-400',
        };
      default:
        return null;
    }
  }
}

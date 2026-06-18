import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Injector,
  OnDestroy,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { HeadingData } from 'marked-gfm-heading-id';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'docs-quick-links',
  templateUrl: './quick-links.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hidden xl:block sticky top-22 w-64 h-[calc(100vh-8rem)] overflow-y-auto',
  },
})
export class QuickLinks implements AfterViewInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);
  private readonly changeDetector = inject(ChangeDetectorRef);
  protected links = signal<HeadingData[]>([]);
  protected activeId = signal<string | null>(null);

  private scrollHandler?: () => void;
  private rafId?: number;

  constructor() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        afterNextRender(
          () => {
            this.links.set(getHeadingList());
            this.updateActiveHeading();
            this.changeDetector.detectChanges();
          },
          { injector: this.injector },
        );
      });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.links.set(getHeadingList());

      // Scroll-spy: highlight the heading currently in view. Throttle with rAF.
      this.scrollHandler = () => {
        if (this.rafId !== undefined) {
          return;
        }
        this.rafId = requestAnimationFrame(() => {
          this.rafId = undefined;
          this.updateActiveHeading();
        });
      };

      window.addEventListener('scroll', this.scrollHandler, { passive: true });
      this.updateActiveHeading();
    }
  }

  ngOnDestroy(): void {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
    if (this.rafId !== undefined) {
      cancelAnimationFrame(this.rafId);
    }
  }

  private updateActiveHeading(): void {
    const links = this.links();
    if (links.length === 0) {
      return;
    }

    // A heading becomes active once its top scrolls past this offset (just
    // below the sticky header). Pick the last heading that has crossed it.
    const offset = 140;
    let current: string | null = links[0]?.id ?? null;

    for (const link of links) {
      const el = document.getElementById(link.id);
      if (!el) {
        continue;
      }
      if (el.getBoundingClientRect().top <= offset) {
        current = link.id;
      } else {
        break;
      }
    }

    // At the very bottom of the page, activate the last heading so the final
    // section is reachable even if it is short.
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
      current = links[links.length - 1]?.id ?? current;
    }

    if (current !== this.activeId()) {
      this.activeId.set(current);
      this.changeDetector.detectChanges();
    }
  }

  scrollTo(id: string): void {
    window.scrollTo({
      top: document.getElementById(id)?.offsetTop,
      behavior: 'smooth',
    });
  }
}

function getHeadingList(): HeadingData[] {
  const content = document.querySelector('[data-page-content]');
  const headings = content?.querySelectorAll('h2, h3');

  return Array.from(headings ?? []).map(heading => {
    return {
      level: parseInt(heading.tagName.slice(1)),
      id: heading.id,
      text: heading.textContent,
    } as HeadingData;
  });
}

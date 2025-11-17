import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Injector,
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
export class QuickLinks implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);
  private readonly changeDetector = inject(ChangeDetectorRef);
  protected links = signal<HeadingData[]>([]);

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
            this.changeDetector.detectChanges();
          },
          { injector: this.injector },
        );
      });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.links.set(getHeadingList());
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

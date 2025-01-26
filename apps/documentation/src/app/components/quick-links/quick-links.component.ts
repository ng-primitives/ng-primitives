import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { HeadingData } from 'marked-gfm-heading-id';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'docs-quick-links',
  imports: [],
  templateUrl: './quick-links.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hidden lg:block',
  },
})
export class QuickLinksComponent {
  private readonly router = inject(Router);
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

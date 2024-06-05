import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { HeadingData, getHeadingList } from 'marked-gfm-heading-id';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'docs-quick-links',
  standalone: true,
  imports: [],
  templateUrl: './quick-links.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hidden lg:block',
  },
})
export class QuickLinksComponent {
  private readonly router = inject(Router);
  protected links = signal<HeadingData[]>([]);

  constructor() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.links.set(getHeadingList().filter(heading => heading.level > 1)));
  }

  scrollTo(id: string): void {
    window.scrollTo({
      top: document.getElementById(id)!.offsetTop,
      behavior: 'smooth',
    });
  }
}

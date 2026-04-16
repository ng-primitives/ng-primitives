import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';

@Component({
  selector: 'docs-api-reference-css-vars',
  templateUrl: './api-reference-css-vars.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiReferenceCssVars implements OnInit {
  private readonly el = inject(ElementRef);

  readonly resolvedData = signal<CssVarDefinition[]>([]);

  ngOnInit() {
    const children = this.el.nativeElement.querySelectorAll('api-css-var');
    const items: CssVarDefinition[] = [];

    children.forEach((child: Element) => {
      items.push({
        name: child.getAttribute('name') ?? '',
        description: child.getAttribute('description') ?? '',
      });
    });

    this.resolvedData.set(items);
  }
}

interface CssVarDefinition {
  name: string;
  description: string;
}

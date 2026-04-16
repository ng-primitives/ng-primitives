import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';

@Component({
  selector: 'docs-api-reference-attributes',
  templateUrl: './api-reference-attributes.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiReferenceAttributes implements OnInit {
  private readonly el = inject(ElementRef);

  readonly resolvedData = signal<AttributeDefinition[]>([]);

  ngOnInit() {
    const children = this.el.nativeElement.querySelectorAll('api-attribute');
    const items: AttributeDefinition[] = [];

    children.forEach((child: Element) => {
      items.push({
        attribute: child.getAttribute('name') ?? '',
        description: child.getAttribute('description') ?? '',
        value: child.getAttribute('value') ?? undefined,
      });
    });

    this.resolvedData.set(items);
  }
}

interface AttributeDefinition {
  attribute: string;
  description: string;
  value?: string;
}

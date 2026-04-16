import { ChangeDetectionStrategy, Component, ElementRef, inject, input, OnInit, signal } from '@angular/core';

@Component({
  selector: 'docs-api-reference-config',
  templateUrl: './api-reference-config.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiReferenceConfig implements OnInit {
  private readonly el = inject(ElementRef);

  readonly name = input<string>();

  readonly resolvedData = signal<ConfigPropDefinition[]>([]);

  async ngOnInit() {
    const name = this.name();

    if (name) {
      const definitions = (await import('../../api/documentation.json')) as unknown as Record<
        string,
        ConfigDefinition
      >;

      const config = definitions[name];

      if (!config) {
        throw new Error(`Config "${name}" not found in documentation.json`);
      }

      this.resolvedData.set(config.properties);
    } else {
      const children = this.el.nativeElement.querySelectorAll('api-config-prop');
      const items: ConfigPropDefinition[] = [];

      children.forEach((child: Element) => {
        items.push({
          name: child.getAttribute('name') ?? '',
          type: child.getAttribute('type') ?? '',
          description: child.getAttribute('description') ?? '',
          default: child.getAttribute('default') ?? undefined,
        });
      });

      this.resolvedData.set(items);
    }
  }
}

interface ConfigDefinition {
  name: string;
  properties: ConfigPropDefinition[];
}

interface ConfigPropDefinition {
  name: string;
  type: string;
  description: string;
  default?: string;
}

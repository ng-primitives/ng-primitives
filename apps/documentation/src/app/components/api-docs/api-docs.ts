import { ChangeDetectionStrategy, Component, input, OnInit, signal } from '@angular/core';

@Component({
  selector: 'docs-api-docs',
  templateUrl: './api-docs.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiDocs implements OnInit {
  /** The name of the directive to document. */
  readonly name = input.required<string>();

  /** The found directive definition. */
  readonly directive = signal<DirectiveDefinition | null>(null);

  async ngOnInit() {
    const definitions = (await import('../../api/documentation.json')) as unknown as Record<
      string,
      DirectiveDefinition
    >;

    const directive = definitions[this.name()];

    if (!directive) {
      throw new Error(`Directive "${this.name()}" not found in documentation.json`);
    }

    this.directive.set(directive);
  }
}

interface DirectiveDefinition {
  name: string;
  selector: string;
  description?: string;
  exportAs: string[];
  inputs?: InputDefinition[];
  outputs?: OutputDefinition[];
}

interface InputDefinition {
  name: string;
  type: string;
  description: string;
  isRequired: boolean;
  defaultValue?: string;
}

interface OutputDefinition {
  name: string;
  type: string;
  description: string;
}

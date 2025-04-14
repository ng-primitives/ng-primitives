import { Component, input, OnInit, signal } from '@angular/core';
import { PropDetails } from '../prop-details/prop-details';

@Component({
  selector: 'docs-api-docs',
  templateUrl: './api-docs.html',
  imports: [PropDetails],
})
export class ApiDocs implements OnInit {
  /** The name of the directive to document. */
  readonly name = input.required<string>();

  /** The found directive definition. */
  readonly directive = signal<DirectiveDefinition | null>(null);

  async ngOnInit() {
    const defintions = (await import('../../api/documentation.json')) as Record<
      string,
      DirectiveDefinition
    >;

    const directive = defintions[this.name()];

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

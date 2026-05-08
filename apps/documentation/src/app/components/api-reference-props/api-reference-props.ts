import { ChangeDetectionStrategy, Component, input, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretDown } from '@ng-icons/phosphor-icons/regular';

@Component({
  selector: 'docs-api-reference-props',
  templateUrl: './api-reference-props.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  providers: [provideIcons({ phosphorCaretDown })],
})
export class ApiReferenceProps implements OnInit {
  readonly name = input.required<string>();

  readonly directive = signal<DirectiveDefinition | null>(null);
  readonly expandedRows = signal<Set<string>>(new Set());

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

  toggleRow(name: string): void {
    const current = this.expandedRows();
    const next = new Set(current);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    this.expandedRows.set(next);
  }

  isExpanded(name: string): boolean {
    return this.expandedRows().has(name);
  }

  expandRow(name: string): void {
    const next = new Set(this.expandedRows());
    next.add(name);
    this.expandedRows.set(next);
  }

  outputType(type: string): string {
    return `OutputEmitterRef<${type}>`;
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

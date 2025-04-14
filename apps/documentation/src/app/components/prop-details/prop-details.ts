import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

@Component({
  selector: 'docs-prop-details',
  templateUrl: './prop-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropDetails {
  readonly name = input.required<string>();
  readonly type = input.required<string>();
  readonly default = input<string>();
  readonly required = input(false, { transform: booleanAttribute });
}

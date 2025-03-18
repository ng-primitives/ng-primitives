import { ChangeDetectionStrategy, Component, Input, booleanAttribute } from '@angular/core';

@Component({
  selector: 'docs-response-field',

  templateUrl: './response-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResponseFieldComponent {
  @Input({ required: true }) name!: string;
  @Input({ required: true }) type!: string;
  @Input() default?: string;
  @Input({ transform: booleanAttribute }) required = false;
}

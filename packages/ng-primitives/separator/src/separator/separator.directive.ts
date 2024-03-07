import { Directive, Input, booleanAttribute } from '@angular/core';

@Directive({
  selector: '[ngpSeparator]',
  standalone: true,
  host: {
    '[attr.role]': 'decorative ? "none" : "separator"',
    '[attr.aria-orientation]': '!decorative && orientation === "vertical" ? "vertical" : null',
    '[attr.data-orientation]': 'orientation',
  },
})
export class NgpSeparatorDirective {
  /**
   * The orientation of the separator.
   * @default 'horizontal'
   */
  @Input('ngpSeparatorOrientation') orientation: 'horizontal' | 'vertical' = 'horizontal';

  /**
   * Whether the separator is for decoration purposes. If true, the separator will not be included in the accessibility tree.
   * @default false
   */
  @Input({ alias: 'ngpSeparatorDecorative', transform: booleanAttribute }) decorative: boolean =
    false;
}

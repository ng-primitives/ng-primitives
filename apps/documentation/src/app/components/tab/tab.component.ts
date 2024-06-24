import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  computed,
  inject,
} from '@angular/core';
import { TabGroup } from '../tab-group/tab-group.component';

@Component({
  selector: 'docs-tab',
  standalone: true,
  templateUrl: './tab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[hidden]': '!isActive()',
  },
})
export class TabComponent {
  /**
   * Access the element ref.
   */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Access the tab group.
   */
  private readonly tabGroup = this.elementRef.nativeElement.closest<HTMLElement & TabGroup>(
    'tab-group',
  );

  /**
   * The label of the tab.
   */
  @Input({ required: true }) label!: string;

  /**
   * Determine if this tab is active.
   */
  protected readonly isActive = computed(() => this.tabGroup?.activeTab() === this);

  constructor() {
    this.tabGroup?.add(this);
  }
}

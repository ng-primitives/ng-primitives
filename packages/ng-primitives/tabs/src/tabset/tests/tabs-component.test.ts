import { NgTemplateOutlet } from '@angular/common';
import { Component, contentChildren, input, model, TemplateRef, viewChild } from '@angular/core';
import { fireEvent, render } from '@testing-library/angular';
import { NgpTabButton, NgpTabList, NgpTabPanel, NgpTabset } from 'ng-primitives/tabs';
import { describe, expect, it } from 'vitest';

/**
 * Inline fixture mirroring
 * `apps/components/src/app/pages/reusable-components/tabs/`.
 */
@Component({
  selector: 'app-tab',
  template: `
    <ng-template #content>
      <ng-content />
    </ng-template>
  `,
})
class TabFixture {
  /** The value of the tab. */
  readonly value = input<string>();

  /** The label of the tab. */
  readonly label = input<string>();

  /** The content of the tab. */
  readonly content = viewChild.required<TemplateRef<void>>('content');
}

@Component({
  selector: 'app-tabs',
  imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel, NgTemplateOutlet],
  template: `
    <div [(ngpTabsetValue)]="value" ngpTabset>
      <div ngpTabList>
        @for (tab of tabs(); track tab.label()) {
          <button [ngpTabButtonValue]="tab.value()" ngpTabButton>{{ tab.label() }}</button>
        }
      </div>

      @for (tab of tabs(); track tab.label()) {
        <div [ngpTabPanelValue]="tab.value()" ngpTabPanel>
          <ng-container [ngTemplateOutlet]="tab.content()" />
        </div>
      }
    </div>
  `,
})
class TabsFixture {
  /** The value of the selected tab. */
  readonly value = model<string>();

  /** The tabs in the group. */
  readonly tabs = contentChildren(TabFixture);
}

const imports = [TabsFixture, TabFixture];

describe('Tabs (reusable component)', () => {
  it('should render a tab per projected tab and a matching panel', async () => {
    const { getAllByRole } = await render(
      `<app-tabs>
        <app-tab value="overview" label="Overview">Overview content</app-tab>
        <app-tab value="features" label="Features">Features content</app-tab>
      </app-tabs>`,
      { imports },
    );

    expect(getAllByRole('tab')).toHaveLength(2);
  });

  it('should select the first tab by default', async () => {
    const { getByRole } = await render(
      `<app-tabs>
        <app-tab value="overview" label="Overview">Overview content</app-tab>
        <app-tab value="features" label="Features">Features content</app-tab>
      </app-tabs>`,
      { imports },
    );

    expect(getByRole('tab', { name: 'Overview' })).toHaveAttribute('data-active');
    expect(getByRole('tab', { name: 'Features' })).not.toHaveAttribute('data-active');
  });

  it('should select a tab on click', async () => {
    const { getByRole } = await render(
      `<app-tabs>
        <app-tab value="overview" label="Overview">Overview content</app-tab>
        <app-tab value="features" label="Features">Features content</app-tab>
      </app-tabs>`,
      { imports },
    );

    const features = getByRole('tab', { name: 'Features' });
    fireEvent.click(features);

    expect(features).toHaveAttribute('data-active');
    expect(features).toHaveAttribute('aria-selected', 'true');
    expect(getByRole('tab', { name: 'Overview' })).not.toHaveAttribute('data-active');
  });

  it('should reflect the two-way bound value from the host', async () => {
    const { getByRole, detectChanges } = await render(
      `<app-tabs [(value)]="selected">
        <app-tab value="overview" label="Overview">Overview content</app-tab>
        <app-tab value="features" label="Features">Features content</app-tab>
      </app-tabs>`,
      { imports, componentProperties: { selected: 'features' } },
    );
    detectChanges();

    expect(getByRole('tab', { name: 'Features' })).toHaveAttribute('data-active');
    expect(getByRole('tab', { name: 'Overview' })).not.toHaveAttribute('data-active');
  });

  it('should show only the active panel content', async () => {
    const { getByRole, container } = await render(
      `<app-tabs>
        <app-tab value="overview" label="Overview">Overview content</app-tab>
        <app-tab value="features" label="Features">Features content</app-tab>
      </app-tabs>`,
      { imports },
    );

    const activePanel = getByRole('tabpanel', { name: 'Overview' });
    const panels = Array.from(container.querySelectorAll('[ngpTabPanel]')) as HTMLElement[];
    const hiddenPanel = panels.find(panel => panel !== activePanel)!;

    expect(activePanel).toHaveAttribute('data-active');
    expect(hiddenPanel).not.toHaveAttribute('data-active');
    expect(hiddenPanel).toHaveAttribute('aria-hidden', 'true');
  });

  it('should navigate tabs with the arrow keys', async () => {
    const { getByRole } = await render(
      `<app-tabs>
        <app-tab value="overview" label="Overview">Overview content</app-tab>
        <app-tab value="features" label="Features">Features content</app-tab>
        <app-tab value="docs" label="Docs">Docs content</app-tab>
      </app-tabs>`,
      { imports },
    );

    const overview = getByRole('tab', { name: 'Overview' });
    const features = getByRole('tab', { name: 'Features' });

    overview.focus();
    fireEvent.keyDown(overview, { key: 'ArrowRight' });

    expect(features).toHaveFocus();
    expect(features).toHaveAttribute('data-active');
  });

  it('should wire aria-controls/aria-labelledby between tab and panel', async () => {
    const { getByRole } = await render(
      `<app-tabs>
        <app-tab value="overview" label="Overview">Overview content</app-tab>
        <app-tab value="features" label="Features">Features content</app-tab>
      </app-tabs>`,
      { imports },
    );

    const tab = getByRole('tab', { name: 'Overview' });
    const panel = getByRole('tabpanel', { name: 'Overview' });

    expect(tab.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
  });
});

import { fireEvent, render } from '@testing-library/angular';
import { NgpTabButton, NgpTabList, NgpTabPanel, NgpTabset } from 'ng-primitives/tabs';

describe('NgpTabset', () => {
  it('should default to horizontal orientation', async () => {
    const { getByRole } = await render(
      `
      <div ngpTabset>
        <div ngpTabList>
          <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
          <button ngpTabButton ngpTabButtonValue="features">Features</button>
        </div>
        <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
        <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
      </div>
    `,
      {
        imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
      },
    );

    const tabset = getByRole('tablist');
    expect(tabset).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('should set the orientation to vertical', async () => {
    const { getByRole } = await render(
      `
      <div ngpTabset ngpTabsetOrientation="vertical">
        <div ngpTabList>
          <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
          <button ngpTabButton ngpTabButtonValue="features">Features</button>
        </div>
        <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
        <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
      </div>
    `,
      {
        imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
      },
    );

    const tabset = getByRole('tablist');
    expect(tabset).toHaveAttribute('data-orientation', 'vertical');
  });

  it('should select the first tab by default', async () => {
    const { getByRole } = await render(
      `
      <div ngpTabset>
        <div ngpTabList>
          <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
          <button ngpTabButton ngpTabButtonValue="features">Features</button>
        </div>
        <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
        <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
      </div>
    `,
      {
        imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
      },
    );

    const tab = getByRole('tab', { name: 'Overview' });
    expect(tab).toHaveAttribute('data-active');
  });

  it('should set the selected tab based on the value input', async () => {
    const { getByRole } = await render(
      `
      <div ngpTabset ngpTabsetValue="features">
        <div ngpTabList>
          <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
          <button ngpTabButton ngpTabButtonValue="features">Features</button>
        </div>
        <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
        <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
      </div>
    `,
      {
        imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
      },
    );

    const tab = getByRole('tab', { name: 'Features' });
    expect(tab).toHaveAttribute('data-active');
  });

  it('should emit the valueChange event when the selected tab changes', async () => {
    const valueChange = jest.fn();
    const { getByRole } = await render(
      `
      <div ngpTabset (ngpTabsetValueChange)="valueChange($event)">
        <div ngpTabList>
          <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
          <button ngpTabButton ngpTabButtonValue="features">Features</button>
        </div>
        <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
        <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
      </div>
    `,
      {
        imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
        componentProperties: {
          valueChange,
        },
      },
    );

    const tab = getByRole('tab', { name: 'Features' });
    tab.click();

    expect(valueChange).toHaveBeenCalledWith('features');
    expect(valueChange).toHaveBeenCalledTimes(1);
  });

  it('should select the tab button when value is set but there are no tab panels', async () => {
    const { getByRole } = await render(
      `
      <div ngpTabset ngpTabsetValue="features">
        <div ngpTabList>
          <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
          <button ngpTabButton ngpTabButtonValue="features">Features</button>
        </div>
      </div>
    `,
      {
        imports: [NgpTabset, NgpTabButton, NgpTabList],
      },
    );

    const tab = getByRole('tab', { name: 'Features' });
    expect(tab).toHaveAttribute('data-active');
  });

  it('should not emit valueChange if the selected tab is clicked again', async () => {
    const valueChange = jest.fn();
    const { getByRole } = await render(
      `
      <div ngpTabset ngpTabsetValue="overview" (ngpTabsetValueChange)="valueChange($event)">
        <div ngpTabList>
          <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
          <button ngpTabButton ngpTabButtonValue="features">Features</button>
        </div>
        <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
        <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
      </div>
    `,
      {
        imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
        componentProperties: {
          valueChange,
        },
      },
    );

    const tab = getByRole('tab', { name: 'Overview' });
    tab.click();

    expect(valueChange).not.toHaveBeenCalled();
  });

  it('should update orientation dynamically', async () => {
    const { getByRole, rerender, detectChanges } = await render(
      `
      <div ngpTabset [ngpTabsetOrientation]="orientation">
        <div ngpTabList>
          <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
          <button ngpTabButton ngpTabButtonValue="features">Features</button>
        </div>
        <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
        <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
      </div>
    `,
      {
        imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
        componentProperties: {
          orientation: 'horizontal',
        },
      },
    );

    const tabset = getByRole('tablist');
    expect(tabset).toHaveAttribute('data-orientation', 'horizontal');

    await rerender({
      componentProperties: {
        orientation: 'vertical',
      },
    });
    detectChanges();

    expect(tabset).toHaveAttribute('data-orientation', 'vertical');
  });

  it('should not allow interaction when disabled', async () => {
    const { getByRole } = await render(
      `
      <div ngpTabset>
        <div ngpTabList>
          <button ngpTabButton ngpTabButtonDisabled="true" ngpTabButtonValue="overview">Overview</button>
          <button ngpTabButton ngpTabButtonValue="features">Features</button>
        </div>
        <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
        <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
      </div>
    `,
      {
        imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
      },
    );

    const tab = getByRole('tab', { name: 'Overview' });
    expect(tab).toBeDisabled();
    expect(tab).toHaveAttribute('data-disabled');
    expect(tab).not.toHaveAttribute('data-active');

    fireEvent.click(tab);
    expect(tab).toBeDisabled();
    expect(tab).not.toHaveAttribute('data-active');
  });

  it('should keep outer and inner tabsets state independent', async () => {
    const { fixture, getByRole } = await render(
      `
      <div ngpTabset>
        <div ngpTabList>
          <button ngpTabButton ngpTabButtonValue="outer-1">Outer 1</button>
          <button ngpTabButton ngpTabButtonValue="outer-2">Outer 2</button>
        </div>
        <div ngpTabPanel ngpTabPanelValue="outer-1">
          <div ngpTabset>
            <div ngpTabList>
              <button ngpTabButton ngpTabButtonValue="inner-1">Inner 1</button>
              <button ngpTabButton ngpTabButtonValue="inner-2">Inner 2</button>
            </div>
            <div ngpTabPanel ngpTabPanelValue="inner-1">Inner 1 content</div>
            <div ngpTabPanel ngpTabPanelValue="inner-2">Inner 2 content</div>
          </div>
        </div>
        <div ngpTabPanel ngpTabPanelValue="outer-2">Outer 2 content</div>
      </div>
    `,
      {
        imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
      },
    );

    const outerFirst = getByRole('tab', { name: 'Outer 1' });
    const outerSecond = getByRole('tab', { name: 'Outer 2' });
    const innerFirst = getByRole('tab', { name: 'Inner 1' });
    const innerSecond = getByRole('tab', { name: 'Inner 2' });

    expect(outerFirst).toHaveAttribute('data-active');
    expect(outerSecond).not.toHaveAttribute('data-active');
    expect(innerFirst).toHaveAttribute('data-active');
    expect(innerSecond).not.toHaveAttribute('data-active');

    innerSecond.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(innerSecond).toHaveAttribute('data-active');
    expect(innerFirst).not.toHaveAttribute('data-active');
    expect(outerFirst).toHaveAttribute('data-active');
    expect(outerSecond).not.toHaveAttribute('data-active');

    outerSecond.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(outerSecond).toHaveAttribute('data-active');
    expect(outerFirst).not.toHaveAttribute('data-active');
    expect(innerSecond).toHaveAttribute('data-active');
    expect(innerFirst).not.toHaveAttribute('data-active');
  });

  describe('Keyboard Navigation', () => {
    it('should navigate tabs with arrow keys in horizontal orientation', async () => {
      const { getByRole } = await render(
        `
        <div ngpTabset>
          <div ngpTabList>
            <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
            <button ngpTabButton ngpTabButtonValue="features">Features</button>
            <button ngpTabButton ngpTabButtonValue="docs">Docs</button>
          </div>
          <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
          <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
          <div ngpTabPanel ngpTabPanelValue="docs">Docs content</div>
        </div>
      `,
        {
          imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
        },
      );

      const overviewTab = getByRole('tab', { name: 'Overview' });
      const featuresTab = getByRole('tab', { name: 'Features' });
      const docsTab = getByRole('tab', { name: 'Docs' });

      overviewTab.focus();
      expect(overviewTab).toHaveAttribute('data-active');

      fireEvent.keyDown(overviewTab, { key: 'ArrowRight' });
      expect(featuresTab).toHaveFocus();
      expect(featuresTab).toHaveAttribute('data-active');

      fireEvent.keyDown(featuresTab, { key: 'ArrowRight' });
      expect(docsTab).toHaveFocus();
      expect(docsTab).toHaveAttribute('data-active');

      fireEvent.keyDown(docsTab, { key: 'ArrowLeft' });
      expect(featuresTab).toHaveFocus();
      expect(featuresTab).toHaveAttribute('data-active');
    });

    it('should navigate tabs with arrow keys in vertical orientation', async () => {
      const { getByRole } = await render(
        `
        <div ngpTabset ngpTabsetOrientation="vertical">
          <div ngpTabList>
            <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
            <button ngpTabButton ngpTabButtonValue="features">Features</button>
            <button ngpTabButton ngpTabButtonValue="docs">Docs</button>
          </div>
          <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
          <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
          <div ngpTabPanel ngpTabPanelValue="docs">Docs content</div>
        </div>
      `,
        {
          imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
        },
      );

      const overviewTab = getByRole('tab', { name: 'Overview' });
      const featuresTab = getByRole('tab', { name: 'Features' });
      const docsTab = getByRole('tab', { name: 'Docs' });

      overviewTab.focus();
      expect(overviewTab).toHaveAttribute('data-active');

      fireEvent.keyDown(overviewTab, { key: 'ArrowDown' });
      expect(featuresTab).toHaveFocus();
      expect(featuresTab).toHaveAttribute('data-active');

      fireEvent.keyDown(featuresTab, { key: 'ArrowDown' });
      expect(docsTab).toHaveFocus();
      expect(docsTab).toHaveAttribute('data-active');

      fireEvent.keyDown(docsTab, { key: 'ArrowUp' });
      expect(featuresTab).toHaveFocus();
      expect(featuresTab).toHaveAttribute('data-active');
    });

    it('should navigate to first and last tab with Home and End keys', async () => {
      const { getByRole } = await render(
        `
        <div ngpTabset ngpTabsetValue="features">
          <div ngpTabList>
            <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
            <button ngpTabButton ngpTabButtonValue="features">Features</button>
            <button ngpTabButton ngpTabButtonValue="docs">Docs</button>
          </div>
          <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
          <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
          <div ngpTabPanel ngpTabPanelValue="docs">Docs content</div>
        </div>
      `,
        {
          imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
        },
      );

      const overviewTab = getByRole('tab', { name: 'Overview' });
      const featuresTab = getByRole('tab', { name: 'Features' });
      const docsTab = getByRole('tab', { name: 'Docs' });

      featuresTab.focus();
      expect(featuresTab).toHaveAttribute('data-active');

      fireEvent.keyDown(featuresTab, { key: 'Home' });
      expect(overviewTab).toHaveFocus();
      expect(overviewTab).toHaveAttribute('data-active');

      fireEvent.keyDown(overviewTab, { key: 'End' });
      expect(docsTab).toHaveFocus();
      expect(docsTab).toHaveAttribute('data-active');
    });

    it('should skip disabled tabs during keyboard navigation', async () => {
      const { getByRole } = await render(
        `
        <div ngpTabset>
          <div ngpTabList>
            <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
            <button ngpTabButton ngpTabButtonDisabled="true" ngpTabButtonValue="features">Features</button>
            <button ngpTabButton ngpTabButtonValue="docs">Docs</button>
          </div>
          <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
          <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
          <div ngpTabPanel ngpTabPanelValue="docs">Docs content</div>
        </div>
      `,
        {
          imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
        },
      );

      const overviewTab = getByRole('tab', { name: 'Overview' });
      const docsTab = getByRole('tab', { name: 'Docs' });

      overviewTab.focus();
      expect(overviewTab).toHaveAttribute('data-active');

      fireEvent.keyDown(overviewTab, { key: 'ArrowRight' });
      expect(docsTab).toHaveFocus();
      expect(docsTab).toHaveAttribute('data-active');
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes for tablist', async () => {
      const { getByRole } = await render(
        `
        <div ngpTabset>
          <div ngpTabList>
            <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
            <button ngpTabButton ngpTabButtonValue="features">Features</button>
          </div>
          <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
          <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
        </div>
      `,
        {
          imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
        },
      );

      const tablist = getByRole('tablist');
      expect(tablist).toHaveAttribute('role', 'tablist');
      expect(tablist).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('should have correct ARIA attributes for tabs', async () => {
      const { getByRole } = await render(
        `
        <div ngpTabset>
          <div ngpTabList>
            <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
            <button ngpTabButton ngpTabButtonValue="features">Features</button>
          </div>
          <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
          <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
        </div>
      `,
        {
          imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
        },
      );

      const overviewTab = getByRole('tab', { name: 'Overview' });
      const featuresTab = getByRole('tab', { name: 'Features' });

      expect(overviewTab).toHaveAttribute('role', 'tab');
      expect(overviewTab).toHaveAttribute('aria-selected', 'true');
      expect(overviewTab).toHaveAttribute('data-active');
      expect(overviewTab).toHaveAttribute('tabindex', '0');

      expect(featuresTab).toHaveAttribute('role', 'tab');
      expect(featuresTab).toHaveAttribute('aria-selected', 'false');
      expect(featuresTab).not.toHaveAttribute('data-active');
      expect(featuresTab).toHaveAttribute('tabindex', '-1');
    });

    it('should have correct ARIA attributes for tab panels', async () => {
      const { getByRole, container } = await render(
        `
        <div ngpTabset>
          <div ngpTabList>
            <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
            <button ngpTabButton ngpTabButtonValue="features">Features</button>
          </div>
          <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
          <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
        </div>
      `,
        {
          imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
        },
      );

      const overviewPanel = getByRole('tabpanel', { name: 'Overview' });
      // Features panel is hidden with aria-hidden, so we need to find it by attribute
      const featuresPanel = container.querySelector('[ngpTabPanelValue="features"]') as HTMLElement;

      // Active panel should be focusable and accessible to screen readers
      expect(overviewPanel).toHaveAttribute('role', 'tabpanel');
      expect(overviewPanel).toHaveAttribute('data-active');
      expect(overviewPanel).toHaveAttribute('tabindex', '0');
      expect(overviewPanel).not.toHaveAttribute('aria-hidden');
      expect(overviewPanel).toBeVisible();

      // Inactive panel should be hidden from screen readers and not focusable
      expect(featuresPanel).toHaveAttribute('role', 'tabpanel');
      expect(featuresPanel).not.toHaveAttribute('data-active');
      expect(featuresPanel).not.toHaveAttribute('tabindex');
      expect(featuresPanel).toHaveAttribute('aria-hidden', 'true');
      expect(featuresPanel).toBeVisible(); // Still visible (CSS controls visual hiding)
    });

    it('should update aria-selected and data-active when tab selection changes', async () => {
      const { getByRole } = await render(
        `
        <div ngpTabset>
          <div ngpTabList>
            <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
            <button ngpTabButton ngpTabButtonValue="features">Features</button>
          </div>
          <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
          <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
        </div>
      `,
        {
          imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
        },
      );

      const overviewTab = getByRole('tab', { name: 'Overview' });
      const featuresTab = getByRole('tab', { name: 'Features' });

      expect(overviewTab).toHaveAttribute('aria-selected', 'true');
      expect(overviewTab).toHaveAttribute('data-active');
      expect(featuresTab).toHaveAttribute('aria-selected', 'false');
      expect(featuresTab).not.toHaveAttribute('data-active');

      featuresTab.click();

      expect(overviewTab).toHaveAttribute('aria-selected', 'false');
      expect(overviewTab).not.toHaveAttribute('data-active');
      expect(featuresTab).toHaveAttribute('aria-selected', 'true');
      expect(featuresTab).toHaveAttribute('data-active');
    });

    it('should update tabpanel tabindex and aria-hidden when switching tabs', async () => {
      const { getByRole, container } = await render(
        `
        <div ngpTabset>
          <div ngpTabList>
            <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
            <button ngpTabButton ngpTabButtonValue="features">Features</button>
          </div>
          <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
          <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
        </div>
      `,
        {
          imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
        },
      );

      const featuresTab = getByRole('tab', { name: 'Features' });
      const overviewPanel = getByRole('tabpanel', { name: 'Overview' });
      // Features panel is initially hidden, so we query by attribute
      const featuresPanel = container.querySelector('[ngpTabPanelValue="features"]') as HTMLElement;

      // Initial state: overview active, features inactive
      expect(overviewPanel).toHaveAttribute('tabindex', '0');
      expect(overviewPanel).not.toHaveAttribute('aria-hidden');
      expect(featuresPanel).not.toHaveAttribute('tabindex');
      expect(featuresPanel).toHaveAttribute('aria-hidden', 'true');

      // Switch to features tab
      featuresTab.click();

      // After switch: features active, overview inactive
      // Now overview panel should be hidden and features should be accessible
      const overviewPanelAfter = container.querySelector(
        '[ngpTabPanelValue="overview"]',
      ) as HTMLElement;
      const featuresPanelAfter = getByRole('tabpanel', { name: 'Features' });

      expect(overviewPanelAfter).not.toHaveAttribute('tabindex');
      expect(overviewPanelAfter).toHaveAttribute('aria-hidden', 'true');
      expect(featuresPanelAfter).toHaveAttribute('tabindex', '0');
      expect(featuresPanelAfter).not.toHaveAttribute('aria-hidden');
    });

    it('should set aria-selected=false on disabled tabs', async () => {
      const { getByRole } = await render(
        `
        <div ngpTabset>
          <div ngpTabList>
            <button ngpTabButton ngpTabButtonDisabled="true" ngpTabButtonValue="overview">Overview</button>
            <button ngpTabButton ngpTabButtonValue="features">Features</button>
          </div>
          <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
          <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
        </div>
      `,
        {
          imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
        },
      );

      const overviewTab = getByRole('tab', { name: 'Overview' });
      const featuresTab = getByRole('tab', { name: 'Features' });

      // Disabled tab should not be active, so should have false aria-selected
      expect(overviewTab).toBeDisabled();
      expect(overviewTab).toHaveAttribute('aria-selected', 'false');
      expect(overviewTab).not.toHaveAttribute('data-active');

      // Second tab should be active since first is disabled
      expect(featuresTab).toHaveAttribute('aria-selected', 'true');
      expect(featuresTab).toHaveAttribute('data-active');
    });
  });

  describe('ActivateOnFocus Configuration', () => {
    it('should activate tab on focus when activateOnFocus is true (default)', async () => {
      const { getByRole, fixture } = await render(
        `
        <div ngpTabset>
          <div ngpTabList>
            <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
            <button ngpTabButton ngpTabButtonValue="features">Features</button>
          </div>
          <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
          <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
        </div>
      `,
        {
          imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
        },
      );

      const overviewTab = getByRole('tab', { name: 'Overview' });
      const featuresTab = getByRole('tab', { name: 'Features' });

      expect(overviewTab).toHaveAttribute('data-active');
      expect(featuresTab).not.toHaveAttribute('data-active');

      fireEvent.focus(featuresTab);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(featuresTab).toHaveAttribute('data-active');
      expect(overviewTab).not.toHaveAttribute('data-active');
    });

    it('should not activate tab on focus when activateOnFocus is false', async () => {
      const { getByRole } = await render(
        `
        <div ngpTabset ngpTabsetActivateOnFocus="false">
          <div ngpTabList>
            <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
            <button ngpTabButton ngpTabButtonValue="features">Features</button>
          </div>
          <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
          <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
        </div>
      `,
        {
          imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
        },
      );

      const overviewTab = getByRole('tab', { name: 'Overview' });
      const featuresTab = getByRole('tab', { name: 'Features' });

      expect(overviewTab).toHaveAttribute('data-active');
      expect(featuresTab).not.toHaveAttribute('data-active');

      featuresTab.focus();
      expect(overviewTab).toHaveAttribute('data-active');
      expect(featuresTab).not.toHaveAttribute('data-active');

      // Should still activate on click
      featuresTab.click();
      expect(featuresTab).toHaveAttribute('data-active');
      expect(overviewTab).not.toHaveAttribute('data-active');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tab list gracefully', async () => {
      const { container } = await render(
        `
        <div ngpTabset>
          <div ngpTabList>
          </div>
        </div>
      `,
        {
          imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
        },
      );

      expect(container.querySelector('[ngpTabList]')).toBeInTheDocument();
    });

    it('should handle invalid initial value', async () => {
      const { getByRole } = await render(
        `
        <div ngpTabset ngpTabsetValue="nonexistent">
          <div ngpTabList>
            <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
            <button ngpTabButton ngpTabButtonValue="features">Features</button>
          </div>
          <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
          <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
        </div>
      `,
        {
          imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
        },
      );

      const overviewTab = getByRole('tab', { name: 'Overview' });
      const featuresTab = getByRole('tab', { name: 'Features' });

      // Should default to first tab when invalid value provided
      expect(overviewTab).toHaveAttribute('data-active');
      expect(featuresTab).not.toHaveAttribute('data-active');
    });

    it('should handle duplicate tab values', async () => {
      const valueChange = jest.fn();
      const { getAllByRole } = await render(
        `
        <div ngpTabset (ngpTabsetValueChange)="valueChange($event)">
          <div ngpTabList>
            <button ngpTabButton ngpTabButtonValue="same">Tab 1</button>
            <button ngpTabButton ngpTabButtonValue="same">Tab 2</button>
          </div>
          <div ngpTabPanel ngpTabPanelValue="same">Content</div>
        </div>
      `,
        {
          imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
          componentProperties: { valueChange },
        },
      );

      const tabs = getAllByRole('tab');

      // Both tabs should be marked as active due to same value
      expect(tabs[0]).toHaveAttribute('data-active');
      expect(tabs[1]).toHaveAttribute('data-active');

      tabs[1].click();
      expect(valueChange).toHaveBeenCalledWith('same');
    });
  });

  describe('Public API Methods', () => {
    it('should allow programmatic tab selection via click simulation', async () => {
      const valueChange = jest.fn();
      const { getByRole } = await render(
        `
        <div ngpTabset (ngpTabsetValueChange)="valueChange($event)">
          <div ngpTabList>
            <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
            <button ngpTabButton ngpTabButtonValue="features">Features</button>
          </div>
          <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
          <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
        </div>
      `,
        {
          imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
          componentProperties: { valueChange },
        },
      );

      const overviewTab = getByRole('tab', { name: 'Overview' });
      const featuresTab = getByRole('tab', { name: 'Features' });

      expect(overviewTab).toHaveAttribute('data-active');
      expect(featuresTab).not.toHaveAttribute('data-active');

      // Programmatically select by simulating click
      featuresTab.click();

      expect(overviewTab).not.toHaveAttribute('data-active');
      expect(featuresTab).toHaveAttribute('data-active');
      expect(valueChange).toHaveBeenCalledWith('features');
    });

    it('should maintain correct active state attributes', async () => {
      const { getByRole, container } = await render(
        `
        <div ngpTabset>
          <div ngpTabList>
            <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
            <button ngpTabButton ngpTabButtonValue="features">Features</button>
          </div>
          <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
          <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
        </div>
      `,
        {
          imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
        },
      );

      const overviewTab = getByRole('tab', { name: 'Overview' });
      const featuresTab = getByRole('tab', { name: 'Features' });
      const overviewPanel = getByRole('tabpanel', { name: 'Overview' });
      // Features panel is initially hidden, so we query by attribute
      const featuresPanel = container.querySelector('[ngpTabPanelValue="features"]') as HTMLElement;

      // Initial state
      expect(overviewTab).toHaveAttribute('data-active');
      expect(overviewPanel).toHaveAttribute('data-active');
      expect(featuresTab).not.toHaveAttribute('data-active');
      expect(featuresPanel).not.toHaveAttribute('data-active');

      // After clicking features tab
      featuresTab.click();

      // After switch: now features panel should be accessible and overview hidden
      const overviewPanelAfter = container.querySelector(
        '[ngpTabPanelValue="overview"]',
      ) as HTMLElement;
      const featuresPanelAfter = getByRole('tabpanel', { name: 'Features' });

      expect(overviewTab).not.toHaveAttribute('data-active');
      expect(overviewPanelAfter).not.toHaveAttribute('data-active');
      expect(featuresTab).toHaveAttribute('data-active');
      expect(featuresPanelAfter).toHaveAttribute('data-active');
    });
  });
});

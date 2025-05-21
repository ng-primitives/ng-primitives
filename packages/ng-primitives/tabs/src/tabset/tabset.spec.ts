import { render } from '@testing-library/angular';
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
    const { getByRole, rerender } = await render(
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

    rerender({
      componentProperties: {
        orientation: 'vertical',
      },
    });

    expect(tabset).toHaveAttribute('data-orientation', 'vertical');
  });
});

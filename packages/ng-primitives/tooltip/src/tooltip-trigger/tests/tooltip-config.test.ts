import { Component } from '@angular/core';
import { render } from '@testing-library/angular';
import { provideTooltipConfig } from 'ng-primitives/tooltip';
import { describe, expect, it } from 'vitest';
import { injectTooltipConfig } from '../../config/tooltip-config';

@Component({
  template: '',
})
class TooltipConfigProbe {
  readonly config = injectTooltipConfig();
}

describe('tooltip-config', () => {
  it('should include interactive tooltip defaults', async () => {
    const { fixture } = await render(TooltipConfigProbe);

    expect(fixture.componentInstance.config.hoverableContent).toBe(false);
  });

  it('should merge interactive tooltip values from provider config', async () => {
    const { fixture } = await render(TooltipConfigProbe, {
      providers: [
        provideTooltipConfig({
          hoverableContent: true,
        }),
      ],
    });

    expect(fixture.componentInstance.config.hoverableContent).toBe(true);
  });
});

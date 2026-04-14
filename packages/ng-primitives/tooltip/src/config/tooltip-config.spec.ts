import { TestBed } from '@angular/core/testing';
import { injectTooltipConfig, provideTooltipConfig } from './tooltip-config';

describe('tooltip-config', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should include interactive tooltip defaults', () => {
    const config = TestBed.runInInjectionContext(() => injectTooltipConfig());

    expect(config.hoverableContent).toBe(false);
  });

  it('should merge interactive tooltip values from provider config', () => {
    TestBed.configureTestingModule({
      providers: [
        provideTooltipConfig({
          hoverableContent: true,
        }),
      ],
    });

    const config = TestBed.runInInjectionContext(() => injectTooltipConfig());

    expect(config.hoverableContent).toBe(true);
  });
});

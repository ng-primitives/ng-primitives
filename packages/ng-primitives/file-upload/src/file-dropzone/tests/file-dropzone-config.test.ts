import { Component } from '@angular/core';
import { render } from '@testing-library/angular';
import { provideFileDropzoneConfig } from 'ng-primitives/file-upload';
import { describe, expect, it } from 'vitest';
import { injectFileDropzoneConfig } from '../../config/file-dropzone-config';
import { NgpFileDropzone } from '../file-dropzone';

@Component({ template: '' })
class FileDropzoneConfigProbe {
  readonly config = injectFileDropzoneConfig();
}

describe('file-dropzone-config', () => {
  it('should fall back to the default config', async () => {
    const { fixture } = await render(FileDropzoneConfigProbe);

    expect(fixture.componentInstance.config).toEqual({
      fileTypes: undefined,
      multiple: false,
      directory: false,
      disabled: false,
    });
  });

  it('should merge a partial config with the defaults', async () => {
    const { fixture } = await render(FileDropzoneConfigProbe, {
      providers: [provideFileDropzoneConfig({ multiple: true })],
    });

    expect(fixture.componentInstance.config.multiple).toBe(true);
    expect(fixture.componentInstance.config.disabled).toBe(false);
  });

  it('should use the configured defaults in the primitive', async () => {
    const { getByTestId } = await render(`<div ngpFileDropzone data-testid="dropzone">Drop</div>`, {
      imports: [NgpFileDropzone],
      providers: [provideFileDropzoneConfig({ disabled: true })],
    });

    expect(getByTestId('dropzone')).toHaveAttribute('data-disabled', '');
  });

  it('should let explicit inputs override the configured defaults', async () => {
    const { getByTestId } = await render(
      `<div ngpFileDropzone [ngpFileDropzoneDisabled]="false" data-testid="dropzone">Drop</div>`,
      {
        imports: [NgpFileDropzone],
        providers: [provideFileDropzoneConfig({ disabled: true })],
      },
    );

    expect(getByTestId('dropzone')).not.toHaveAttribute('data-disabled');
  });
});

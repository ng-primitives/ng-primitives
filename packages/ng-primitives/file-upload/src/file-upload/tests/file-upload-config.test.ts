import { Component } from '@angular/core';
import { render } from '@testing-library/angular';
import { provideFileUploadConfig } from 'ng-primitives/file-upload';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { injectFileUploadConfig } from '../../config/file-upload-config';
import { NgpFileUpload } from '../file-upload';

@Component({ template: '' })
class FileUploadConfigProbe {
  readonly config = injectFileUploadConfig();
}

describe('file-upload-config', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fall back to the default config', async () => {
    const { fixture } = await render(FileUploadConfigProbe);

    expect(fixture.componentInstance.config).toEqual({
      fileTypes: undefined,
      multiple: false,
      directory: false,
      dragAndDrop: true,
      disabled: false,
    });
  });

  it('should merge a partial config with the defaults', async () => {
    const { fixture } = await render(FileUploadConfigProbe, {
      providers: [provideFileUploadConfig({ dragAndDrop: false })],
    });

    expect(fixture.componentInstance.config.dragAndDrop).toBe(false);
    expect(fixture.componentInstance.config.multiple).toBe(false);
  });

  it('should use the configured defaults in the primitive', async () => {
    const { getByTestId } = await render(`<div ngpFileUpload data-testid="upload">Upload</div>`, {
      imports: [NgpFileUpload],
      providers: [provideFileUploadConfig({ disabled: true })],
    });

    expect(getByTestId('upload')).toHaveAttribute('data-disabled', '');
  });

  it('should let explicit inputs override the configured defaults', async () => {
    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(() => undefined);

    const { getByTestId } = await render(
      `<div ngpFileUpload ngpFileUploadFileTypes=".png" data-testid="upload">Upload</div>`,
      {
        imports: [NgpFileUpload],
        providers: [provideFileUploadConfig({ fileTypes: ['.jpg'], multiple: true })],
      },
    );

    getByTestId('upload').click();

    const input = clickSpy.mock.instances[0] as unknown as HTMLInputElement;
    expect(input.accept).toBe('.png');
    expect(input.multiple).toBe(true);
  });
});

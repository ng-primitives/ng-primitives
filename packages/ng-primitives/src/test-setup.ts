import '@testing-library/jest-dom';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

// patch the getAnimations function to return an empty array
// as this doesn't work in Jest environment - and we don't need animations for tests
Element.prototype.getAnimations = () => [];

// patch ResizeObserver to avoid errors in tests
global.ResizeObserver = class {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  observe() {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  unobserve() {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect() {}
};

// patch scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// patch DataTransfer for drag and drop tests
class MockDataTransferItemList extends Array {
  add(data: string, type: string): DataTransferItem | null;
  add(file: File): DataTransferItem | null;
  add(dataOrFile: string | File, type?: string): DataTransferItem | null {
    const item = {
      kind: typeof dataOrFile === 'string' ? 'string' : 'file',
      type: typeof dataOrFile === 'string' ? type || 'text/plain' : dataOrFile.type,
      getAsFile: () => (typeof dataOrFile === 'string' ? null : dataOrFile),
      getAsString: (callback: (data: string) => void) => {
        if (typeof dataOrFile === 'string') {
          callback(dataOrFile);
        }
      },
    } as DataTransferItem;

    this.push(item);
    return item;
  }

  remove(index: number): void {
    this.splice(index, 1);
  }

  clear(): void {
    this.length = 0;
  }
}

global.DataTransfer = class {
  data: Record<string, string> = {};
  files: FileList = [] as unknown as FileList;
  items: DataTransferItemList = new MockDataTransferItemList() as unknown as DataTransferItemList;
  types: readonly string[] = [];
  dropEffect: 'none' | 'copy' | 'link' | 'move' = 'none';
  effectAllowed:
    | 'none'
    | 'copy'
    | 'copyLink'
    | 'copyMove'
    | 'link'
    | 'linkMove'
    | 'move'
    | 'all'
    | 'uninitialized' = 'uninitialized';

  clearData(): void {
    this.data = {};
  }

  getData(format: string): string {
    return this.data[format] || '';
  }

  setData(format: string, data: string): void {
    this.data[format] = data;
  }

  setDragImage(): void {
    // no-op
  }
};

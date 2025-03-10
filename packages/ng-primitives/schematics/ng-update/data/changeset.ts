export enum NgpTargetVersion {
  V0_24_0 = 'version 0.24.0',
}

export type NgpVersionChanges<T> = {
  [target in NgpTargetVersion]?: ReadableChange<T>[];
};

export type ReadableChange<T> = {
  pr: string;
  changes: T[];
};

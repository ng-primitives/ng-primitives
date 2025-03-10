import { NgpTargetVersion, NgpVersionChanges } from './changeset';

export interface CssSelectorData {
  /** The CSS selector to replace. */
  replace: string;
  /** The new CSS selector. */
  replaceWith: string;
  /**
   * Controls which file types in which this replacement is made. If omitted, it is made in all
   * files.
   */
  replaceIn?: {
    /** Replace this name in stylesheet files. */
    stylesheet?: boolean;
    /** Replace this name in HTML files. */
    html?: boolean;
    /** Replace this name in TypeScript strings. */
    tsStringLiterals?: boolean;
  };
}

export const cssSelectors: NgpVersionChanges<CssSelectorData> = {
  [NgpTargetVersion.V0_24_0]: [
    {
      pr: '',
      changes: [
        {
          replace: '[ngpSearchField]',
          replaceWith: '[ngpSearch]',
        },
        {
          replace: '[ngpSearchFieldClear]',
          replaceWith: '[ngpSearchClear]',
        },
      ],
    },
  ],
};

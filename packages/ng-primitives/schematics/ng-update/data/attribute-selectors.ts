import { AttributeSelectorUpgradeData } from '@angular/cdk/schematics';
import { NgpTargetVersion, NgpVersionChanges } from './changeset';

export const attributeSelectors: NgpVersionChanges<AttributeSelectorUpgradeData> = {
  [NgpTargetVersion.V0_24_0]: [
    {
      pr: '',
      changes: [
        {
          replace: 'ngpSearchField',
          replaceWith: 'ngpSearch',
        },
        {
          replace: 'ngpSearchFieldClear',
          replaceWith: 'ngpSearchClear',
        },
      ],
    },
  ],
};

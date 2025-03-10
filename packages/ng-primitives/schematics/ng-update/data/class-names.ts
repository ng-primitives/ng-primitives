import { ClassNameUpgradeData } from '@angular/cdk/schematics';
import { NgpTargetVersion, NgpVersionChanges } from './changeset';

export const classNames: NgpVersionChanges<ClassNameUpgradeData> = {
  [NgpTargetVersion.V0_24_0]: [
    {
      pr: '',
      changes: [
        {
          replace: 'NgpSearchField',
          replaceWith: 'NgpSearch',
        },
        {
          replace: 'NgpSearchFieldClear',
          replaceWith: 'NgpSearchClear',
        },
      ],
    },
  ],
};

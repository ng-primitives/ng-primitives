import { RuleTester } from '@typescript-eslint/rule-tester';
import type { RuleTesterConfig } from '@typescript-eslint/rule-tester';
import { RULE_NAME, rule } from './prefer-document-from-common';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
  },
} as RuleTesterConfig);

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `import { DOCUMENT } from '@angular/common';`,
    },
    {
      code: `import { Component } from '@angular/core';`,
    },
    {
      code: `import { Component } from '@angular/core';\nimport { DOCUMENT } from '@angular/common';`,
    },
  ],
  invalid: [
    {
      code: `import { DOCUMENT } from '@angular/core';`,
      errors: [
        {
          messageId: 'preferDocumentFromCommon',
        },
      ],
      output: `import { DOCUMENT } from '@angular/common';`,
    },
    {
      code: `import { Component, DOCUMENT } from '@angular/core';`,
      errors: [
        {
          messageId: 'preferDocumentFromCommon',
        },
      ],
      output: `import { Component } from '@angular/core';\nimport { DOCUMENT } from '@angular/common';`,
    },
    {
      code: `import { DOCUMENT, Component } from '@angular/core';`,
      errors: [
        {
          messageId: 'preferDocumentFromCommon',
        },
      ],
      output: `import { Component } from '@angular/core';\nimport { DOCUMENT } from '@angular/common';`,
    },
    {
      code: `import { Component, DOCUMENT, Injectable } from '@angular/core';`,
      errors: [
        {
          messageId: 'preferDocumentFromCommon',
        },
      ],
      output: `import { Component, Injectable } from '@angular/core';\nimport { DOCUMENT } from '@angular/common';`,
    },
  ],
});

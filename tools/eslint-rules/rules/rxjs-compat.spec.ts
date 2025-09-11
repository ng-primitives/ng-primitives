import type { RuleTesterConfig } from '@typescript-eslint/rule-tester';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { rule, RULE_NAME } from './rxjs-compat';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
  },
} as RuleTesterConfig);

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // Non-RxJS imports should be allowed
    `import { Component } from '@angular/core';`,
    `import { Observable } from 'rxjs';`,
    `import { Subject, BehaviorSubject } from 'rxjs';`,

    // Correct imports from rxjs/operators
    `import { map } from 'rxjs/operators';`,
    `import { filter, switchMap } from 'rxjs/operators';`,
    `import { take, debounceTime, distinctUntilChanged } from 'rxjs/operators';`,

    // Mixed imports - operators from rxjs/operators, others from rxjs
    `import { Observable } from 'rxjs';
     import { map, filter } from 'rxjs/operators';`,

    // Default imports should be allowed
    `import rxjs from 'rxjs';`,

    // Namespace imports should be allowed
    `import * as rxjs from 'rxjs';`,

    // Non-operator imports from rxjs should be allowed
    `import { Observable, Subject, BehaviorSubject, ReplaySubject } from 'rxjs';`,
    `import { of, from, merge, combineLatest } from 'rxjs';`,

    // Empty import
    `import 'rxjs';`,
  ],
  invalid: [
    // Single operator import from rxjs
    {
      code: `import { map } from 'rxjs';`,
      errors: [
        {
          messageId: 'invalidOperatorImport',
          data: { operatorName: 'map' },
        },
      ],
    },

    // Multiple operator imports from rxjs
    {
      code: `import { map, filter, switchMap } from 'rxjs';`,
      errors: [
        {
          messageId: 'invalidOperatorImport',
          data: { operatorName: 'map' },
        },
        {
          messageId: 'invalidOperatorImport',
          data: { operatorName: 'filter' },
        },
        {
          messageId: 'invalidOperatorImport',
          data: { operatorName: 'switchMap' },
        },
      ],
    },

    // Mixed imports - some operators, some non-operators from rxjs
    {
      code: `import { Observable, map, Subject, filter } from 'rxjs';`,
      errors: [
        {
          messageId: 'invalidOperatorImport',
          data: { operatorName: 'map' },
        },
        {
          messageId: 'invalidOperatorImport',
          data: { operatorName: 'filter' },
        },
      ],
    },

    // Common operators that should trigger the rule
    {
      code: `import { debounceTime } from 'rxjs';`,
      errors: [
        {
          messageId: 'invalidOperatorImport',
          data: { operatorName: 'debounceTime' },
        },
      ],
    },

    {
      code: `import { distinctUntilChanged } from 'rxjs';`,
      errors: [
        {
          messageId: 'invalidOperatorImport',
          data: { operatorName: 'distinctUntilChanged' },
        },
      ],
    },

    {
      code: `import { take } from 'rxjs';`,
      errors: [
        {
          messageId: 'invalidOperatorImport',
          data: { operatorName: 'take' },
        },
      ],
    },

    {
      code: `import { catchError } from 'rxjs';`,
      errors: [
        {
          messageId: 'invalidOperatorImport',
          data: { operatorName: 'catchError' },
        },
      ],
    },

    {
      code: `import { shareReplay } from 'rxjs';`,
      errors: [
        {
          messageId: 'invalidOperatorImport',
          data: { operatorName: 'shareReplay' },
        },
      ],
    },

    // Edge case: operator with alias
    {
      code: `import { map as mapOperator } from 'rxjs';`,
      errors: [
        {
          messageId: 'invalidOperatorImport',
          data: { operatorName: 'map' },
        },
      ],
    },

    // Many operators at once
    {
      code: `import {
        map,
        filter,
        take,
        debounceTime,
        distinctUntilChanged,
        switchMap,
        catchError,
        shareReplay
      } from 'rxjs';`,
      errors: [
        { messageId: 'invalidOperatorImport', data: { operatorName: 'map' } },
        { messageId: 'invalidOperatorImport', data: { operatorName: 'filter' } },
        { messageId: 'invalidOperatorImport', data: { operatorName: 'take' } },
        { messageId: 'invalidOperatorImport', data: { operatorName: 'debounceTime' } },
        { messageId: 'invalidOperatorImport', data: { operatorName: 'distinctUntilChanged' } },
        { messageId: 'invalidOperatorImport', data: { operatorName: 'switchMap' } },
        { messageId: 'invalidOperatorImport', data: { operatorName: 'catchError' } },
        { messageId: 'invalidOperatorImport', data: { operatorName: 'shareReplay' } },
      ],
    },
  ],
});

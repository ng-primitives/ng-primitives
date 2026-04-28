import parser from '@typescript-eslint/parser';
import type { RuleTesterConfig } from '@typescript-eslint/rule-tester';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { rule, RULE_NAME } from './rxjs-compat';

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
  },
} as RuleTesterConfig);

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `import { Component } from '@angular/core';`,
    `import { Observable } from 'rxjs';`,
    `import { Subject, BehaviorSubject } from 'rxjs';`,
    `import { map } from 'rxjs/operators';`,
    `import { filter, switchMap } from 'rxjs/operators';`,
    `import { take, debounceTime, distinctUntilChanged } from 'rxjs/operators';`,
    `import { Observable } from 'rxjs';
     import { map, filter } from 'rxjs/operators';`,
    `import rxjs from 'rxjs';`,
    `import * as rxjs from 'rxjs';`,
    `import { Observable, Subject, BehaviorSubject, ReplaySubject } from 'rxjs';`,
    `import { of, from, merge, combineLatest } from 'rxjs';`,
    `import 'rxjs';`,
  ],
  invalid: [
    {
      code: `import { map } from 'rxjs';`,
      errors: [
        {
          messageId: 'invalidOperatorImport',
          data: { operatorName: 'map' },
        },
      ],
    },
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
    {
      code: `import { map as mapOperator } from 'rxjs';`,
      errors: [
        {
          messageId: 'invalidOperatorImport',
          data: { operatorName: 'map' },
        },
      ],
    },
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

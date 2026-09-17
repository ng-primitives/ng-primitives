import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  HotfixError,
  bumpPatch,
  classifyPickFailure,
  decodePicks,
  encodePicks,
  parseLog,
  pickNewestTag,
  selectCommits,
  unappliedPicks,
  versionFromBranch,
} from './hotfix.lib.mjs';

const log = [
  'aaa1\0aaa1\0fix(a): one',
  'bbb2\0bbb2\0docs: contributor',
  'ccc3\0ccc3\0fix(b): two',
].join('\n');
const commits = parseLog(log);
const merged = { 934: 'ccc3', 927: 'aaa1' };
const io = {
  lookupPr: pr => (merged[pr] ? { state: 'MERGED', mergeCommit: { oid: merged[pr] } } : null),
  resolveSha: token => (commits.some(commit => commit.sha === token) ? token : null),
};

describe('parseLog', () => {
  it('keeps log order and flags bookkeeping commits', () => {
    assert.equal(commits.length, 3);
    assert.deepEqual(
      commits.map(commit => commit.noise),
      [false, true, false],
    );
  });

  it('returns nothing for empty output', () => {
    assert.deepEqual(parseLog(''), []);
  });

  it('ignores the trailing newline git leaves behind', () => {
    assert.equal(parseLog(`${log}\n`).length, 3);
  });
});

describe('bumpPatch', () => {
  it('bumps the patch segment', () => {
    assert.equal(bumpPatch('v0.130.1'), '0.130.2');
    assert.equal(bumpPatch('v1.0.9'), '1.0.10');
  });

  it('rejects a tag that is not plain semver', () => {
    assert.throws(() => bumpPatch('v0.130.1-beta.1'), HotfixError);
  });

  it('rejects leading-zero components, which are not valid semver', () => {
    assert.throws(() => bumpPatch('v01.2.3'), HotfixError);
    assert.throws(() => bumpPatch('v1.02.3'), HotfixError);
    assert.throws(() => bumpPatch('v1.2.03'), HotfixError);
  });
});

describe('selectCommits', () => {
  it('applies commits in the order they landed, not the order given', () => {
    const picked = selectCommits('934,927', commits, 'v0.130.1', io);
    assert.deepEqual(
      picked.map(commit => commit.sha),
      ['aaa1', 'ccc3'],
    );
  });

  it('accepts shas, # prefixes and whitespace', () => {
    const picked = selectCommits('#927 ccc3', commits, 'v0.130.1', io);
    assert.deepEqual(
      picked.map(commit => commit.sha),
      ['aaa1', 'ccc3'],
    );
  });

  it('deduplicates a commit named twice', () => {
    const picked = selectCommits('927,#927,aaa1', commits, 'v0.130.1', io);
    assert.deepEqual(
      picked.map(commit => commit.sha),
      ['aaa1'],
    );
  });

  it('refuses a pull request that is not merged', () => {
    const open = { ...io, lookupPr: () => ({ state: 'OPEN', mergeCommit: null }) };
    assert.throws(() => selectCommits('930', commits, 'v0.130.1', open), /is OPEN, not MERGED/);
  });

  it('refuses a merged pull request with no merge commit', () => {
    const noCommit = { ...io, lookupPr: () => ({ state: 'MERGED', mergeCommit: null }) };
    assert.throws(() => selectCommits('930', commits, 'v0.130.1', noCommit), /no merge commit/);
  });

  it('refuses a commit that is not in the unreleased range', () => {
    const other = { ...io, resolveSha: () => 'zzz9' };
    assert.throws(
      () => selectCommits('zzz9', commits, 'v0.130.1', other),
      /is not in v0.130.1..next/,
    );
  });

  it('falls back to a revision when a bare number is not a pull request', () => {
    const digits = parseLog('1234\x001234\x00fix(c): three');
    const numericSha = {
      lookupPr: () => null,
      resolveSha: token => (token === '1234' ? '1234' : null),
    };
    assert.deepEqual(
      selectCommits('1234', digits, 'v0.130.1', numericSha).map(commit => commit.sha),
      ['1234'],
    );
  });

  it('never falls back to a revision for an explicit # form', () => {
    const missing = { ...io, lookupPr: () => null };
    assert.throws(() => selectCommits('#1234', commits, 'v0.130.1', missing), /Could not read PR/);
  });

  it('refuses a bare number that is neither a pull request nor a revision', () => {
    const nothing = { lookupPr: () => null, resolveSha: () => null };
    assert.throws(
      () => selectCommits('1234', commits, 'v0.130.1', nothing),
      /neither a pull request nor a commit/,
    );
  });

  it('refuses an unknown revision', () => {
    assert.throws(() => selectCommits('nope', commits, 'v0.130.1', io), /not a commit/);
  });
});

describe('pick state', () => {
  it('round-trips the picks it was given', () => {
    assert.deepEqual(decodePicks(encodePicks('hotfix/v1.2.3', ['aaa1', 'ccc3']), 'hotfix/v1.2.3'), [
      'aaa1',
      'ccc3',
    ]);
  });

  it('ignores state left behind by a different branch', () => {
    // An abandoned hotfix must not feed its leftovers to the next one.
    assert.deepEqual(decodePicks(encodePicks('hotfix/v1.2.3', ['aaa1']), 'hotfix/v9.9.9'), []);
  });

  it('treats missing or empty state as nothing to resume', () => {
    assert.deepEqual(decodePicks(undefined, 'hotfix/v1.2.3'), []);
    assert.deepEqual(decodePicks('', 'hotfix/v1.2.3'), []);
    assert.deepEqual(decodePicks(encodePicks('hotfix/v1.2.3', []), 'hotfix/v1.2.3'), []);
  });
});

describe('classifyPickFailure', () => {
  it('recognises an already-applied commit', () => {
    assert.equal(
      classifyPickFailure(
        'The previous cherry-pick is now empty, possibly due to conflict resolution.',
      ),
      'empty',
    );
    assert.equal(classifyPickFailure('nothing to commit, working tree clean'), 'empty');
  });

  it('treats anything else as a conflict', () => {
    assert.equal(
      classifyPickFailure('CONFLICT (content): Merge conflict in packages/ng-primitives/x.ts'),
      'conflict',
    );
    assert.equal(classifyPickFailure(''), 'conflict');
  });
});

describe('bookkeeping commits', () => {
  it('can be selected deliberately - noise only dims them in the picker', () => {
    // chore(deps) bumps are legitimately hotfixable, so `noise` is a hint, not a veto.
    const log = ['aaa1\x00aaa1\x00chore(deps): bump a shipped dependency'].join('\n');
    const chore = parseLog(log);

    assert.equal(chore[0].noise, true);
    assert.deepEqual(
      selectCommits('aaa1', chore, 'v0.130.1', {
        lookupPr: () => null,
        resolveSha: token => token,
      }).map(commit => commit.sha),
      ['aaa1'],
    );
  });
});

describe('pickNewestTag', () => {
  it('takes the newest plain release tag', () => {
    // git has already sorted these by -v:refname.
    assert.equal(pickNewestTag(['v1.4.0', 'v1.3.0', 'v0.130.1']), 'v1.4.0');
  });

  it('skips tags a patch bump cannot be derived from', () => {
    assert.equal(pickNewestTag(['v1.4.0-rc.1', 'v1.3.0']), 'v1.3.0');
    assert.equal(pickNewestTag(['vnext', 'v1.3.0']), 'v1.3.0');
    assert.equal(pickNewestTag(['v01.4.0', 'v1.3.0']), 'v1.3.0');
  });

  it('returns nothing when there is no release tag', () => {
    assert.equal(pickNewestTag([]), undefined);
    assert.equal(pickNewestTag(['vnext', '']), undefined);
  });
});

describe('versionFromBranch', () => {
  it('reads the version a hotfix branch names', () => {
    assert.equal(versionFromBranch('hotfix/v0.130.2'), '0.130.2');
  });

  it('rejects a branch that is not a hotfix branch', () => {
    assert.throws(() => versionFromBranch('feat/hotfix-workflow'), HotfixError);
  });

  it('rejects a hotfix branch whose version is not plain semver', () => {
    // Otherwise the derived version reaches the dispatch and the release workflow.
    assert.throws(() => versionFromBranch('hotfix/vfoo'), HotfixError);
    assert.throws(() => versionFromBranch('hotfix/v1.2'), HotfixError);
    assert.throws(() => versionFromBranch('hotfix/v01.2.3'), HotfixError);
  });
});

describe('unappliedPicks', () => {
  const log = 'fix(a): one\n\n(cherry picked from commit aaa1)\n';

  it('drops a pick that has landed, so --continue resumes the rest', () => {
    assert.deepEqual(unappliedPicks(['aaa1', 'ccc3'], log), ['ccc3']);
  });

  it('keeps a pick that never landed, so an abort cannot silently drop it', () => {
    // git cherry-pick --abort leaves no trailer: the commit must be re-attempted,
    // not quietly omitted from the release.
    assert.deepEqual(unappliedPicks(['aaa1', 'ccc3'], ''), ['aaa1', 'ccc3']);
  });

  it('is not fooled by the sha appearing outside a cherry-pick trailer', () => {
    assert.deepEqual(unappliedPicks(['aaa1'], 'see aaa1 for context'), ['aaa1']);
  });

  it('matches the whole trailer line, not a mention of one', () => {
    // A message quoting the phrase must not be read as the commit having landed,
    // or the pick is dropped from the release without a word.
    const quoted =
      'revert: undo the backport\n\nthis reverted a (cherry picked from commit aaa1) change\n';
    assert.deepEqual(unappliedPicks(['aaa1'], quoted), ['aaa1']);
    assert.deepEqual(unappliedPicks(['aaa1'], '(cherry picked from commit aaa1)'), []);
  });

  it('handles an empty pending list', () => {
    assert.deepEqual(unappliedPicks([], log), []);
  });
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { renderMergedPrs, updateReadme } from './update-merged-prs.mjs';

const prs = [{
  number: 7,
  title: 'Improve API | response',
  url: 'https://github.com/example/project/pull/7',
  mergedAt: '2026-10-28T02:38:36Z',
}];

test('renders only validated public pull request links and dates', () => {
  const output = renderMergedPrs(prs);
  assert.match(output, /Improve API \\\| response/);
  assert.match(output, /example\/project\/pull\/7/);
  assert.match(output, /2026-10-28/);
  assert.throws(() => renderMergedPrs([{ ...prs[0], url: 'https://example.com/private' }]));
});

test('updates only the marked README region', () => {
  assert.equal(updateReadme('before\n<!--START_MERGED_PRS-->\nold\n<!--END_MERGED_PRS-->\nafter', prs),
    'before\n<!--START_MERGED_PRS-->\n| Pull request | Repository | Merged |\n| --- | --- | --- |\n| [Improve API \\| response](<https://github.com/example/project/pull/7>) | project | 2026-10-28 |\n<!--END_MERGED_PRS-->\nafter');
  assert.equal(renderMergedPrs([]), '_No public merged pull requests yet._');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePr, renderMergedPrs, updateReadme, collectMergedPrs } from './update-merged-prs.mjs';

const publicPr = { number: 7, title: 'Improve API | response', url: 'https://github.com/example/project/pull/7', mergedAt: '2026-10-28T01:38:36Z' };
const privatePr = { number: 1, repository: 'MyManah/manai-llm-server', private: true, mergedAt: '2026-10-28T02:38:36Z' };
const response = (body) => ({ ok: true, json: async () => body });

test('renders external public links and private metadata without a private link or title', () => {
  const output = renderMergedPrs([privatePr, publicPr]);
  assert.match(output, /Improve API &#124; response/);
  assert.match(output, /example\/project\/pull\/7/);
  assert.match(output, /PR #1 - Merged contribution \(private\)/);
  assert.match(output, /MyManah\/manai-llm-server/);
  assert.doesNotMatch(output, /https:\/\/github.com\/MyManah/);
  assert.throws(() => normalizePr({ ...publicPr, url: 'https://github.com/tusharg007/personal/pull/7' }));
  assert.throws(() => normalizePr({ ...privatePr, repository: 'other/private' }));
});

test('strips all non-approved private PR fields', () => {
  assert.deepEqual(normalizePr({ ...privatePr, title: 'Confidential', body: 'secret', url: 'https://github.com/private' }), privatePr);
});

test('updates only the marked README region', () => {
  const readme = 'before\n<!--START_MERGED_PRS-->\nold\n<!--END_MERGED_PRS-->\nafter';
  const updated = updateReadme(readme, [privatePr]);
  assert.ok(updated.startsWith('before\n<!--START_MERGED_PRS-->\n'));
  assert.ok(updated.endsWith('\n<!--END_MERGED_PRS-->\nafter'));
  assert.match(updated, /2026-10-28/);
  assert.throws(() => updateReadme('no markers', []));
  assert.match(renderMergedPrs([]), /outside personal projects/);
});

test('excludes personal projects and unapproved private search results, retaining approved snapshot without a token', async () => {
  const requests = [];
  const request = async (url) => {
    requests.push(url);
    if (url.includes('/search/issues')) return response({ items: [
      { number: 3, title: 'Own PR', html_url: 'https://github.com/tusharg007/personal/pull/3', closed_at: publicPr.mergedAt, pull_request: {}, user: { login: 'tusharg007' } },
      { number: 7, title: publicPr.title, html_url: publicPr.url, closed_at: publicPr.mergedAt, pull_request: {}, user: { login: 'tusharg007' } },
      { number: 9, title: 'Private title', html_url: 'https://github.com/other/private/pull/9', closed_at: publicPr.mergedAt, pull_request: {}, user: { login: 'tusharg007' } },
    ] });
    return response({ private: url.endsWith('other/private') });
  };
  const result = await collectMergedPrs({ privatePrs: [privatePr], request });
  assert.deepEqual(result.items.map((pr) => pr.repository), ['MyManah/manai-llm-server', 'example/project']);
  assert.deepEqual(result.privateItems, [privatePr]);
  assert.ok(!requests.some((url) => url.includes('/repos/tusharg007') || url.includes('/pulls?')));
});

test('private refresh imports only the author\'s merged PR metadata from the approved repository', async () => {
  const request = async (url, options) => {
    if (url.includes('/search/issues')) return response({ items: [] });
    assert.match(url, /\/repos\/MyManah\/manai-llm-server\/pulls\?/);
    assert.equal(options.headers.Authorization, 'Bearer readonly-test');
    return response([
      { number: 2, title: 'Sensitive internal title', body: 'Internal details', merged_at: '2026-10-29T00:00:00Z', user: { login: 'tusharg007' } },
      { number: 3, merged_at: null, user: { login: 'tusharg007' } },
      { number: 4, merged_at: publicPr.mergedAt, user: { login: 'someone-else' } },
    ]);
  };
  const result = await collectMergedPrs({ privateToken: 'readonly-test', privatePrs: [privatePr], request });
  assert.deepEqual(result.items.map((pr) => pr.number), [2, 1]);
  assert.doesNotMatch(JSON.stringify(result), /Sensitive|Internal details|url|body|title/);
});

test('API failures and incomplete search fail closed', async () => {
  await assert.rejects(collectMergedPrs({ privatePrs: [privatePr], request: async () => ({ ok: false, status: 403 }) }), /HTTP 403/);
  await assert.rejects(collectMergedPrs({ privatePrs: [privatePr], request: async () => response({ items: [], incomplete_results: true }) }), /Incomplete/);
});

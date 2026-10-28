import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const username = 'tusharg007';
const markerStart = '<!--START_MERGED_PRS-->';
const markerEnd = '<!--END_MERGED_PRS-->';

export function renderMergedPrs(items) {
  if (!Array.isArray(items)) throw new Error('Expected a PR list');
  const rows = items.slice(0, 5).map((pr) => {
    if (!Number.isInteger(pr.number) || typeof pr.title !== 'string' || !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+$/.test(pr.url)) {
      throw new Error('Invalid public pull request entry');
    }
    const date = new Date(pr.mergedAt);
    if (!Number.isFinite(date.valueOf())) throw new Error('Invalid PR merge date');
    const title = pr.title.replace(/[|\\[\]<>]/g, (char) => `\\${char}`);
    const repository = new URL(pr.url).pathname.split('/')[2];
    return `| [${title}](<${pr.url}>) | ${repository} | ${date.toISOString().slice(0, 10)} |`;
  });
  if (!rows.length) return '_No public merged pull requests yet._';
  return ['| Pull request | Repository | Merged |', '| --- | --- | --- |', ...rows].join('\n');
}

export function updateReadme(readme, items) {
  const start = readme.indexOf(markerStart);
  const end = readme.indexOf(markerEnd);
  if (start < 0 || end < start) throw new Error('Merged PR markers missing from README');
  return `${readme.slice(0, start + markerStart.length)}\n${renderMergedPrs(items)}\n${readme.slice(end)}`;
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const query = encodeURIComponent(`is:pr is:merged author:${username}`);
  const response = await fetch(`https://api.github.com/search/issues?q=${query}&sort=created&order=desc&per_page=10`, { headers });
  if (!response.ok) throw new Error(`GitHub PR search failed: HTTP ${response.status}`);
  const result = await response.json();
  if (!Array.isArray(result.items)) throw new Error('GitHub PR search returned invalid data');
  const candidates = result.items.filter((item) => item.pull_request && item.user?.login?.toLowerCase() === username);
  const visible = await Promise.all(candidates.map(async (item) => {
    const repository = new URL(item.repository_url);
    if (repository.hostname !== 'api.github.com' || !/^\/repos\/[\w.-]+\/[\w.-]+$/.test(repository.pathname)) return null;
    const repoResponse = await fetch(repository.href, { headers });
    if (!repoResponse.ok) return null;
    const repo = await repoResponse.json();
    return repo.private === false ? item : null;
  }));
  const items = visible.filter(Boolean).slice(0, 5).map((item) => ({
    number: Number(item.number), title: item.title, url: item.html_url, mergedAt: item.closed_at,
  }));
  const readmePath = resolve(fileURLToPath(new URL('../README.md', import.meta.url)));
  const feedPath = resolve(fileURLToPath(new URL('../assets/merged-prs.json', import.meta.url)));
  const previous = await readFile(readmePath, 'utf8');
  const next = updateReadme(previous, items);
  if (previous !== next) await writeFile(readmePath, next, 'utf8');
  await writeFile(feedPath, `${JSON.stringify({ updatedAt: new Date().toISOString(), items }, null, 2)}\n`, 'utf8');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

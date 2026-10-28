import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const username = 'tusharg007';
const approvedPrivateRepos = ['MyManah/manai-llm-server'];
const markerStart = '<!--START_MERGED_PRS-->';
const markerEnd = '<!--END_MERGED_PRS-->';
const escapeMarkdown = (text) => text.replace(/[&<>\[\]|\r\n]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '[': '&#91;', ']': '&#93;', '|': '&#124;', '\r': ' ', '\n': ' ',
})[char]);

export function normalizePr(pr) {
  if (!Number.isInteger(pr?.number) || pr.number < 1 || typeof pr.mergedAt !== 'string' || !Number.isFinite(Date.parse(pr.mergedAt))) {
    throw new Error('Invalid merged PR metadata');
  }
  if (pr.private === true) {
    if (!approvedPrivateRepos.includes(pr.repository)) throw new Error('Private repository is not approved for publication');
    return { number: pr.number, repository: pr.repository, private: true, mergedAt: pr.mergedAt };
  }
  const match = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/pull\/(\d+)$/.exec(pr.url);
  if (!match || Number(match[3]) !== pr.number || match[1].toLowerCase() === username || typeof pr.title !== 'string') {
    throw new Error('Invalid external public PR');
  }
  return { number: pr.number, repository: `${match[1]}/${match[2]}`, title: pr.title, url: pr.url, private: false, mergedAt: pr.mergedAt };
}

export function renderMergedPrs(items) {
  if (!Array.isArray(items)) throw new Error('Expected a PR list');
  const rows = items.slice(0, 5).map(normalizePr).map((pr) => {
    const contribution = pr.private ? `PR #${pr.number} - Merged contribution (private)` : `[${escapeMarkdown(pr.title)}](<${pr.url}>)`;
    return `| ${contribution} | ${pr.repository} | ${pr.mergedAt.slice(0, 10)} |`;
  });
  if (!rows.length) return '_No merged contributions outside personal projects yet._';
  return ['| Contribution | Repository | Merged |', '| --- | --- | --- |', ...rows].join('\n');
}

export function updateReadme(readme, items) {
  const start = readme.indexOf(markerStart);
  const end = readme.indexOf(markerEnd);
  if (start < 0 || end < start) throw new Error('Merged PR markers missing from README');
  return `${readme.slice(0, start + markerStart.length)}\n${renderMergedPrs(items)}\n${readme.slice(end)}`;
}

export async function collectMergedPrs({ token, privateToken, privatePrs, request = fetch }) {
  const get = async (url, accessToken) => {
    const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    const response = await request(url, { headers, signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`GitHub PR refresh failed: HTTP ${response.status}`);
    return response.json();
  };
  const query = encodeURIComponent(`is:pr is:merged author:${username} -user:${username}`);
  const search = await get(`https://api.github.com/search/issues?q=${query}&sort=updated&order=desc&per_page=100`, token);
  if (!Array.isArray(search.items) || search.incomplete_results) throw new Error('Incomplete GitHub PR search');
  const publicPrs = [];
  const repositories = new Map();
  for (const item of search.items) {
    if (!item.pull_request || item.user?.login?.toLowerCase() !== username) continue;
    const match = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/pull\/\d+$/.exec(item.html_url);
    if (!match || match[1].toLowerCase() === username) continue;
    const repository = `${match[1]}/${match[2]}`;
    if (!repositories.has(repository)) repositories.set(repository, await get(`https://api.github.com/repos/${repository}`, token));
    if (repositories.get(repository).private !== false) continue;
    publicPrs.push(normalizePr({ number: item.number, title: item.title, url: item.html_url, mergedAt: item.closed_at }));
  }

  const approved = new Map(privatePrs.map(normalizePr).map((pr) => [`${pr.repository}#${pr.number}`, pr]));
  if (privateToken) {
    for (const repository of approvedPrivateRepos) {
      for (let page = 1; ; page++) {
        const prs = await get(`https://api.github.com/repos/${repository}/pulls?state=closed&sort=updated&direction=desc&per_page=100&page=${page}`, privateToken);
        if (!Array.isArray(prs)) throw new Error('Invalid private PR response');
        for (const pr of prs) {
          if (pr.user?.login?.toLowerCase() !== username || !pr.merged_at) continue;
          const safe = normalizePr({ number: pr.number, repository, private: true, mergedAt: pr.merged_at });
          approved.set(`${repository}#${pr.number}`, safe);
        }
        if (prs.length < 100) break;
        if (page >= 20) throw new Error('Private PR pagination limit exceeded');
      }
    }
  }
  const privateItems = [...approved.values()].sort((a, b) => Date.parse(b.mergedAt) - Date.parse(a.mergedAt));
  const items = [...privateItems, ...publicPrs].sort((a, b) => Date.parse(b.mergedAt) - Date.parse(a.mergedAt)).slice(0, 5);
  return { items, privateItems };
}

async function writeIfChanged(path, next) {
  let previous;
  try { previous = await readFile(path, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (previous !== next) await writeFile(path, next, 'utf8');
}

async function main() {
  const root = new URL('../', import.meta.url);
  const privatePath = fileURLToPath(new URL('data/approved-private-prs.json', root));
  const privateSnapshot = JSON.parse(await readFile(privatePath, 'utf8'));
  const { items, privateItems } = await collectMergedPrs({
    token: process.env.GITHUB_TOKEN,
    privateToken: process.env.PRIVATE_PRS_TOKEN,
    privatePrs: privateSnapshot.items,
  });
  const readmePath = fileURLToPath(new URL('README.md', root));
  const feedPath = fileURLToPath(new URL('assets/merged-prs.json', root));
  const readme = await readFile(readmePath, 'utf8');
  let previousFeed;
  try { previousFeed = JSON.parse(await readFile(feedPath, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  await writeIfChanged(readmePath, updateReadme(readme, items));
  await writeIfChanged(privatePath, `${JSON.stringify({ items: privateItems }, null, 2)}\n`);
  if (JSON.stringify(previousFeed?.items) !== JSON.stringify(items)) {
    await writeIfChanged(feedPath, `${JSON.stringify({ updatedAt: new Date().toISOString(), items }, null, 2)}\n`);
  }
  if (!process.env.PRIVATE_PRS_TOKEN) console.log('Private PRs: preserving approved snapshot; read-only token not configured.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

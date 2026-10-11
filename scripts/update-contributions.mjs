import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const escapeXml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
})[char]);

export function renderGraph(calendar) {
  if (!Number.isInteger(calendar?.totalContributions) || calendar.totalContributions < 0 || !Array.isArray(calendar.weeks)) {
    throw new Error('Missing or invalid contribution calendar');
  }
  const days = calendar.weeks.flatMap((week) => week.contributionDays);
  if (days.length < 30 || days.some((day) => !/^\d{4}-\d{2}-\d{2}$/.test(day?.date) || !Number.isInteger(day.contributionCount) || day.contributionCount < 0)) {
    throw new Error('Missing or invalid daily contribution data');
  }
  for (let i = 1; i < days.length; i++) {
    if (Date.parse(days[i].date) - Date.parse(days[i - 1].date) !== 86400000) throw new Error('Contribution dates must be consecutive');
  }
  const recent = days.slice(-30);
  const total = recent.reduce((sum, day) => sum + day.contributionCount, 0);
  const active = recent.filter((day) => day.contributionCount > 0).length;
  const limit = Math.max(4, Math.ceil(Math.max(...recent.map((day) => day.contributionCount)) / 4) * 4);
  const x = (i) => 56 + i * (908 / 29);
  const y = (count) => 246 - count / limit * 114;
  const points = recent.map((day, i) => `${x(i).toFixed(2)},${y(day.contributionCount).toFixed(2)}`).join(' ');
  const label = (value, px, py, fill = '#8b949e', size = 12, anchor = 'start') => `<text x="${px}" y="${py}" fill="${fill}" font-size="${size}" text-anchor="${anchor}">${escapeXml(value)}</text>`;
  const range = `${recent[0].date} to ${recent.at(-1).date}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1020" height="310" viewBox="0 0 1020 310" role="img" aria-labelledby="title desc">
<title id="title">GitHub contribution activity for tusharg007</title>
<desc id="desc">${calendar.totalContributions} contributions in the trailing year. ${total} contributions across ${active} active days in the last 30 days, ${range}. Refreshed through ${recent.at(-1).date} UTC.</desc>
<rect width="1020" height="310" rx="8" fill="#0d1117"/>
<g font-family="Arial, Helvetica, sans-serif">
${label('Contribution Activity', 32, 38, '#e6edf3', 21)}
${label(`${calendar.totalContributions} contributions / trailing year`, 32, 76, '#e6edf3', 16)}
${label(`${total} / last 30 days`, 452, 76, '#3fb950', 16)}
${label(`${active} active days / last 30 days`, 718, 76, '#e6edf3', 16)}
${label(range, 32, 103)}
${Array.from({ length: 5 }, (_, i) => {
    const count = limit * i / 4;
    return `<line x1="56" y1="${y(count)}" x2="964" y2="${y(count)}" stroke="#21262d"/>${label(count, 42, y(count) + 4, '#8b949e', 11, 'end')}`;
  }).join('\n')}
<polygon points="56,246 ${points} 964,246" fill="#238636" opacity="0.12"/>
<polyline points="${points}" stroke="#3fb950" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
${recent.map((day, i) => `<circle cx="${x(i)}" cy="${y(day.contributionCount)}" r="3.5" fill="#3fb950"><title>${day.date}: ${day.contributionCount} contributions</title></circle>${label(day.contributionCount, x(i), y(day.contributionCount) - 10, '#e6edf3', 10, 'middle')}${i % 3 === 0 || i === 29 ? label(day.date.slice(5), x(i), 268, '#8b949e', 11, 'middle') : ''}`).join('\n')}
${label('Source: GitHub contribution calendar / refreshed daily / dates in UTC', 32, 295, '#8b949e', 11)}
</g>
</svg>\n`;
}

export async function updateGraph(token, username = 'tusharg007') {
  if (!token) throw new Error('GITHUB_TOKEN is required');
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-contribution-graph' },
    body: JSON.stringify({
      query: 'query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } } } }',
      variables: { login: username },
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`GitHub API returned HTTP ${response.status}`);
  const result = await response.json();
  if (result.errors) throw new Error(`GitHub API error: ${JSON.stringify(result.errors)}`);
  const svg = renderGraph(result.data?.user?.contributionsCollection?.contributionCalendar);
  await writeFile(new URL('../assets/contribution-graph.svg', import.meta.url), svg);
  console.log('Updated contribution graph from GitHub data.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await updateGraph(process.env.GITHUB_TOKEN);
}

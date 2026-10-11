import test from 'node:test';
import assert from 'node:assert/strict';
import { renderGraph } from './update-contributions.mjs';

const calendar = (count = 2) => ({
  totalContributions: count * 40,
  weeks: [{ contributionDays: Array.from({ length: 40 }, (_, i) => ({
    date: new Date(Date.UTC(2026, 8, 1 + i)).toISOString().slice(0, 10),
    contributionCount: count,
  })) }],
});

test('renders real totals and only the latest 30 daily values', () => {
  const svg = renderGraph(calendar());
  assert.match(svg, /80 contributions in the trailing year/);
  assert.match(svg, /60 contributions across 30 active days/);
  assert.match(svg, /2026-09-11 to 2026-10-10/);
  assert.equal((svg.match(/<circle /g) || []).length, 30);
  assert.doesNotMatch(svg, /NaN|Infinity|undefined/);
});

test('zero contributions remain valid and do not cause a divide by zero', () => {
  const svg = renderGraph(calendar(0));
  assert.match(svg, /0 contributions across 0 active days/);
  assert.doesNotMatch(svg, /NaN|Infinity/);
});

test('bad API data fails instead of overwriting the last successful graph', () => {
  assert.throws(() => renderGraph(undefined), /calendar/);
  assert.throws(() => renderGraph({ totalContributions: 0, weeks: [] }), /daily/);
  const invalid = calendar();
  invalid.weeks[0].contributionDays[0].contributionCount = -1;
  assert.throws(() => renderGraph(invalid), /daily/);
  const gap = calendar();
  gap.weeks[0].contributionDays[0].date = '2026-01-01';
  assert.throws(() => renderGraph(gap), /consecutive/);
});

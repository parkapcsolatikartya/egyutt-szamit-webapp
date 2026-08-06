import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
}

test('the V0 catalog exposes water, electricity and gas categories', async () => {
  const { categories } = await readJson('../app/data/categories.json');
  assert.deepEqual(categories.map(({ id }) => id), ['water', 'electricity', 'gas']);
  assert.equal(categories.find(({ id }) => id === 'gas').status, 'coming-soon');
});

test('all active challenges belong to an active category', async () => {
  const [{ categories }, { challenges }] = await Promise.all([
    readJson('../app/data/categories.json'),
    readJson('../app/data/challenges.json'),
  ]);
  const activeCategoryIds = new Set(categories.filter(({ status }) => status === 'active').map(({ id }) => id));
  challenges.filter(({ status }) => status === 'active').forEach(({ categoryId }) => {
    assert.ok(activeCategoryIds.has(categoryId));
  });
});

test('the first catalog contains three water and two electricity trials', async () => {
  const { challenges } = await readJson('../app/data/challenges.json');
  assert.equal(challenges.filter(({ categoryId }) => categoryId === 'water').length, 3);
  assert.equal(challenges.filter(({ categoryId }) => categoryId === 'electricity').length, 2);
});

test('every challenge has a unique route and visual key', async () => {
  const { challenges } = await readJson('../app/data/challenges.json');
  assert.equal(new Set(challenges.map(({ slug }) => slug)).size, challenges.length);
  assert.equal(new Set(challenges.map(({ visualKey }) => visualKey)).size, challenges.length);
});

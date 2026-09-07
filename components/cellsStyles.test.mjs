import test from 'node:test';
import assert from 'node:assert/strict';
import { CELL_STYLES, cellBlendWeights, cellSourceRect } from './cellsStyles.ts';

test('styles select the matching quadrant of the synchronized video', () => {
  assert.deepEqual(CELL_STYLES.map(style => style.name),
    ['Teal microscopy', 'Heat map', 'Infrared', 'X-ray film']);
  assert.deepEqual(CELL_STYLES.map((_, index) => cellSourceRect(index, 1920, 1080)), [
    [0, 0, 960, 540], [960, 0, 960, 540],
    [0, 540, 960, 540], [960, 540, 960, 540],
  ]);
});

test('X-ray can fade back to teal without cutting an interrupted blend', () => {
  const toXray = cellBlendWeights([0, 0, 1, 0], 3, 0.5);
  assert.deepEqual(toXray, [0, 0, 0.5, 0.5]);
  assert.deepEqual(cellBlendWeights(toXray, 0, 0), toXray);
  assert.deepEqual(cellBlendWeights(toXray, 0, 1), [1, 0, 0, 0]);
});

test('a completed style change keeps only the requested style', () => {
  assert.deepEqual(cellBlendWeights([1, 0, 0], 1, 0), [1, 0, 0]);
  assert.deepEqual(cellBlendWeights([1, 0, 0], 1, 1), [0, 1, 0]);
  assert.deepEqual(cellBlendWeights([0, 1, 0], 2, 8), [0, 0, 1]);
});

test('rapid clicks continue from the current mixture without a visual cut', () => {
  const interrupted = cellBlendWeights([1, 0, 0], 1, 0.5);
  assert.deepEqual(interrupted, [0.5, 0.5, 0]);
  assert.deepEqual(cellBlendWeights(interrupted, 2, 0), interrupted);
  const interruptedAgain = cellBlendWeights(interrupted, 2, 0.4);
  assert.deepEqual(cellBlendWeights(interruptedAgain, 0, 0), interruptedAgain);
  assert.deepEqual(cellBlendWeights(interruptedAgain, 0, 1), [1, 0, 0]);
});

test('crossfades preserve total brightness through repeated interruptions', () => {
  let weights = CELL_STYLES.map((_, index) => Number(index === 0));
  for (let click = 0; click < 30; click++) {
    const next = (click + 1) % CELL_STYLES.length;
    for (let step = 0; step <= 10; step++) {
      const sample = cellBlendWeights(weights, next, step / 10);
      assert.ok(sample.every(weight => weight >= 0 && weight <= 1));
      assert.ok(Math.abs(sample.reduce((sum, weight) => sum + weight, 0) - 1) < 1e-12);
    }
    weights = cellBlendWeights(weights, next, 0.37);
  }
});

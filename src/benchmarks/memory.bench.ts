/**
 * Memory Benchmarks - Real measurements
 */

import { test, expect } from 'bun:test';
import { signal, effect, computed } from '../index.js';

// Measure object size
function roughSizeOfObject(object: any): number {
  const objectList: any[] = [];
  const stack = [object];
  let bytes = 0;

  while (stack.length) {
    const value = stack.pop();

    if (typeof value === 'boolean') {
      bytes += 4;
    } else if (typeof value === 'string') {
      bytes += value.length * 2;
    } else if (typeof value === 'number') {
      bytes += 8;
    } else if (typeof value === 'object' && objectList.indexOf(value) === -1) {
      objectList.push(value);

      for (const prop in value) {
        if (value.hasOwnProperty(prop)) {
          stack.push(value[prop]);
        }
      }
    }
  }
  return bytes;
}

test.skip('Signal memory - bitfield vs Set structure (internal implementation, skipped with @sylphx/zen)', () => {
  // NOTE: This test checks internal implementation details
  // which are not exposed by @sylphx/zen. The library handles
  // subscriber management internally with its own optimizations.

  console.log('Skipped: Internal memory structure test');
  console.log('Using @sylphx/zen reactive core');
});

test('Signal creation overhead', () => {
  const count = 1000;

  const start = performance.now();
  const signals = [];
  for (let i = 0; i < count; i++) {
    signals.push(signal(i));
  }
  const end = performance.now();

  const timePerSignal = (end - start) / count;
  console.log(`Signal creation: ${timePerSignal.toFixed(3)}ms per signal`);
  console.log(`Total for ${count} signals: ${(end - start).toFixed(2)}ms`);

  // Should be very fast
  expect(timePerSignal).toBeLessThan(0.1);
});

test('Computed overhead', () => {
  const count = 1000;
  const base = signal(0);

  const start = performance.now();
  const computeds = [];
  for (let i = 0; i < count; i++) {
    computeds.push(computed(() => base.value * 2));
  }
  const end = performance.now();

  const timePerComputed = (end - start) / count;
  console.log(`Computed creation: ${timePerComputed.toFixed(3)}ms per computed`);
  console.log(`Total for ${count} computeds: ${(end - start).toFixed(2)}ms`);

  // Should be fast
  expect(timePerComputed).toBeLessThan(0.2);
});

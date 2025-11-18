/**
 * Performance Benchmarks - Real measurements
 */

import { test, expect } from 'bun:test';
import { signal, batch } from '../core/signal';
import { effect } from '../core/effect';
import { computed } from '../core/computed';

test('Signal update performance', () => {
  const sig = signal(0);
  const iterations = 100000;

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    sig.value = i;
  }
  const end = performance.now();

  const timePerUpdate = (end - start) / iterations * 1000; // microseconds
  console.log(`Signal update: ${timePerUpdate.toFixed(3)}μs per update`);
  console.log(`Throughput: ${(iterations / (end - start) * 1000).toFixed(0)} updates/sec`);

  // Should be very fast
  expect(end - start).toBeLessThan(100); // < 100ms for 100k updates
});

test('Effect execution performance', async () => {
  const sig = signal(0);
  let runCount = 0;

  effect(() => {
    sig();
    runCount++;
  });

  const iterations = 10000;
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    sig.value = i;
  }

  // Wait for microtasks to flush
  await new Promise(resolve => setTimeout(resolve, 10));

  const end = performance.now();

  console.log(`Effect runs: ${runCount}`);
  console.log(`Time: ${(end - start).toFixed(2)}ms`);
  console.log(`Time per effect run: ${((end - start) / runCount).toFixed(3)}ms`);

  expect(runCount).toBeGreaterThan(0);
});

test('Batch performance benefit', async () => {
  const a = signal(0);
  const b = signal(0);
  const c = signal(0);
  let normalRuns = 0;
  let batchedRuns = 0;

  // Test without batch - force microtask flush between updates
  effect(() => {
    a(); b(); c();
    normalRuns++;
  });

  const normalStart = performance.now();
  for (let i = 0; i < 100; i++) {
    a.value = i;
    await new Promise(resolve => setTimeout(resolve, 0)); // Force effect run
    b.value = i;
    await new Promise(resolve => setTimeout(resolve, 0)); // Force effect run
    c.value = i;
    await new Promise(resolve => setTimeout(resolve, 0)); // Force effect run
  }
  const normalEnd = performance.now();
  const normalTime = normalEnd - normalStart;
  const normalRunsTotal = normalRuns;

  // Reset
  normalRuns = 0;
  const a2 = signal(0);
  const b2 = signal(0);
  const c2 = signal(0);

  effect(() => {
    a2(); b2(); c2();
    batchedRuns++;
  });

  // Test with batch - synchronous execution
  const batchedStart = performance.now();
  for (let i = 0; i < 100; i++) {
    batch(() => {
      a2.value = i;
      b2.value = i;
      c2.value = i;
    });
  }
  const batchedEnd = performance.now();
  const batchedTime = batchedEnd - batchedStart;
  const batchedRunsTotal = batchedRuns;

  const runReduction = ((normalRunsTotal - batchedRunsTotal) / normalRunsTotal * 100).toFixed(1);

  console.log(`Without batch: ${normalRunsTotal} effect runs in ${normalTime.toFixed(2)}ms`);
  console.log(`With batch: ${batchedRunsTotal} effect runs in ${batchedTime.toFixed(2)}ms`);
  console.log(`Effect run reduction: ${runReduction}%`);

  // Batched should run effects fewer times
  expect(batchedRunsTotal).toBeLessThan(normalRunsTotal);
});

test('Computed caching effectiveness', () => {
  const base = signal(0);
  let computeCount = 0;

  const doubled = computed(() => {
    computeCount++;
    return base() * 2;
  });

  // Read multiple times without changing base
  const iterations = 10000;
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    doubled();
  }

  const end = performance.now();

  console.log(`Computed calls: ${iterations}`);
  console.log(`Actual computations: ${computeCount}`);
  console.log(`Cache hit rate: ${((iterations - computeCount) / iterations * 100).toFixed(1)}%`);
  console.log(`Time: ${(end - start).toFixed(2)}ms`);

  // Should only compute once
  expect(computeCount).toBe(1);
});

test('Single subscriber fast path', () => {
  const sig = signal(0);
  let runCount = 0;

  effect(() => {
    sig();
    runCount++;
  });

  const iterations = 100000;
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    sig.value = i;
  }

  const end = performance.now();
  const timePerUpdate = (end - start) / iterations * 1000; // microseconds

  console.log(`Single subscriber: ${timePerUpdate.toFixed(3)}μs per update`);
  console.log(`Throughput: ${(iterations / (end - start) * 1000).toFixed(0)} updates/sec`);

  // Should be very fast
  expect(end - start).toBeLessThan(50);
});

test('Many subscribers performance', async () => {
  const sig = signal(0);
  const effectCount = 1000;
  const runCounts: number[] = [];

  // Create many effects
  for (let i = 0; i < effectCount; i++) {
    runCounts[i] = 0;
    effect(() => {
      sig();
      runCounts[i]++;
    });
  }

  const start = performance.now();

  // Update signal
  sig.value = 1;

  // Wait for all effects to run
  await new Promise(resolve => setTimeout(resolve, 50));

  const end = performance.now();

  const allRan = runCounts.every(count => count === 2); // initial + update
  const totalRuns = runCounts.reduce((a, b) => a + b, 0);

  console.log(`Subscribers: ${effectCount}`);
  console.log(`Total effect runs: ${totalRuns}`);
  console.log(`Time: ${(end - start).toFixed(2)}ms`);
  console.log(`Time per effect: ${((end - start) / totalRuns).toFixed(3)}ms`);

  expect(allRan).toBe(true);
});

/**
 * Realistic Scenario Benchmarks
 * Tests that simulate real-world usage patterns
 */

import { test, expect } from 'bun:test';
import { signal, computed, batch, effect } from '../index.js';

test('Todo app scenario - add/toggle/filter', async () => {
  interface Todo {
    id: number;
    text: string;
    completed: boolean;
  }

  const todos = signal<Todo[]>([]);
  const filter = signal<'all' | 'active' | 'completed'>('all');

  const filteredTodos = computed(() => {
    const list = todos();
    const f = filter();
    if (f === 'all') return list;
    if (f === 'active') return list.filter(t => !t.completed);
    return list.filter(t => t.completed);
  });

  const activeCount = computed(() => todos().filter(t => !t.completed).length);
  const completedCount = computed(() => todos().filter(t => t.completed).length);

  let renderCount = 0;
  effect(() => {
    filteredTodos();
    activeCount();
    completedCount();
    renderCount++;
  });

  const start = performance.now();

  // Add 100 todos
  for (let i = 0; i < 100; i++) {
    batch(() => {
      todos.value = [...todos(), { id: i, text: `Todo ${i}`, completed: false }];
    });
  }

  await new Promise(resolve => setTimeout(resolve, 10));

  // Toggle some todos
  for (let i = 0; i < 50; i++) {
    batch(() => {
      const list = todos();
      list[i].completed = true;
      todos.value = [...list];
    });
  }

  await new Promise(resolve => setTimeout(resolve, 10));

  // Change filter
  filter.value = 'active';
  await new Promise(resolve => setTimeout(resolve, 10));

  filter.value = 'completed';
  await new Promise(resolve => setTimeout(resolve, 10));

  const end = performance.now();

  console.log(`Todo app scenario: ${(end - start).toFixed(2)}ms`);
  console.log(`Render count: ${renderCount}`);
  console.log(`Final state: ${activeCount()} active, ${completedCount()} completed`);

  expect(activeCount()).toBe(50);
  expect(completedCount()).toBe(50);
});

test('Counter grid scenario - 10x10 independent counters', () => {
  const counters: Array<{ count: ReturnType<typeof signal<number>>; doubled: ReturnType<typeof computed<number>> }> = [];

  // Create 100 counters
  for (let i = 0; i < 100; i++) {
    const count = signal(0);
    const doubled = computed(() => count() * 2);
    counters.push({ count, doubled });
  }

  const start = performance.now();

  // Update each counter 10 times
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 100; j++) {
      counters[j].count.value++;
    }
  }

  const end = performance.now();

  console.log(`Counter grid (100 counters × 10 updates): ${(end - start).toFixed(2)}ms`);
  console.log(`Total updates: 1000`);
  console.log(`Time per update: ${((end - start) / 1000).toFixed(3)}ms`);

  // Verify all counters are at 10
  expect(counters.every(c => c.count() === 10)).toBe(true);
  expect(counters.every(c => c.doubled() === 20)).toBe(true);
});

test('Deep computed chain scenario', async () => {
  const base = signal(1);
  const step1 = computed(() => base() * 2);
  const step2 = computed(() => step1() + 10);
  const step3 = computed(() => step2() * 3);
  const step4 = computed(() => step3() - 5);
  const step5 = computed(() => step4() / 2);

  let finalValue = 0;
  effect(() => {
    finalValue = step5();
  });

  const start = performance.now();

  // Update base signal 10000 times
  for (let i = 1; i <= 10000; i++) {
    base.value = i;
  }

  // Wait for effect to run
  await new Promise(resolve => setTimeout(resolve, 10));

  const end = performance.now();

  console.log(`Deep chain (5 levels, 10k updates): ${(end - start).toFixed(2)}ms`);
  console.log(`Time per update: ${((end - start) / 10000 * 1000).toFixed(3)}μs`);

  // Verify final computation: ((((10000 * 2) + 10) * 3) - 5) / 2
  const expected = ((((10000 * 2) + 10) * 3) - 5) / 2;
  expect(finalValue).toBe(expected);
});

test('Wide fan-out scenario - 1 signal, 100 computed', async () => {
  const source = signal(0);
  const computeds = [];

  for (let i = 0; i < 100; i++) {
    computeds.push(computed(() => source() + i));
  }

  let renderCount = 0;
  effect(() => {
    computeds.forEach(c => c());
    renderCount++;
  });

  const start = performance.now();

  // Update source 100 times
  for (let i = 0; i < 100; i++) {
    source.value = i;
  }

  await new Promise(resolve => setTimeout(resolve, 10));

  const end = performance.now();

  console.log(`Wide fan-out (1→100, 100 updates): ${(end - start).toFixed(2)}ms`);
  console.log(`Render count: ${renderCount}`);

  expect(renderCount).toBeGreaterThan(0);
});

test('Batch vs non-batch realistic scenario', async () => {
  // Non-batched updates
  const a1 = signal(0);
  const b1 = signal(0);
  const c1 = signal(0);
  const sum1 = computed(() => a1() + b1() + c1());

  let runs1 = 0;
  effect(() => {
    sum1();
    runs1++;
  });

  const start1 = performance.now();
  for (let i = 0; i < 100; i++) {
    a1.value = i;
    await new Promise(r => setTimeout(r, 0));
    b1.value = i;
    await new Promise(r => setTimeout(r, 0));
    c1.value = i;
    await new Promise(r => setTimeout(r, 0));
  }
  const end1 = performance.now();
  const time1 = end1 - start1;

  // Batched updates
  const a2 = signal(0);
  const b2 = signal(0);
  const c2 = signal(0);
  const sum2 = computed(() => a2() + b2() + c2());

  let runs2 = 0;
  effect(() => {
    sum2();
    runs2++;
  });

  const start2 = performance.now();
  for (let i = 0; i < 100; i++) {
    batch(() => {
      a2.value = i;
      b2.value = i;
      c2.value = i;
    });
  }
  const end2 = performance.now();
  const time2 = end2 - start2;

  const improvement = ((time1 - time2) / time1 * 100).toFixed(1);
  const runReduction = ((runs1 - runs2) / runs1 * 100).toFixed(1);

  console.log(`Non-batched: ${runs1} runs in ${time1.toFixed(2)}ms`);
  console.log(`Batched: ${runs2} runs in ${time2.toFixed(2)}ms`);
  console.log(`Time improvement: ${improvement}%`);
  console.log(`Run reduction: ${runReduction}%`);

  expect(runs2).toBeLessThan(runs1);
});

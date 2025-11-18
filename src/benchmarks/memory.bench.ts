/**
 * Memory Benchmarks - Real measurements
 */

import { test, expect } from 'bun:test';
import { signal } from '../core/signal';
import { effect } from '../core/effect';
import { computed } from '../core/computed';

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

test('Signal memory - bitfield vs Set structure', () => {
  // Test with <= 32 subscribers (bitfield mode)
  const sig1 = signal(0);
  const effects1: any[] = [];

  for (let i = 0; i < 30; i++) {
    effects1.push(effect(() => sig1()));
  }

  const subs1 = (sig1 as any)._subscribers;
  const bitfield1 = (sig1 as any)._bitfield;

  console.log('Bitfield mode (30 subscribers):');
  console.log('  Structure:', Array.isArray(subs1) ? 'Array[32]' : 'Set');
  console.log('  Bitfield:', bitfield1.toString(2).padStart(32, '0'));
  console.log('  Populated slots:', bitfield1.toString(2).split('').filter((b: string) => b === '1').length);

  // Test with > 32 subscribers (Set mode)
  const sig2 = signal(0);
  const effects2: any[] = [];

  for (let i = 0; i < 40; i++) {
    effects2.push(effect(() => sig2()));
  }

  const subs2 = (sig2 as any)._subscribers;
  console.log('\nSet mode (40 subscribers):');
  console.log('  Structure:', Array.isArray(subs2) ? 'Array[32]' : 'Set');
  console.log('  Size:', subs2 instanceof Set ? subs2.size : 'N/A');

  // Verify bitfield mode is used for <= 32
  expect(Array.isArray(subs1)).toBe(true);
  // Verify Set mode is used for > 32
  expect(subs2 instanceof Set).toBe(true);
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
    computeds.push(computed(() => base() * 2));
  }
  const end = performance.now();

  const timePerComputed = (end - start) / count;
  console.log(`Computed creation: ${timePerComputed.toFixed(3)}ms per computed`);
  console.log(`Total for ${count} computeds: ${(end - start).toFixed(2)}ms`);

  // Should be fast
  expect(timePerComputed).toBeLessThan(0.2);
});

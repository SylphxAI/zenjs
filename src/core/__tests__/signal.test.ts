import { describe, it, expect, vi } from 'vitest';
import { signal } from '../signal.js';
import { effect } from '../effect.js';

describe('signal', () => {
  it('creates a signal with initial value', () => {
    const count = signal(0);
    expect(count()).toBe(0);
    expect(count.value).toBe(0);
  });

  it('updates signal value', () => {
    const count = signal(0);
    count.value = 5;
    expect(count()).toBe(5);
    expect(count.value).toBe(5);
  });

  it('does not notify if value is the same', () => {
    const count = signal(0);
    const fn = vi.fn();

    effect(() => {
      count();
      fn();
    });

    expect(fn).toHaveBeenCalledTimes(1);

    count.value = 0; // Same value
    expect(fn).toHaveBeenCalledTimes(1); // Should not run again
  });

  it('notifies effects when value changes', async () => {
    const count = signal(0);
    const results: number[] = [];

    effect(() => {
      results.push(count());
    });

    expect(results).toEqual([0]);

    count.value = 1;
    await vi.waitFor(() => expect(results).toEqual([0, 1]));

    count.value = 2;
    await vi.waitFor(() => expect(results).toEqual([0, 1, 2]));
  });

  it('supports peek without tracking', () => {
    const count = signal(0);
    const fn = vi.fn();

    effect(() => {
      count.peek(); // Should not track
      fn();
    });

    count.value = 1;
    expect(fn).toHaveBeenCalledTimes(1); // Should not run again
  });

  it('handles multiple subscribers efficiently', async () => {
    const count = signal(0);
    const results1: number[] = [];
    const results2: number[] = [];
    const results3: number[] = [];

    effect(() => results1.push(count()));
    effect(() => results2.push(count()));
    effect(() => results3.push(count()));

    count.value = 1;

    await vi.waitFor(() => {
      expect(results1).toEqual([0, 1]);
      expect(results2).toEqual([0, 1]);
      expect(results3).toEqual([0, 1]);
    });
  });
});

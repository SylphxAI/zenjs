/**
 * ZenJS Core - Scheduler Implementation
 *
 * Batches updates in microtask for optimal performance
 */

import type { Effect } from './effect.js';

let updateQueue = new Set<Effect>();
let isScheduled = false;

/**
 * Schedule an effect to run in the next microtask
 */
export function scheduleUpdate(effect: Effect): void {
  updateQueue.add(effect);

  if (!isScheduled) {
    isScheduled = true;
    queueMicrotask(flushUpdates);
  }
}

/**
 * Flush all pending updates
 */
function flushUpdates(): void {
  isScheduled = false;

  // Iterate directly to avoid Array.from allocation
  const effectsToRun = updateQueue;
  updateQueue = new Set();

  // Run all effects
  for (const effect of effectsToRun) {
    if (!effect._isRunning) {
      effect.fn();
    }
  }

  // Handle any updates scheduled during flush
  if (updateQueue.size > 0) {
    isScheduled = true;
    queueMicrotask(flushUpdates);
  }
}

/**
 * Synchronously flush all pending updates
 */
export function flushSync(): void {
  if (updateQueue.size > 0) {
    flushUpdates();
  }
}

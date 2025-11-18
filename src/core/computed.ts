/**
 * ZenJS Core - Computed Implementation
 *
 * Lazy-evaluated derived state with automatic caching
 *
 * Key features:
 * - Only computes when read (lazy)
 * - Caches result until dependencies change
 * - Automatically tracks dependencies
 * - Can be subscribed like a Signal
 * - Uses .value API for consistency
 */

import { currentEffect, setCurrentEffect, type Effect } from './effect.js';
import { scheduleUpdate } from './scheduler.js';

const UNSET = Symbol('unset');

export interface Computed<T> {
  readonly value: T;
  peek(): T;
  _subscribers?: Set<Effect> | Effect[];
  _bitfield?: number;
  _version: number;
}

/**
 * Create a computed value that auto-tracks dependencies
 */
export function computed<T>(fn: () => T): Computed<T> {
  let cache: T | typeof UNSET = UNSET;
  let dirty = true;
  let subscribers: Effect[] | Set<Effect> | undefined;
  let bitfield = 0;

  // Effect for dependency tracking
  let computedEffect: Effect | undefined;

  const compute = () => {
    // Create effect for dependency tracking if needed
    if (!computedEffect) {
      computedEffect = {
        fn: () => {
          // Mark dirty and notify subscribers
          dirty = true;
          notifySubscribers();
        },
        dependencies: new Set(),
        _isRunning: false,
        _disposed: false,
      };
    }

    // Clear old dependencies
    computedEffect.dependencies.clear();

    // Track dependencies while computing
    const prevEffect = currentEffect;
    setCurrentEffect(computedEffect);

    try {
      const value = fn();
      cache = value;
      dirty = false;
      return value;
    } finally {
      setCurrentEffect(prevEffect);
    }
  };

  const comp = {} as Computed<T>;

  // .value getter (read-only)
  Object.defineProperty(comp, 'value', {
    get() {
      // Track this computed as a dependency
      const effect = currentEffect;
      if (effect) {
        addSubscriber(effect);
        effect.dependencies.add(comp);
      }

      // Compute if dirty or unset
      if (dirty || cache === UNSET) {
        return compute();
      }

      return cache as T;
    },
  });

  // Peek without tracking
  comp.peek = () => {
    if (dirty || cache === UNSET) {
      return compute();
    }
    return cache as T;
  };

  // Expose internal state as getters
  Object.defineProperty(comp, '_subscribers', {
    get() { return subscribers; },
  });

  Object.defineProperty(comp, '_bitfield', {
    get() { return bitfield; },
  });

  Object.defineProperty(comp, '_version', {
    get() { return 0; }, // Mark as signal-like for JSX runtime
  });

  function addSubscriber(effect: Effect): void {
    const BITFIELD_THRESHOLD = 32;

    if (!subscribers) {
      subscribers = new Array(BITFIELD_THRESHOLD);
      subscribers[0] = effect;
      bitfield = 1;
    } else if (Array.isArray(subscribers)) {
      let added = false;
      for (let i = 0; i < BITFIELD_THRESHOLD; i++) {
        if (!(bitfield & (1 << i))) {
          subscribers[i] = effect;
          bitfield |= 1 << i;
          added = true;
          break;
        }
      }

      if (!added) {
        const set = new Set<Effect>();
        for (let i = 0; i < BITFIELD_THRESHOLD; i++) {
          if (subscribers[i]) set.add(subscribers[i]);
        }
        set.add(effect);
        subscribers = set;
        bitfield = 0;
      }
    } else {
      subscribers.add(effect);
    }
  }

  function notifySubscribers(): void {
    if (!subscribers) return;

    if (Array.isArray(subscribers)) {
      // Optimized: iterate only set bits
      let bits = bitfield;
      let index = 0;

      while (bits) {
        if (bits & 1) {
          scheduleUpdate(subscribers[index]);
        }
        bits >>>= 1;
        index++;
      }
    } else {
      for (const sub of subscribers) {
        scheduleUpdate(sub);
      }
    }
  }

  return comp;
}

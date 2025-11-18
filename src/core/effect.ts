/**
 * ZenJS Core - Effect Implementation
 *
 * Tracks dependencies and re-runs when they change
 */

export interface Effect {
  fn: () => void;
  dependencies: Set<any>;
  cleanup?: () => void;
  _isRunning: boolean;
  _disposed: boolean;
}

// Global effect stack for dependency tracking
const effectStack: Effect[] = [];

export let currentEffect: Effect | undefined;

/**
 * Set the current effect (for internal use by computed)
 */
export function setCurrentEffect(effect: Effect | undefined): void {
  currentEffect = effect;
}

/**
 * Create an effect that runs when dependencies change
 */
export function effect(fn: () => void | (() => void)): () => void {
  const eff: Effect = {
    fn: () => {
      if (eff._disposed) return;

      // Cleanup previous run
      if (eff.cleanup) {
        eff.cleanup();
        eff.cleanup = undefined;
      }

      // Remove from old dependencies
      for (const dep of eff.dependencies) {
        if (dep._removeSubscriber) {
          dep._removeSubscriber(eff);
        }
      }

      // Clear old dependencies
      eff.dependencies.clear();

      // Run with tracking
      const previousEffect = currentEffect;
      currentEffect = eff;
      eff._isRunning = true;

      try {
        const result = fn();
        if (typeof result === 'function') {
          eff.cleanup = result;
        }
      } finally {
        currentEffect = previousEffect;
        eff._isRunning = false;
      }
    },
    dependencies: new Set(),
    _isRunning: false,
    _disposed: false,
  };

  // Run immediately
  eff.fn();

  // Return dispose function
  return () => {
    eff._disposed = true;

    if (eff.cleanup) {
      eff.cleanup();
    }

    // Remove from all dependencies
    for (const dep of eff.dependencies) {
      if (dep._removeSubscriber) {
        dep._removeSubscriber(eff);
      }
    }

    eff.dependencies.clear();
  };
}

/**
 * Run a function without tracking dependencies
 */
export function untrack<T>(fn: () => T): T {
  const previousEffect = currentEffect;
  currentEffect = undefined;
  try {
    return fn();
  } finally {
    currentEffect = previousEffect;
  }
}

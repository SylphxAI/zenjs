/**
 * ZenJS - Ultra-fast, ultra-lightweight reactive framework
 *
 * Beyond SolidJS in performance and simplicity.
 * Powered by @sylphx/zen reactive core.
 */

// Core primitives from @sylphx/zen
import {
  zen,
  computed as zenComputed,
  effect as zenEffect,
  batch as zenBatch,
  untrack as zenUntrack,
  peek as zenPeek,
  subscribe as zenSubscribe,
} from '@sylphx/zen';

// Re-export with ZenJS naming
export { zen as signal };
export { zenComputed as computed };
export { zenEffect as effect };
export { zenBatch as batch };
export { zenUntrack as untrack };
export { zenPeek as peek };
export { zenSubscribe as subscribe };

// Components
export { For } from './components/For.js';
export { Show } from './components/Show.js';
export { Switch, Match } from './components/Switch.js';

// JSX
export { render, Fragment } from './jsx-runtime.js';

// Types
export type { Zen as Signal, ComputedZen as Computed } from '@sylphx/zen';

import { bench, describe } from 'vitest';
import { signal as zenSignal } from '../signal.js';
import { effect as zenEffect } from '../effect.js';
import { createSignal as solidSignal, createEffect as solidEffect } from 'solid-js';

describe('Signal Performance: ZenJS vs SolidJS', () => {
  bench('ZenJS: Create 1000 signals', () => {
    for (let i = 0; i < 1000; i++) {
      zenSignal(i);
    }
  });

  bench('SolidJS: Create 1000 signals', () => {
    for (let i = 0; i < 1000; i++) {
      solidSignal(i);
    }
  });

  bench('ZenJS: Read signal 10000 times', () => {
    const count = zenSignal(0);
    for (let i = 0; i < 10000; i++) {
      count();
    }
  });

  bench('SolidJS: Read signal 10000 times', () => {
    const [count] = solidSignal(0);
    for (let i = 0; i < 10000; i++) {
      count();
    }
  });

  bench('ZenJS: Write signal 1000 times', () => {
    const count = zenSignal(0);
    for (let i = 0; i < 1000; i++) {
      count.value = i;
    }
  });

  bench('SolidJS: Write signal 1000 times', () => {
    const [, setCount] = solidSignal(0);
    for (let i = 0; i < 1000; i++) {
      setCount(i);
    }
  });

  bench('ZenJS: Signal with 10 effects', () => {
    const count = zenSignal(0);
    let sum = 0;

    for (let i = 0; i < 10; i++) {
      zenEffect(() => {
        sum += count();
      });
    }

    for (let i = 0; i < 100; i++) {
      count.value = i;
    }
  });

  bench('SolidJS: Signal with 10 effects', () => {
    const [count, setCount] = solidSignal(0);
    let sum = 0;

    for (let i = 0; i < 10; i++) {
      solidEffect(() => {
        sum += count();
      });
    }

    for (let i = 0; i < 100; i++) {
      setCount(i);
    }
  });

  bench('ZenJS: Complex dependency graph', () => {
    const a = zenSignal(1);
    const b = zenSignal(2);
    const c = zenSignal(3);

    let result = 0;
    zenEffect(() => {
      result = a() + b() + c();
    });

    for (let i = 0; i < 100; i++) {
      a.value = i;
      b.value = i * 2;
      c.value = i * 3;
    }
  });

  bench('SolidJS: Complex dependency graph', () => {
    const [a, setA] = solidSignal(1);
    const [b, setB] = solidSignal(2);
    const [c, setC] = solidSignal(3);

    let result = 0;
    solidEffect(() => {
      result = a() + b() + c();
    });

    for (let i = 0; i < 100; i++) {
      setA(i);
      setB(i * 2);
      setC(i * 3);
    }
  });
});

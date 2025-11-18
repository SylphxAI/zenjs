/**
 * ZenJS JSX Runtime
 *
 * Renders JSX to fine-grained reactive DOM
 */

import { effect } from './core/effect.js';
import type { Signal } from './core/signal.js';

export { Fragment } from './core/fragment.js';

type Props = Record<string, any>;
type Child = Node | string | number | boolean | null | undefined;

/**
 * JSX factory function
 */
export function jsx(
  type: string | Function,
  props: Props | null,
): Node {
  const { children, ...restProps } = props || {};

  // Component
  if (typeof type === 'function') {
    return type({ ...restProps, children });
  }

  // Element
  const element = document.createElement(type);

  // Set properties and attributes
  if (restProps) {
    for (const [key, value] of Object.entries(restProps)) {
      setAttribute(element, key, value);
    }
  }

  // Append children
  if (children !== undefined) {
    appendChild(element, children);
  }

  return element;
}

export const jsxs = jsx;
export const jsxDEV = jsx;

/**
 * Set attribute/property on element
 */
function setAttribute(element: Element, key: string, value: any): void {
  // Ref callback
  if (key === 'ref') {
    if (typeof value === 'function') {
      value(element);
    }
    return;
  }

  // Event listener
  if (key.startsWith('on')) {
    const eventName = key.slice(2).toLowerCase();
    element.addEventListener(eventName, value);
    return;
  }

  // Reactive value (Signal or Computed)
  if (typeof value === 'object' && value !== null && '_version' in value) {
    const signal = value as Signal;

    // Special handling for form control values - don't use effect
    // to avoid interfering with user input
    if (key === 'value' && (element instanceof HTMLInputElement ||
                             element instanceof HTMLTextAreaElement ||
                             element instanceof HTMLSelectElement)) {
      (element as any)[key] = signal.value;
      return;
    }

    effect(() => {
      setStaticAttribute(element, key, signal.value);
    });
    return;
  }

  // Static value
  setStaticAttribute(element, key, value);
}

/**
 * Set static attribute value
 */
function setStaticAttribute(element: Element, key: string, value: any): void {
  // Class name
  if (key === 'className' || key === 'class') {
    element.className = String(value);
    return;
  }

  // Style
  if (key === 'style') {
    if (typeof value === 'string') {
      (element as HTMLElement).style.cssText = value;
    } else if (typeof value === 'object') {
      Object.assign((element as HTMLElement).style, value);
    }
    return;
  }

  // Property vs attribute
  if (key in element) {
    (element as any)[key] = value;
  } else {
    element.setAttribute(key, String(value));
  }
}

/**
 * Append child to element
 */
function appendChild(parent: Element, child: any): void {
  if (child === null || child === undefined || child === false) {
    return;
  }

  // Array of children
  if (Array.isArray(child)) {
    for (const c of child) {
      appendChild(parent, c);
    }
    return;
  }

  // Reactive child (Signal or Computed)
  if (typeof child === 'object' && child !== null && '_version' in child) {
    const signal = child as Signal;
    const textNode = document.createTextNode('');
    parent.appendChild(textNode);

    effect(() => {
      const value = signal.value;
      textNode.data = String(value ?? '');
    });
    return;
  }

  // Node
  if (child instanceof Node) {
    parent.appendChild(child);
    return;
  }

  // Text
  parent.appendChild(document.createTextNode(String(child)));
}

/**
 * Render component to container
 */
export function render(component: () => Node, container: Element): () => void {
  const node = component();
  container.appendChild(node);

  return () => {
    container.removeChild(node);
  };
}

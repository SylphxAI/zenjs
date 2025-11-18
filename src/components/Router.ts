/**
 * ZenJS Simple Router
 *
 * Client-side routing without page reload
 *
 * Features:
 * - Hash-based routing
 * - Reactive route matching
 * - Navigation with history
 */

import { zen as signal, computed, effect, untrack } from '@sylphx/zen';

// Current route (lazy initialization for SSR/test compatibility)
export const currentRoute = signal(
  typeof window !== 'undefined' ? window.location.hash.slice(1) || '/' : '/'
);

// Navigate to route
export function navigate(path: string) {
  if (typeof window !== 'undefined') {
    window.location.hash = path;
  }
}

// Listen to hash changes (browser only)
if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    currentRoute.value = window.location.hash.slice(1) || '/';
  });
}

interface RouteProps {
  path: string;
  component: () => Node;
}

interface RouterProps {
  routes: RouteProps[];
  fallback?: () => Node;
}

/**
 * Router component - Client-side routing
 *
 * @example
 * <Router routes={[
 *   { path: '/', component: () => <Home /> },
 *   { path: '/about', component: () => <About /> },
 * ]} />
 */
export function Router(props: RouterProps): Node {
  const { routes, fallback } = props;

  const marker = document.createComment('router');
  let currentNode: Node | null = null;
  let currentDispose: (() => void) | undefined;
  let effectDispose: (() => void) | undefined;

  // Wait for marker to be in DOM before setting up effect
  queueMicrotask(() => {
    // Effect to update on route change
    effectDispose = effect(() => {
      // Get current route
      const path = currentRoute.value;
      const route = routes.find(r => r.path === path) || null;

      console.log('[Router] Effect fired:', { path, route: route?.path, hasParent: !!marker.parentNode });

      // Cleanup previous
      if (currentNode && currentNode.parentNode) {
        currentNode.parentNode.removeChild(currentNode);
        currentNode = null;
      }
      if (currentDispose) {
        currentDispose();
        currentDispose = undefined;
      }

      // Render new route
      currentNode = untrack(() => {
        if (route) {
          console.log('[Router] Rendering route:', route.path);
          return route.component();
        } else if (fallback) {
          console.log('[Router] Rendering fallback');
          return fallback();
        } else {
          console.log('[Router] Rendering 404');
          return document.createTextNode('404 Not Found');
        }
      });

      console.log('[Router] Current node:', currentNode, 'Parent:', marker.parentNode);

      // Insert into DOM
      if (currentNode && marker.parentNode) {
        marker.parentNode.insertBefore(currentNode, marker);
        console.log('[Router] Inserted node into DOM');

        if ((currentNode as any)._dispose) {
          currentDispose = (currentNode as any)._dispose;
        }
      } else {
        console.log('[Router] Cannot insert - missing node or parent');
      }

      return undefined;
    });
  });

  // Cleanup
  (marker as any)._dispose = () => {
    if (effectDispose) {
      effectDispose();
    }
    if (currentNode && currentNode.parentNode) {
      currentNode.parentNode.removeChild(currentNode);
    }
    if (currentDispose) {
      currentDispose();
    }
  };

  return marker;
}

/**
 * Link component - Navigation link
 */
interface LinkProps {
  href: string;
  children: Node | string;
  class?: string;
}

export function Link(props: LinkProps): Node {
  const { href, children, ...restProps } = props;

  const a = document.createElement('a');
  a.href = `#${href}`;

  // Set attributes
  for (const [key, value] of Object.entries(restProps)) {
    if (key === 'class') {
      a.className = String(value);
    } else {
      a.setAttribute(key, String(value));
    }
  }

  // Append children
  if (typeof children === 'string') {
    a.textContent = children;
  } else if (children instanceof Node) {
    a.appendChild(children);
  }

  // Prevent default and navigate
  a.addEventListener('click', (e) => {
    e.preventDefault();
    navigate(href);
  });

  return a;
}

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

import { zen as signal, computed } from '@sylphx/zen';

// Current route
export const currentRoute = signal(window.location.hash.slice(1) || '/');

// Navigate to route
export function navigate(path: string) {
  window.location.hash = path;
}

// Listen to hash changes
window.addEventListener('hashchange', () => {
  currentRoute.value = window.location.hash.slice(1) || '/';
});

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

  // Find matching route
  const matchedRoute = computed(() => {
    const path = currentRoute.value;
    return routes.find(r => r.path === path) || null;
  });

  // Update on route change
  const updateRoute = () => {
    // Cleanup previous
    if (currentNode && currentNode.parentNode) {
      currentNode.parentNode.removeChild(currentNode);
    }
    if (currentDispose) {
      currentDispose();
    }

    // Render new route
    const route = matchedRoute.value;
    if (route) {
      currentNode = route.component();
    } else if (fallback) {
      currentNode = fallback();
    } else {
      currentNode = document.createTextNode('404 Not Found');
    }

    // Insert
    if (currentNode && marker.parentNode) {
      marker.parentNode.insertBefore(currentNode, marker);

      if ((currentNode as any)._dispose) {
        currentDispose = (currentNode as any)._dispose;
      }
    }
  };

  // Initial render
  updateRoute();

  // Watch for route changes
  let lastRoute = matchedRoute.value;
  const checkRoute = () => {
    if (matchedRoute.value !== lastRoute) {
      lastRoute = matchedRoute.value;
      updateRoute();
    }
    requestAnimationFrame(checkRoute);
  };
  requestAnimationFrame(checkRoute);

  // Cleanup
  (marker as any)._dispose = () => {
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

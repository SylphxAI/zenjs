import { AnyZen } from '@sylphx/zen';
export { ComputedZen as Computed, Zen as Signal, batch, computed, effect, peek, zen as signal, subscribe, untrack } from '@sylphx/zen';
export { Fragment, render } from './jsx-runtime.js';

/**
 * ZenJS For Component
 *
 * High-performance keyed list rendering with fine-grained updates
 *
 * Features:
 * - Keyed reconciliation (only updates changed items)
 * - Efficient DOM operations (minimal moves)
 * - Memory efficient (reuses nodes)
 */

interface ForProps<T, U extends Node> {
    each: T[] | AnyZen;
    children: (item: T, index: () => number) => U;
    fallback?: Node;
}
/**
 * For component - Keyed list rendering
 *
 * @example
 * <For each={items}>
 *   {(item, index) => <div>{item.name}</div>}
 * </For>
 */
declare function For<T, U extends Node>(props: ForProps<T, U>): Node;

/**
 * ZenJS Show Component
 *
 * Conditional rendering with fine-grained reactivity
 *
 * Features:
 * - Only renders active branch
 * - Destroys inactive branch (cleanup)
 * - Supports fallback
 */

interface ShowProps<T> {
    when: T | AnyZen | (() => T);
    fallback?: Node | (() => Node);
    children: Node | ((value: T) => Node);
}
/**
 * Show component - Conditional rendering
 *
 * @example
 * <Show when={isLoggedIn} fallback={<Login />}>
 *   <Dashboard />
 * </Show>
 *
 * // With function children (gets the truthy value)
 * <Show when={user}>
 *   {(u) => <div>Hello {u.name}</div>}
 * </Show>
 */
declare function Show<T>(props: ShowProps<T>): Node;

/**
 * ZenJS Switch/Match Components
 *
 * Multi-branch conditional rendering
 *
 * Features:
 * - Only renders first matching branch
 * - Efficient branch switching
 * - Supports fallback
 */

interface SwitchProps {
    fallback?: Node | (() => Node);
    children: Node[];
}
interface MatchProps<T> {
    when: T | AnyZen | (() => T);
    children: Node | ((value: T) => Node);
}
/**
 * Match component - Single branch in Switch
 *
 * @example
 * <Match when={route === 'home'}>
 *   <Home />
 * </Match>
 */
declare function Match<T>(props: MatchProps<T>): Node;
/**
 * Switch component - Multi-branch conditional
 *
 * @example
 * <Switch fallback={<NotFound />}>
 *   <Match when={route === 'home'}><Home /></Match>
 *   <Match when={route === 'about'}><About /></Match>
 * </Switch>
 */
declare function Switch(props: SwitchProps): Node;

/**
 * ZenJS Portal Component
 *
 * Render children into a different part of the DOM tree
 *
 * Features:
 * - Render outside parent hierarchy
 * - Useful for modals, tooltips, popovers
 * - Maintains reactive context
 */
interface PortalProps {
    mount?: Element;
    children: Node;
}
/**
 * Portal component - Render children into different DOM location
 *
 * @example
 * <Portal mount={document.body}>
 *   <Modal>...</Modal>
 * </Portal>
 */
declare function Portal(props: PortalProps): Node;

/**
 * ZenJS ErrorBoundary Component
 *
 * Catch and handle errors in component tree
 *
 * Features:
 * - Catch render errors
 * - Display fallback UI
 * - Error recovery
 */
interface ErrorBoundaryProps {
    fallback: (error: Error, reset: () => void) => Node;
    children: Node | (() => Node);
}
/**
 * ErrorBoundary component - Catch errors in component tree
 *
 * @example
 * <ErrorBoundary fallback={(error, reset) => (
 *   <div>
 *     <h1>Error: {error.message}</h1>
 *     <button onClick={reset}>Retry</button>
 *   </div>
 * )}>
 *   <App />
 * </ErrorBoundary>
 */
declare function ErrorBoundary(props: ErrorBoundaryProps): Node;

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
declare const currentRoute: any;
declare function navigate(path: string): void;
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
declare function Router(props: RouterProps): Node;
/**
 * Link component - Navigation link
 */
interface LinkProps {
    href: string;
    children: Node | string;
    class?: string;
}
declare function Link(props: LinkProps): Node;

export { ErrorBoundary, For, Link, Match, Portal, Router, Show, Switch, currentRoute, navigate };

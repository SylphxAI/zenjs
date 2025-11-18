/**
 * Fragment component for grouping children
 */
declare function Fragment(props: {
    children?: any;
}): DocumentFragment;

/**
 * ZenJS JSX Runtime
 *
 * Renders JSX to fine-grained reactive DOM
 * Powered by @sylphx/zen reactive core
 */

type Props = Record<string, any>;
/**
 * JSX factory function
 */
declare function jsx(type: string | Function, props: Props | null): Node;
declare const jsxs: typeof jsx;
declare const jsxDEV: typeof jsx;
/**
 * Render component to container
 */
declare function render(component: () => Node, container: Element): () => void;

export { Fragment, jsx, jsxDEV, jsxs, render };

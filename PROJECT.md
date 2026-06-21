# ZenJS

`zenjs` is an active foundation repository for the `zenjs` reactive UI
framework powered by `@sylphx/zen`. It owns the package exports, JSX/runtime
surface, reactive UI components, benchmarks, demo app, website, release
workflow, and documentation used by framework consumers.

## Lifecycle And Layer

- Lifecycle: `active`
- Layer: `foundation`

## Goals

- Provide a small reactive UI framework with documented package exports and
  examples.
- Keep framework runtime, JSX helpers, built-in components, benchmarks, demo
  app, website, and release workflow coherent.
- Preserve consumer-neutral framework behavior on top of public `@sylphx/zen`
  exports.

## Non-Goals

- Own one product's UI design system, routing policy, application state model,
  component library, or performance claim.
- Own `@sylphx/zen` internals beyond documented package consumption.
- Publish enterprise doctrine, org rulesets, rollout issue reconciliation, or
  shared CI policy.

## Boundaries

This repository owns the `zenjs` package and its repo-local demos/docs.
Consumers must depend on documented package exports, not internal source paths
or website/demo internals. Product-specific UI policy belongs in consuming
applications.

## Public Surfaces

- `README.md`, `BENCHMARKS.md`, and setup docs document package usage and
  claims.
- `package.json`, `src/index.ts`, and `src/jsx-runtime.ts` define package
  exports.
- `src/components/` defines framework-provided components.
- `demo-app/` and `website/` provide examples and documentation surfaces.
- `.github/workflows/release.yml` delegates releases to the central reusable
  workflow.
- `.doctrine/project.json` is the machine-readable project manifest.

## Delivery

No pull-request CI workflow is currently present. Main pushes run the central
release workflow. Framework changes should be proven with build, typecheck,
tests, benchmark evidence for changed performance claims, demo/website smoke,
and package readback after release. Published package behavior is forward-fix
operationally because source revert alone does not unpublish a package.

The authoritative control-plane record is `.doctrine/project.json`.

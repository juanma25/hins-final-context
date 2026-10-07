<!--
Sync Impact Report
Version: TEMPLATE → 1.0.0 (initial ratification)
Modified principles: N/A (first fill of template placeholders)
Added sections: Core Principles (I-V), Technology & Quality Standards, Development Workflow, Governance
Removed sections: none
Templates requiring updates:
  - .specify/templates/plan-template.md ⚠ pending (verify Constitution Check gate references these principles)
  - .specify/templates/spec-template.md ⚠ pending (verify no conflicting mandatory sections)
  - .specify/templates/tasks-template.md ⚠ pending (verify task categories cover type-safety/testing/perf gates)
Follow-up TODOs:
  - TODO(RATIFICATION_DATE): original adoption date unknown; set to today's date (2026-07-16) as first ratification.
-->

# Hins Constitution

## Core Principles

### I. Type Safety First
All code MUST be written in TypeScript with strict mode enabled; `any` is
prohibited except at verified external-data boundaries (API responses,
third-party libs without types), and each such use MUST be paired with a
runtime validation or explicit type guard. Data models for proyectos,
parques, dispositivos and related entities MUST have a single source-of-truth
type definition shared across API routes, server components, and UI.

**Rationale**: This app is the system of record for project/park/device data;
silent type mismatches lead to corrupted or misdisplayed operational data.

### II. Component & Server/Client Boundary Discipline
Next.js App Router conventions MUST be followed: Server Components by default;
`"use client"` only where interactivity/state/browser APIs require it. Data
fetching and mutations for parques/dispositivos/proyectos MUST happen in
Server Components, Route Handlers, or Server Actions — never via client-side
fetch calls to internal endpoints without a Route Handler boundary. Shared UI
MUST be built from the existing shadcn/Radix primitives in the design system
rather than duplicated bespoke components.

**Rationale**: Consistent boundaries keep data-fetching secure, performant,
and centrally auditable, and prevent component duplication drift across
dashboards.

### III. Test-First for Data & Business Logic (NON-NEGOTIABLE)
Any function that transforms, validates, or aggregates domain data (project
status, park/device relationships, metrics) MUST have tests written before
implementation. Tests fail first (Red), then implementation makes them pass
(Green), then refactor. Pure UI presentation components are exempt but any
logic extracted into hooks/utils is not.

**Rationale**: Domain calculations (counts, statuses, relations between
parques/dispositivos/proyectos) are the parts most costly to get silently
wrong; tests are the cheapest guardrail available now, before a test runner
exists in the repo — adding one is a prerequisite of adopting this principle.

### IV. Consistent, Accessible UI
All UI changes MUST reuse existing design tokens (Tailwind config, CSS
variables) and shadcn/Radix components instead of introducing ad-hoc styles.
Interactive elements MUST be keyboard-navigable and meet WCAG 2.1 AA contrast
and labeling requirements. Any new visual pattern used more than once MUST be
extracted into a shared component under the project's component library.

**Rationale**: The dashboards serve as the primary operational tool for
tracking proyectos/parques/dispositivos; inconsistent or inaccessible UI
directly degrades usability for daily operators.

### V. Simplicity & Reviewable Change
Prefer the smallest change that satisfies a requirement; no speculative
abstractions, feature flags, or config layers for hypothetical future needs.
Every PR MUST be scoped to one coherent change and pass `npm run lint` and
`npm run build` (or `tsc --noEmit`) before merge. Dependencies MUST NOT be
added for functionality achievable with existing project dependencies.

**Rationale**: Small, buildable, lint-clean changes keep review fast and keep
the growing data model (proyectos, parques, dispositivos, and related
entities) legible over time.

## Technology & Quality Standards

Stack is fixed as: Next.js (App Router) + React + TypeScript + Tailwind CSS +
shadcn/Radix UI. New dependencies require explicit justification in the PR
description (why existing stack can't satisfy the need). A test runner
(e.g. Vitest or Jest) MUST be introduced before Principle III can be enforced
in CI; until then, Principle III applies to manual test-first discipline and
this MUST be revisited as a follow-up amendment once the runner lands.

## Development Workflow

Every feature/fix follows: spec → plan → tasks → implement (via the
speckit.* workflow already in this repo) for non-trivial changes; trivial
fixes (typos, single-line corrections) may skip spec/plan but still require
lint+build to pass. Code review MUST verify compliance with all five
principles above before approval; any exception MUST be documented inline in
the PR with rationale, per the Simplicity principle's spirit of justified
complexity.

## Governance

This constitution supersedes ad-hoc conventions and prior undocumented
practice. Amendments require: (1) a documented rationale, (2) a version bump
per semantic versioning (MAJOR for incompatible principle removal/redefinition,
MINOR for new/expanded principles, PATCH for clarifications), (3) propagation
review across `.specify/templates/*.md` and this file's dependents. All PRs
and reviews MUST verify compliance with these principles; unresolved
violations block merge unless explicitly justified in the PR.

**Version**: 1.0.0 | **Ratified**: 2026-07-16 | **Last Amended**: 2026-07-16

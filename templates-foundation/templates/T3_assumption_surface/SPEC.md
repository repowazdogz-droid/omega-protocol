# T3 — Assumption Surface — SPEC

## Purpose
A static spatial template that makes assumptions visible as surfaces/volumes and shows:
- which assumptions are carrying the reasoning
- where assumptions conflict
- where assumptions are missing or unknown

This template reduces hidden overreach by turning assumptions into inspectable objects.

## What This IS
- An assumption map rendered as geometry
- A clarity tool for teams and individuals
- A way to audit reasoning foundations

## What This IS NOT
- A truth engine
- A data validation tool
- A simulator or predictor
- A recommendation system
- A replacement for domain expertise

## Core Grammar (Toggleable Layers)
1) BASE STRUCTURE (Structure)
- The "thing being reasoned about" as minimal geometry
- Can be abstract: box/room/workspace/system boundary

2) ASSUMPTION VOLUMES (Structure)
Assumptions as translucent volumes:
- Each volume = one assumption
- Opacity = confidence band (illustrative, not numeric)

Statuses (required):
- Known (supported)
- Assumed (reasonable but unverified)
- Unknown (missing or unclear)
- Contested (disputed)

3) CONFLICTS / INTERSECTIONS (Constraints)
Where assumptions overlap in incompatible ways:
- Intersection region highlighted
- Each conflict has a named reason:
  - logical contradiction
  - scope mismatch
  - measurement mismatch
  - incompatible definitions
  - missing dependency

4) UNCERTAINTY / MISSINGNESS (Uncertainty)
Areas where assumptions do not cover the space:
- "unsupported regions"
- gaps between volumes
- weakly grounded zones

## Interaction (Inherited Contract)
Allowed:
- camera orbit/pan/zoom
- toggles: Base / Assumptions / Conflicts / Uncertainty
- click to inspect an assumption or conflict region
- reset view

Disallowed:
- editing assumptions in the UI (V1)
- simulation, time, prediction
- recommendations ("therefore you should…")

## Inspector Fields (Required)
For an ASSUMPTION:
- Name (short)
- Type (definition/method/data/ethics/scope)
- Status (Known/Assumed/Unknown/Contested)
- Confidence band (low/med/high — illustrative)
- "If false, what breaks?" (1 line)
- "What this is NOT" (1 line)

For a CONFLICT:
- Conflict name
- Assumptions involved (A, B, …)
- Reason category (from list)
- "Why it matters" (1 line)
- "What this is NOT" (e.g., not a verdict)

## Calm Completion Criterion
Done when:
- a user can point to the scene and name 3–7 assumptions
- conflicts are visible and explainable
- unknown/unsupported regions exist and are not hidden
- nothing implies truth, prediction, or advice

## Default Example Set (Domain-Agnostic)
Assumptions (6–8):
- Boundary assumption (what's included)
- Measurement assumption (what counts)
- Stability assumption (things don't change quickly)
- Independence assumption (factors are separable)
- Definition assumption (terms mean the same thing)
- Ethical assumption (acceptable risk)

Conflicts (2–3):
- Definition mismatch
- Scope mismatch
- Measurement mismatch






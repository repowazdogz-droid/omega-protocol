# T2 — Causal Map (Non-Temporal) — SPEC

## Purpose
A static, explorable causal influence surface that helps humans understand:
- what influences what
- which links are uncertain
- which causal claims are disallowed or unsupported

This template does NOT simulate time and does NOT predict outcomes.

## What This IS
- A structured influence map
- A reasoning scaffold for complex systems
- A way to visualize uncertainty in causal links

## What This IS NOT
- A simulator
- A forecasting tool
- A causal discovery engine
- A decision-maker
- A recommendation system

## Core Layers (Toggleable)
1) NODES (Structure)
- Components, variables, concepts, stakeholders, subsystems
- Each node has a type + short definition

2) LINKS (Influence)
- Directed edges: A → B means "A influences B"
- Link has: sign (+/-/mixed), strength band (low/med/high), and evidence tag

3) UNCERTAINTY (Uncertainty)
- Halo/opacity on links and nodes:
  - Known (solid)
  - Assumed (semi)
  - Unknown (faint)
  - Contested (striped/dashed)

4) CONSTRAINTS ON CAUSALITY (Constraints)
- "Disallowed links" shown as blocked/dimmed edges with reason:
  - Mechanistically impossible
  - Violates scope (outside system boundary)
  - Evidence insufficient
  - Confounded / cannot be inferred here

## Interaction Contract (Inherited)
Allowed:
- camera orbit/pan/zoom
- toggles for Nodes/Links/Uncertainty/Constraints
- click node/link to inspect metadata
- reset view

Disallowed:
- timelines, animation, "run"
- prediction ("then Y will happen")
- optimization or advice

## Inspector Fields (Required)
For a NODE:
- Name
- Type (component/variable/person/process/etc.)
- Role (input/output/latent/constraint/etc.)
- Status (Known/Assumed/Unknown/Contested)
- Definition (1–2 lines)
- "What this is NOT" (1 line)

For a LINK:
- From → To
- Influence sign: + / - / mixed / unknown
- Strength band: low / med / high (illustrative)
- Evidence tag: observed / theoretical / assumed / unknown
- Confounders (if any): short list or "not assessed"
- "What this is NOT" (e.g., "not a prediction")

## Calm Completion Criterion
Done when:
- a user can explain the system's influence structure in <60 seconds
- uncertainty is visible and not apologised for
- nothing suggests forecasting or control

## Example Safe Domains (illustrative)
- robotics subsystem dependencies
- clinical workflow influences
- research claim dependency graphs
- product/system design trade-offs
- organisational bottlenecks (non-prescriptive)






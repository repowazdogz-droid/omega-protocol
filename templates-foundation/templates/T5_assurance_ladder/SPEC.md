# T5 — Assurance Ladder (Outcome Classes) — SPEC

## Purpose
A domain-agnostic "assurance-first" outcome ladder:
- defines what can be guaranteed under degradation
- separates capability from agency
- supports safe communication under uncertainty

## What This IS
- A classification of outcome guarantees
- A way to map uncertainty + remaining control to bounded outcomes

## What This IS NOT
- Control logic
- Automation
- A policy engine
- A persuasion tool
- A risk score generator

## Core Grammar (Toggleable Layers)
1) HEALTH INPUTS (Inputs)
- "What is degraded?" categories (sensor, actuation, model, environment, human, ops)
- Confidence band for detection (high/med/low)

2) REMAINING AUTHORITY (Authority)
- A1 near-nominal
- A2 reduced
- A3 marginal stabilization
- A4 uncontrolled

3) OUTCOME CLASSES (Outcomes)
S1 Stabilize & Assess (bounded, time-limited)
S2 Controlled execution (bounded rate/attitude/energy)
S3 Degraded execution (protect environment/people over asset)
S4 Termination / harm minimization only

4) OVERRIDES (Constraints)
- "Ethical/environmental overrides" that disallow certain outcomes

5) TRACE (Audit)
- each mapping is explainable as: inputs → authority → outcome

## Interaction (Inherited Contract)
Allowed:
- orbit/pan/zoom
- toggles for layers
- click an outcome to inspect "what's guaranteed"
- click an override to inspect "what is disallowed and why"

Disallowed:
- operational thresholds
- step-by-step procedures
- implying certification/compliance

## Inspector Fields (Required)
Outcome class:
- Guarantee (1–2 lines)
- When it is allowed
- When it is disallowed
- NOT THIS (not a promise; not operational)

Override:
- Trigger condition (conceptual)
- Disallowed pairings
- Why it exists

## Calm Completion Criterion
Done when someone can explain:
- "This is what we can guarantee under these conditions."
Not:
- "This is what we'll do."






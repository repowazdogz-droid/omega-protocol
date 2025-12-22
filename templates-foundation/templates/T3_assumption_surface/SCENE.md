# T3 — Assumption Surface — SCENE

## Visual Goal
A calm spatial "assumption landscape":
- A base boundary volume (the system boundary)
- 6–8 translucent assumption volumes inside it
- 2–3 highlighted conflict intersections
- 1–2 unsupported regions (gaps) made visible as faint haze

No animation. No time. No simulation.

## Default Layout (Room + Volumes)
### Base Structure (name: "Base")
- A simple "room" or boundary box:
  - thin wireframe outline
  - subtle floor grid
- Purpose: shows scope without realism

### Assumptions (name: "Assumptions")
Each assumption is a translucent volume (box/sphere/capsule).
Keep them visually distinct by shape/size/position, not by color dependence.

Statuses (visual, illustrative):
- Known: more solid (higher opacity)
- Assumed: medium opacity
- Unknown: faint opacity
- Contested: faint + ring overlay (or "shell")

Confidence band (illustrative):
- low: very faint
- medium: medium opacity
- high: most solid (still translucent)

### Conflicts (name: "Conflicts")
Conflict regions are explicit geometry placed where two assumptions overlap.
Render as:
- a small "intersection" volume
- slightly brighter edge outline
- labeled only in Inspector (no on-scene text required)

Conflict reasons (pick from):
- Definition mismatch
- Scope mismatch
- Measurement mismatch
- Dependency missing
- Logical contradiction

### Unsupported Regions (name: "Uncertainty")
Show 1–2 "gaps" where assumptions do not cover.
Render as:
- faint fog-like sphere or translucent shell
- explicitly not an obstacle
- purpose: "this part is not covered by stated assumptions"

## Minimum Example Set (Domain-Agnostic)
Assumption volumes (6–8):
A1 Boundary: what's included
A2 Measurement: what counts as evidence
A3 Stability: what changes slowly
A4 Independence: factors separable
A5 Definition: terms are consistent
A6 Ethics: acceptable risk/impact
Optional:
A7 Data completeness
A8 Generalization

Conflicts (2–3):
C1 Definition mismatch: A5 vs A2
C2 Scope mismatch: A1 vs A7
C3 Measurement mismatch: A2 vs A4

Unsupported regions (1–2):
U1 "Not covered by assumptions"
U2 "Assumed-away complexity"

## Interaction (Inherited Contract)
Allowed:
- orbit/pan/zoom
- toggles: Base / Assumptions / Conflicts / Uncertainty
- click assumption/conflict volumes to inspect
- reset view

Disallowed:
- editing assumptions in UI
- scoring "quality"
- "fix this" recommendations
- simulation/time

## Completion Test (60 seconds)
You can say:
- "These are assumptions, not facts."
- "These overlaps are incompatibilities."
- "This area is not covered."
Without sounding like a verdict.






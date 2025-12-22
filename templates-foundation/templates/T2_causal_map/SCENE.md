# T2 — Causal Map (Non-Temporal) — SCENE

## Visual Goal
A static influence map in 2.5D:
- nodes as simple spheres/tiles
- links as thin directed lines
- uncertainty as halos/opacity
- "disallowed" causal links as blocked/dimmed with reasons

No animation. No time. No simulation.

## Default Layout (2.5D Ring + Clusters)
- A "core" cluster in the center (3–5 nodes)
- 2–3 peripheral clusters (2–4 nodes each)
- Sparse links between clusters
- Keep total nodes ≤ 12 for the base template example

Rationale:
- Easy to read
- Easy to explain
- Works across domains

## Scene Elements (Minimal, Fixed)
### 1) Nodes Group (name: "Nodes")
- Node shapes:
  - Default: small sphere or rounded tile
- Node visual encoding:
  - Known: solid
  - Assumed: semi-transparent
  - Unknown: faint
  - Contested: faint + dashed outline (or "ring" overlay)
- Node label:
  - Short name only (≤ 2 words)
  - Full definition in Inspector only

### 2) Links Group (name: "Links")
- Directed edges rendered as lines with subtle arrowhead marker
- Link encoding:
  - Sign:
    - Positive: arrowhead only (no color dependence required)
    - Negative: double-arrowhead or small "—" marker near midline
    - Mixed/unknown: dotted line
  - Strength band (illustrative only):
    - Low: thin line
    - Medium: normal line
    - High: slightly thicker line
  - Evidence tag (shown only in Inspector)

Important:
- Strength band is not numeric
- Never show percentages or scores on links

### 3) Uncertainty Group (name: "Uncertainty")
- Halos around nodes/links
- Opacity encodes confidence:
  - Known: minimal halo
  - Assumed: light halo
  - Unknown: larger halo, lower opacity
  - Contested: halo + dashed ring

### 4) Constraints Group (name: "Causality Constraints")
Used to display "disallowed" or "unsupported" links:
- A blocked-link glyph: line is dimmed with an "X" marker at midpoint
- Optional short reason label on hover/inspect only (Inspector recommended)

Constraint reasons (pick one):
- Mechanistically impossible
- Outside boundary
- Evidence insufficient
- Confounded / not inferable here

## Interaction (Inherited Contract)
Allowed:
- orbit/pan/zoom
- toggles: Nodes / Links / Uncertainty / Causality Constraints
- click node/link to inspect
- reset view

Disallowed:
- drag nodes (V1)
- timelines
- animation
- "run"
- forecasting

## Minimum Example Dataset (Template Defaults)
Provide a generic example that is domain-agnostic:
Nodes (12 max):
- Input A, Input B
- Process 1, Process 2
- State X, State Y
- Constraint C
- Output 1, Output 2
- Context K
- Unknown U
- Confounder Z

Links:
- 10–18 links total
- 2–3 disallowed links with reasons
- At least 4 links marked Assumed/Unknown/Contested

## Completion Test
You can point at the map and say:
- "These are influences, not predictions."
- "These links are uncertain, and we show that."
- "These causal moves are disallowed, and we say why."
In under 60 seconds.






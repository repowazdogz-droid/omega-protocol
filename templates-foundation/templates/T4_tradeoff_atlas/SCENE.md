# T4 — Tradeoff Atlas — SCENE

## Visual Goal
A calm spatial map of tradeoffs:
- Objectives pull in different directions
- Constraints carve the feasible region
- A "tradeoff front" highlights unavoidable tension
- Uncertainty shows where feasibility is unknown

No optimization. No recommendation. No prediction.
This is a visibility tool, not a solver.

## Layers (Toggleable)
### 1) Objectives (name: "Objectives")
Show 4 objective anchors as simple markers around the scene (not axes with numbers):
- Safety
- Cost
- Speed
- Quality

Each is a point/label only.
No ranking. No "best".

### 2) Constraints (name: "Constraints")
Show 4 constraint planes/walls that cut space:
- Physics (what can't be done)
- Budget (what can't be afforded)
- Time (what can't be achieved within the window)
- Ethics (what cannot be justified)

Constraints are conceptual barriers, not real walls.

### 3) Feasible Region (name: "Feasible Region")
A translucent "blob" or rounded volume representing:
- "Possible under constraints"
This region is illustrative only.

### 4) Tradeoff Front (name: "Tradeoff Front")
A highlighted band/curve inside the feasible region that says:
- "Improving one objective tends to cost another"
This is not computed. It is a visual teaching object.

### 5) Uncertainty (name: "Uncertainty")
1–2 faint haze volumes indicating:
- "Unknown feasibility"
- "Assumption-driven area"

## Selection / Inspector Objects
Selectable:
- Objective anchors
- Constraint planes
- Feasible region
- Tradeoff front
- Uncertainty regions

Each selection must include:
- meaning (1–2 lines)
- what it trades against / forbids / implies
- NOT THIS (explicit)

## Default Placement (Simple, Stable)
- Feasible Region centered at (0, 0, 0)
- Tradeoff Front as a curved band cutting across it
- Objective anchors placed in a ring around center
- Constraint planes placed like partial "walls" that clearly cut through the blob
- Uncertainty haze placed partially overlapping the blob edge

## Calm Completion Criterion
Done when a viewer can say:
- "Constraints shape what's possible."
- "Objectives pull against each other."
- "This doesn't tell us what to do."
And the scene still feels static and non-agentic.

## Hard Boundaries
Disallowed in V1:
- sliders that "solve"
- numerical scoring
- recommendation copy ("choose X")
- computed Pareto fronts
- any implication of optimization

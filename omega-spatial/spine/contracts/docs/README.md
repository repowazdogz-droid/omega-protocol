# Omega Spine Contracts

Purpose:
- Provide machine-readable contracts that connect Omega Spatial (visual reasoning) to Omega Compute (execution).
- Keep Omega Spatial non-executing: Spatial exports contracts; Compute consumes them.

Non-negotiables:
- Human-led. Non-autonomous. Visual reasoning only.
- Not a simulation: no run buttons, no prediction, no optimization.
- Contracts describe structure/bounds; they do not execute anything.

Contract set:
- SpatialSurface: a declared reasoning surface (room + elements + layers)
- Element: an inspectable object (node, constraint, assumption, etc.)
- Bounds: explicit scope/limits
- Uncertainty: explicit unknowns/assumptions/confidence
- Artifact: a saved view / snapshot reference (non-executing)

Validation:
- All executable systems must consume only validated contracts.
- No undeclared assumptions.
- No unbounded variables.
- Every claim must reference evidence or be tagged as assumption/unknown.



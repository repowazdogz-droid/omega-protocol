# T4 — Tradeoff Atlas — SPEC

## Purpose
A static spatial template that helps humans see tradeoffs without "optimizing" or recommending.
Shows how constraints shape the feasible region and where objectives tension each other.

## What This IS
- A tradeoff visualization surface
- A constraint-aware reasoning aid
- A way to show "you can't have everything at once"

## What This IS NOT
- An optimizer
- A planner
- A recommendation system
- A decision-maker
- A performance predictor

## Core Grammar (Toggleable Layers)
1) OBJECTIVES (Objectives)
- 3–5 objectives as labeled axes or anchors (e.g., safety, cost, speed, usability, accuracy)
- Objectives are not ranked by default

2) CONSTRAINTS (Constraints)
- Hard constraints as "walls/planes" or boundary outlines
- Each constraint has a reason tag (physics, regulation, budget, ethics, time)

3) FEASIBLE REGION (Structure)
- A translucent region showing "what is possible under constraints"
- No numeric scales required; shape is illustrative

4) TRADEOFF FRONT (Structure)
- A highlighted band/curve showing "you improve X by giving up Y"
- Still illustrative, not computed

5) UNCERTAINTY (Uncertainty)
- Regions where feasibility is unknown or assumption-driven

## Interaction (Inherited Contract)
Allowed:
- orbit/pan/zoom
- toggles for layers
- click objective/constraint/region to inspect
- reset view

Disallowed:
- sliders that "solve"
- recommendations ("choose this")
- claiming "best"
- simulation or prediction

## Inspector Fields (Required)
Objective:
- Name
- Meaning (1 line)
- What it tends to trade against (1 line)
- NOT THIS (not "best")

Constraint:
- Name
- Type (physics/reg/budget/ethics/time)
- What it forbids (1 line)
- Why it exists (1 line)
- NOT THIS (not advice)

Region (feasible/front/uncertainty):
- What it represents
- What's assumed
- What would reduce uncertainty

## Calm Completion Criterion
Done when someone can say:
- "These constraints shape what's possible."
- "These objectives pull against each other."
Without asking "what should we do?"






# INTERACTION CONTRACT (LOW-FRICTION, ALWAYS THE SAME)

This contract prevents scope creep and reduces cognitive load.
Every template must follow it unless explicitly marked "EXPERIMENTAL".

## Allowed Interactions (DEFAULT)
1) Camera: orbit / pan / zoom
2) Layer toggles: show/hide groups
3) Inspect: click/select an element to see metadata
4) Reset View: camera-only reset

## Disallowed Interactions (DEFAULT)
- dragging joints
- moving objects
- playing timelines
- running simulations
- generating trajectories
- recommending actions
- "best" or "optimal" outputs
- auto-advancing states

## Inspector Requirements
Every selectable element must show:
- Element name
- Layer (Structure / Constraints / Uncertainty / Envelope)
- Status tag: Known | Assumed | Unknown | Conservative
- A one-line callout that states what it is NOT

Example callout:
"This is a conceptual constraint surface, not a command or plan."

## Reset View Rules
Reset View must:
- only reset camera position + target
- never change scene state
- never "apply" anything

## Copy Tone Rules (Summary)
- neutral, descriptive language
- no hype
- no persuasion
- no conclusions
- no hidden claims






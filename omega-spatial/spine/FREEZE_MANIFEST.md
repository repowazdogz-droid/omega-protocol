# Omega Spatial v1.0 — Freeze Manifest

This document lists everything that is frozen in Omega Spatial v1.0.

---

## Frozen Rooms (5)

1. **ConstraintRoom** (V1 locked)
   - Lock file: `ConstraintRoom/LOCKED/V1_LOCK.md`
   - Layers: Structure, Constraints, Assumptions, Uncertainty
   - Interactions: Camera, toggles, selection, reset view

2. **CausalRoom** (V1 locked)
   - Lock file: `CausalRoom/LOCKED/V1_LOCK.md`
   - Layers: Nodes, Links, Disallowed Links, Uncertainty
   - Interactions: Camera, toggles, selection, reset view

3. **AssumptionRoom** (V1 locked)
   - Lock file: `AssumptionRoom/LOCKED/V1_LOCK.md`
   - Layers: Assumptions, Conflicts, Unsupported, Uncertainty
   - Interactions: Camera, toggles, selection, reset view

4. **TradeoffRoom** (V1 locked)
   - Lock file: `TradeoffRoom/LOCKED/V1_LOCK.md`
   - Layers: Objectives, Constraints, Feasible Region, Tradeoff Front, Uncertainty
   - Interactions: Camera, toggles, selection, reset view

5. **AssuranceRoom** (V1 locked)
   - Lock file: `AssuranceRoom/LOCKED/V1_LOCK.md`
   - Layers: Inputs, Authority, Outcomes, Overrides, Trace
   - Interactions: Camera, toggles, selection, reset view

---

## Frozen Interactions

**Allowed (V1):**
- Camera orbit/pan/zoom (head pose)
- Layer toggles (visibility only)
- Tap-to-select (read-only Inspector)
- Reset View (camera/state reset only)
- Preset switching (metadata-only changes)

**Disallowed (V1):**
- Object manipulation (drag, grab, scale, rotate)
- Motion/animation/time evolution
- Physics simulation
- Control/execution actions
- Recommendations or "best" selections
- Optimization or solving
- Procedures or step-by-step instructions
- Certification or compliance claims

---

## Frozen Trust Language

**Canonical source:** `OmegaGallery/Docs/CANONICAL_TRUST_COPY.md`

**Frozen strings:**
- Footer: "Human-led. Non-autonomous. Visual reasoning only."
- Room trust line: "Human-led. Non-autonomous. Visual reasoning only. Not a simulation."
- Anti-misread: "Shows structure and boundaries — not decisions or advice."
- About core: "This is a spatial reasoning surface. It visualizes structure, constraints, and uncertainty to support human thinking. It does not simulate, control, predict, optimize, or recommend. Nothing moves unless you move the camera."

**Change policy:** Trust language is immutable. Changes require v2.0.

---

## Frozen Demo Behaviors

**DemoFlow (V1):**
- Script-based guidance (3 scripts)
- Room match indicators
- Pressure Mode Q&A
- No automatic navigation
- No automatic preset switching

**Gallery (V1):**
- 5 room cards
- Demo Mode toggle
- DemoFlow toggle
- Trust footer always visible

**Gallery (V1.1):**
- Preset pack picker (UI-only)
- Pack loading from bundled JSON
- Pack affects Inspector copy only (not geometry or interactions)

**Room Hosts (V1):**
- Back to Gallery button
- Trust line always visible
- Anti-misread when demoMode OFF
- No shared state between rooms

---

## Explicit "NOT INCLUDED" List

**Omega Spatial v1.0 does NOT include:**
- Motion or animation
- Simulation or physics
- Control or execution
- Prediction or forecasting
- Optimization or solving
- Recommendations or advice
- Procedures or checklists
- Certification or compliance tools
- Automatic navigation
- Automatic preset switching
- Telemetry or analytics
- Recording or playback
- Voice control
- Multi-user collaboration
- Export of operational data
- Integration with external systems
- Real-time data feeds
- Autonomous decision-making

**If a feature is not explicitly listed as "Allowed" above, it is NOT INCLUDED in v1.0.**

---

## Change Policy

**v1.0 is immutable:**
- Bug fixes allowed (v1.0.x)
- New rooms allowed (v1.x)
- Breaking changes require v2.0

**To modify v1.0:**
1. Justify why change is necessary
2. Determine version bump (patch/minor/major)
3. Update relevant lock files
4. Update this manifest
5. Update version badge

**Default answer:** Do not modify v1.0. Create v1.1 or v2.0 instead.

---

**This manifest is frozen with v1.0.**


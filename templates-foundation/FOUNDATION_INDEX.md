# Omega Spatial Templates — Foundation Index

This repo contains **static, non-operational, human-led spatial reasoning templates**.
They are **not** simulators, not planners, not control systems, and do not recommend actions.

Core rule: **Show structure + uncertainty. Never "solve."**

---

## ✅ V1 — Spatial Demo (Robot Workspace)
**Purpose:** A calm, static "trust surface" that proves: camera + layers + selection + neutral inspector.

**Shows:** structure / reach / constraints / uncertainty  
**Does NOT do:** motion, control, simulation, predictions

**Use when:** you need a safe, instantly understandable demo.

---

## ✅ T2 — Causal Map (Nodes + Links)
**Purpose:** Show influence pathways and where links are unsupported/disallowed.

**Shows:** nodes, causal links, disallowed links, uncertainty halos  
**Does NOT do:** causal claims, conclusions, optimization

**Use when:** someone says "X causes Y" and you want the structure without the argument.

---

## ✅ T3 — Assumption Surface (Assumptions + Conflicts + Unsupported)
**Purpose:** Make assumptions visible and show where the framing breaks.

**Shows:** assumptions, conflicts, unsupported regions, uncertainty  
**Does NOT do:** verdicts, "fix the model," ranking assumptions

**Use when:** teams disagree but can't locate why.

---

## ✅ T4 — Tradeoff Atlas (Objectives + Constraints + Feasible + Front)
**Purpose:** Show tradeoffs and constraints without turning it into a decision engine.

**Shows:** objectives, constraint planes, feasible region, tradeoff front, uncertainty  
**Does NOT do:** best choice, computed Pareto, sliders, scoring

**Use when:** someone wants "the best option" and you want to show why tradeoffs exist first.

---

## ✅ T5 — Assurance Ladder (Inputs + Authority + Outcomes + Overrides + Trace)
**Purpose:** A domain-agnostic "what can be guaranteed" ladder under degradation.

**Shows:** inputs, authority bands (A1–A4), outcome classes (S1–S4), overrides, traceability  
**Does NOT do:** procedures, thresholds, certification claims, control logic

**Use when:** safety / autonomy / clinical / compliance people are in the room.

---

# Best Demo Order (5–8 minutes)

### 1) V1 (30–60s)
"This is the interaction contract: static, inspectable, non-operational."

### 2) T3 (60–90s)
"Here's where assumptions and conflicts live."

### 3) T4 (60–90s)
"Here's why 'best' is often impossible: constraints shape feasibility, objectives pull apart."

### 4) T5 (60–90s)
"Here's how we talk about guarantees under uncertainty—without pretending it's a control system."

### 5) T2 (optional, 60s)
"When you need causal structure—without overclaiming."

---

# The Trust Contract (Always Say This)
- Human-led
- Non-autonomous
- Static, visual reasoning only
- No optimization, no advice, no prediction
- Uncertainty is shown, not hidden

If it feels like a simulator or decision engine, it has failed.

---

# Fast "Which Template Do I Use?"
- Disagreement / confusion → **T3**
- "What's the best?" → **T4**
- Safety / autonomy / clinical assurances → **T5**
- "X causes Y" debate → **T2**
- Quick safe demo → **V1**

---

# Locked Files
Each template has a LOCKED.md.
If a change violates LOCKED.md, revert it.

END.






import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function buildScene(scene) {
  const inputsGroup = new THREE.Group(); inputsGroup.name = "Inputs";
  const authorityGroup = new THREE.Group(); authorityGroup.name = "Authority";
  const outcomesGroup = new THREE.Group(); outcomesGroup.name = "Outcomes";
  const overridesGroup = new THREE.Group(); overridesGroup.name = "Overrides";
  const traceGroup = new THREE.Group(); traceGroup.name = "Trace";

  scene.add(inputsGroup, authorityGroup, outcomesGroup, overridesGroup, traceGroup);

  // ---------- Helpers ----------
  function tagSelectable(obj, meta) {
    obj.userData.omegaMeta = meta;
    obj.name = meta.name;
    obj.userData.layer = meta.layer;
    obj.userData.status = meta.status;
    obj.userData.note = meta.note;
  }

  const tileMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, depthWrite: false });
  const tileEdgeMat = new THREE.LineBasicMaterial({ color: 0x444455 });

  const ladderMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.14, depthWrite: false });
  const ladderEdgeMat = new THREE.LineBasicMaterial({ color: 0x2a6a66, transparent: true, opacity: 0.9 });

  const overrideMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.10, depthWrite: false });
  const overrideEdgeMat = new THREE.LineBasicMaterial({ color: 0x888899, transparent: true, opacity: 0.9 });

  const traceMat = new THREE.LineBasicMaterial({ color: 0x666688, transparent: true, opacity: 0.7 });

  function makePanel({ name, group, layer, status, note, pos, size }) {
    const geom = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mesh = new THREE.Mesh(geom, tileMat);
    mesh.position.set(pos.x, pos.y, pos.z);

    tagSelectable(mesh, { name, layer, status, note });

    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geom), tileEdgeMat);
    edges.position.copy(mesh.position);
    edges.name = `${name} Outline`;
    edges.userData.nonSelectable = true;

    group.add(mesh, edges);
    return mesh;
  }

  function makeLadderStep({ name, label, guarantee, allowed, disallowed, pos }) {
    const geom = new THREE.BoxGeometry(6.2, 1.2, 2.4);
    const mesh = new THREE.Mesh(geom, ladderMat);
    mesh.position.set(pos.x, pos.y, pos.z);

    tagSelectable(mesh, {
      name: `${label} — ${name}`,
      layer: "Outcomes",
      status: "Assurance-bounded",
      note:
`Guarantee: ${guarantee}
When allowed: ${allowed}
When disallowed: ${disallowed}

NOT THIS: Not a promise; not operational; not certification.`
    });

    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geom), ladderEdgeMat);
    edges.position.copy(mesh.position);
    edges.name = `${label} Outline`;
    edges.userData.nonSelectable = true;

    outcomesGroup.add(mesh, edges);
    return mesh;
  }

  function makeOverride({ name, trigger, disallows, why, pos }) {
    const geom = new THREE.BoxGeometry(5.4, 0.9, 2.1);
    const mesh = new THREE.Mesh(geom, overrideMat);
    mesh.position.set(pos.x, pos.y, pos.z);

    tagSelectable(mesh, {
      name,
      layer: "Overrides",
      status: "Hard constraint",
      note:
`Trigger (conceptual): ${trigger}
Disallowed pairings: ${disallows}
Why it exists: ${why}

NOT THIS: Not policy enforcement; not legal advice; not a procedure.`
    });

    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geom), overrideEdgeMat);
    edges.position.copy(mesh.position);
    edges.name = `${name} Outline`;
    edges.userData.nonSelectable = true;

    overridesGroup.add(mesh, edges);
    return mesh;
  }

  function makeTraceLine(from, to, label) {
    const points = [from.clone(), to.clone()];
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geom, traceMat);
    line.name = `Trace: ${label}`;
    line.userData.nonSelectable = true;
    traceGroup.add(line);
    return line;
  }

  // ---------- Inputs (tiles) ----------
  // Left side: "What degraded?" + "Detection confidence"
  makePanel({
    name: "Fault domain (conceptual)",
    group: inputsGroup,
    layer: "Inputs",
    status: "Input",
    note:
`Categories (illustrative): sensor, actuation, model, environment, human, ops.
Purpose: a shared language for "what is degraded".

NOT THIS: Not a diagnosis; not a detection algorithm.`,
    pos: { x: -10.0, y: 2.6, z: 0.0 },
    size: { x: 5.2, y: 2.2, z: 2.0 }
  });

  makePanel({
    name: "Detection confidence",
    group: inputsGroup,
    layer: "Inputs",
    status: "Input",
    note:
`Bands: high / medium / low (illustrative).
Meaning: how stable and consistent the fault evidence is.

NOT THIS: Not a numeric probability; not a guarantee.`,
    pos: { x: -10.0, y: 0.2, z: 0.0 },
    size: { x: 5.2, y: 2.2, z: 2.0 }
  });

  // ---------- Authority (A1–A4) ----------
  // Middle-left vertical band
  const aPosX = -2.8;
  const aZ = 0.0;

  makePanel({
    name: "A1 — Near-nominal",
    group: authorityGroup,
    layer: "Authority",
    status: "Authority band",
    note:
`Meaning: control authority largely intact.
Interpretation: stabilization + bounded control remain plausible.

NOT THIS: Not a performance claim.`,
    pos: { x: aPosX, y: 3.4, z: aZ },
    size: { x: 4.6, y: 1.0, z: 1.9 }
  });

  makePanel({
    name: "A2 — Reduced",
    group: authorityGroup,
    layer: "Authority",
    status: "Authority band",
    note:
`Meaning: reduced authority or axis-limited control.
Interpretation: control may be bounded but degraded.

NOT THIS: Not a thresholded classifier.`,
    pos: { x: aPosX, y: 2.2, z: aZ },
    size: { x: 4.6, y: 1.0, z: 1.9 }
  });

  makePanel({
    name: "A3 — Marginal stabilization",
    group: authorityGroup,
    layer: "Authority",
    status: "Authority band",
    note:
`Meaning: barely maintaining stability.
Interpretation: outcomes shift toward harm minimization.

NOT THIS: Not a procedure.`,
    pos: { x: aPosX, y: 1.0, z: aZ },
    size: { x: 4.6, y: 1.0, z: 1.9 }
  });

  makePanel({
    name: "A4 — Uncontrolled",
    group: authorityGroup,
    layer: "Authority",
    status: "Authority band",
    note:
`Meaning: uncontrolled / ballistic / non-governable.
Interpretation: termination / mitigation only.

NOT THIS: Not an instruction.`,
    pos: { x: aPosX, y: -0.2, z: aZ },
    size: { x: 4.6, y: 1.0, z: 1.9 }
  });

  // ---------- Outcomes (S1–S4 ladder) ----------
  const sX = 7.0;

  const s1 = makeLadderStep({
    name: "Stabilize & Assess",
    label: "S1",
    guarantee: "Buys bounded time to regain a clearer state, if stability permits.",
    allowed: "When authority and environment allow time-bounded stabilization.",
    disallowed: "When time-to-criticality is immediate or stability cannot be held.",
    pos: { x: sX, y: 3.4, z: 0.0 }
  });

  const s2 = makeLadderStep({
    name: "Controlled execution",
    label: "S2",
    guarantee: "Maintains bounded control while committing to a controlled outcome.",
    allowed: "When authority is sufficient and overrides do not prohibit the outcome.",
    disallowed: "When environment/ethics disallow controlled execution.",
    pos: { x: sX, y: 2.2, z: 0.0 }
  });

  const s3 = makeLadderStep({
    name: "Degraded execution",
    label: "S3",
    guarantee: "Prioritizes reducing external harm over asset preservation.",
    allowed: "When control is marginal but some attitude/energy shaping remains.",
    disallowed: "When control cannot be maintained for a bounded interval.",
    pos: { x: sX, y: 1.0, z: 0.0 }
  });

  const s4 = makeLadderStep({
    name: "Termination / mitigation only",
    label: "S4",
    guarantee: "Minimizes harm when control is effectively lost.",
    allowed: "When authority is lost or overrides force termination.",
    disallowed: "Rarely disallowed; this is the conservative end state.",
    pos: { x: sX, y: -0.2, z: 0.0 }
  });

  // ---------- Overrides (hard constraints) ----------
  const oX = 7.0;
  makeOverride({
    name: "Override: Human proximity",
    trigger: "People present in the potential impact region (conceptual).",
    disallows: "Outcomes that increase exposure or concentrate harm near people.",
    why: "Ethical constraint overrides capability.",
    pos: { x: oX, y: -1.6, z: -3.2 }
  });

  makeOverride({
    name: "Override: Unperceivable environment",
    trigger: "Environment cannot be assessed (e.g., sensor blindness).",
    disallows: "'Controlled' outcomes that require reliable perception.",
    why: "Prevents optimistic execution when observability is absent.",
    pos: { x: oX, y: -1.6, z: 0.0 }
  });

  makeOverride({
    name: "Override: Time-to-criticality",
    trigger: "Time window too short to stabilize/assess.",
    disallows: "Extended assessment when immediate commitment is required.",
    why: "Time dominates confidence under severe urgency.",
    pos: { x: oX, y: -1.6, z: 3.2 }
  });

  // ---------- Trace (illustrative connections) ----------
  // Inputs → Authority
  makeTraceLine(new THREE.Vector3(-7.5, 2.6, 0), new THREE.Vector3(-5.2, 2.2, 0), "inputs→authority");
  makeTraceLine(new THREE.Vector3(-7.5, 0.2, 0), new THREE.Vector3(-5.2, 1.0, 0), "confidence→authority");

  // Authority → Outcomes (simple illustrative mapping)
  makeTraceLine(new THREE.Vector3(-0.6, 3.4, 0), s1.position.clone().add(new THREE.Vector3(-3.2, 0, 0)), "A1→S1");
  makeTraceLine(new THREE.Vector3(-0.6, 2.2, 0), s2.position.clone().add(new THREE.Vector3(-3.2, 0, 0)), "A2→S2");
  makeTraceLine(new THREE.Vector3(-0.6, 1.0, 0), s3.position.clone().add(new THREE.Vector3(-3.2, 0, 0)), "A3→S3");
  makeTraceLine(new THREE.Vector3(-0.6, -0.2, 0), s4.position.clone().add(new THREE.Vector3(-3.2, 0, 0)), "A4→S4");

  // Outcomes → Overrides (shows overrides constrain outcomes)
  makeTraceLine(s2.position.clone().add(new THREE.Vector3(3.2, 0, 0)), new THREE.Vector3(7.0, -1.2, 0.0), "S2 constrained");
  makeTraceLine(s1.position.clone().add(new THREE.Vector3(3.2, 0, 0)), new THREE.Vector3(7.0, -1.2, 3.2), "S1 constrained");

  // Make trace layer selectable only as a concept (single invisible hitbox)
  const traceHit = new THREE.Mesh(
    new THREE.BoxGeometry(22, 8, 8),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0 })
  );
  traceHit.position.set(-1.0, 1.0, 0.0);
  tagSelectable(traceHit, {
    name: "Trace (auditability)",
    layer: "Trace",
    status: "Explainable",
    note:
`Meaning: Each mapping is explainable as inputs → authority → outcome, constrained by overrides.
Purpose: auditability and shared language.

NOT THIS: Not a proof; not certification; not a control law.`
  });
  traceGroup.add(traceHit);

  return { inputsGroup, authorityGroup, outcomesGroup, overridesGroup, traceGroup };
}

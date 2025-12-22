import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function buildScene(scene) {
  // Groups required by the layer grammar
  const baseGroup = new THREE.Group(); baseGroup.name = "Base";
  const assumptionsGroup = new THREE.Group(); assumptionsGroup.name = "Assumptions";
  const conflictsGroup = new THREE.Group(); conflictsGroup.name = "Conflicts";
  const uncertaintyGroup = new THREE.Group(); uncertaintyGroup.name = "Uncertainty";

  scene.add(baseGroup, assumptionsGroup, conflictsGroup, uncertaintyGroup);

  // ---------- Helpers ----------
  function tagSelectable(obj, meta) {
    obj.userData.omegaMeta = meta;
    obj.name = meta.name;
    obj.userData.layer = meta.layer;
    obj.userData.status = meta.status;
    obj.userData.note = meta.note;
  }

  const matKnownHigh = new THREE.MeshStandardMaterial({ color: 0xddf1ff, transparent: true, opacity: 0.55 });
  const matAssumedMed = new THREE.MeshStandardMaterial({ color: 0xddf1ff, transparent: true, opacity: 0.35 });
  const matUnknownLow = new THREE.MeshStandardMaterial({ color: 0xddf1ff, transparent: true, opacity: 0.18 });
  const matContested = new THREE.MeshStandardMaterial({ color: 0xffdddd, transparent: true, opacity: 0.28 });

  const ringMat = new THREE.LineBasicMaterial({ color: 0xcccccc });

  function makeRing(pos, r = 1.2) {
    const curve = new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * 2, false, 0);
    const pts2 = curve.getPoints(64).map(p => new THREE.Vector3(p.x, 0, p.y));
    const geom = new THREE.BufferGeometry().setFromPoints(pts2);
    const line = new THREE.LineLoop(geom, ringMat);
    line.position.copy(pos);
    return line;
  }

  function makeAssumption({
    id, shortName, type, status, band,
    statement, breaksIfFalse,
    pos, shape
  }) {
    let geom;
    if (shape === "box") geom = new THREE.BoxGeometry(2.2, 1.4, 2.2);
    else if (shape === "sphere") geom = new THREE.SphereGeometry(1.25, 28, 28);
    else geom = new THREE.CapsuleGeometry(0.9, 1.2, 10, 24);

    let mat = matAssumedMed;
    if (status === "Known") mat = matKnownHigh;
    if (status === "Unknown") mat = matUnknownLow;
    if (status === "Contested") mat = matContested;

    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(pos.x, pos.y, pos.z);

    tagSelectable(mesh, {
      name: `${id} — ${shortName}`,
      layer: "Assumptions",
      status: status,
      note:
`Type: ${type}
Confidence band: ${band} (illustrative)
Statement: ${statement}
If false, what breaks: ${breaksIfFalse}

NOT THIS: This is not a verified fact or a verdict.`
    });

    assumptionsGroup.add(mesh);

    // Contested ring overlay (visual-only, not selectable)
    if (status === "Contested") {
      const ring = makeRing(mesh.position.clone().add(new THREE.Vector3(0, -0.9, 0)), 1.4);
      ring.name = `${id} Contested Ring`;
      assumptionsGroup.add(ring);
    }

    return mesh;
  }

  // ---------- Base boundary (room) ----------
  const roomSize = new THREE.Vector3(16, 8, 16);

  const roomGeom = new THREE.BoxGeometry(roomSize.x, roomSize.y, roomSize.z);
  const roomEdges = new THREE.EdgesGeometry(roomGeom);
  const roomLine = new THREE.LineSegments(roomEdges, new THREE.LineBasicMaterial({ color: 0x444455 }));
  roomLine.position.set(0, 2, 0);
  roomLine.name = "System Boundary";

  // make boundary selectable (so Inspector can explain it)
  tagSelectable(roomLine, {
    name: "System Boundary",
    layer: "Base",
    status: "Known",
    note:
`Type: scope boundary
Meaning: Defines what is included in this framing.
If false, what breaks: Inferences may cross into out-of-scope territory.

NOT THIS: This is not a physical wall or real environment.`
  });

  baseGroup.add(roomLine);

  // ---------- Assumptions (6, domain-agnostic) ----------
  makeAssumption({
    id: "A1",
    shortName: "Boundary",
    type: "scope",
    status: "Known",
    band: "high",
    statement: "The system boundary contains the relevant factors for this question.",
    breaksIfFalse: "Key influences may sit outside the map.",
    pos: { x: -4.5, y: 1.2, z: -3.5 },
    shape: "box"
  });

  makeAssumption({
    id: "A2",
    shortName: "Measurement",
    type: "method",
    status: "Assumed",
    band: "medium",
    statement: "The chosen measurements represent what we claim they represent.",
    breaksIfFalse: "Evidence labels and link confidence become unreliable.",
    pos: { x: 4.0, y: 1.0, z: -3.0 },
    shape: "capsule"
  });

  makeAssumption({
    id: "A3",
    shortName: "Stability",
    type: "data",
    status: "Assumed",
    band: "medium",
    statement: "Relevant properties do not change rapidly within the reasoning window.",
    breaksIfFalse: "Any 'steady' interpretation becomes unsafe.",
    pos: { x: -1.0, y: 1.0, z: 4.0 },
    shape: "sphere"
  });

  makeAssumption({
    id: "A4",
    shortName: "Independence",
    type: "method",
    status: "Unknown",
    band: "low",
    statement: "Factors can be treated as separable without strong interaction effects.",
    breaksIfFalse: "Single-factor reasoning will mislead.",
    pos: { x: 5.5, y: 1.2, z: 3.8 },
    shape: "box"
  });

  makeAssumption({
    id: "A5",
    shortName: "Definitions",
    type: "definition",
    status: "Contested",
    band: "low",
    statement: "Key terms mean the same thing across sources/teams.",
    breaksIfFalse: "Agreement becomes superficial; conflicts hide in language.",
    pos: { x: -6.2, y: 1.2, z: 2.5 },
    shape: "capsule"
  });

  makeAssumption({
    id: "A6",
    shortName: "Ethics",
    type: "ethics",
    status: "Assumed",
    band: "medium",
    statement: "The risk/impact bounds used here are acceptable for this context.",
    breaksIfFalse: "'Safe' conclusions become illegitimate.",
    pos: { x: 1.8, y: 1.1, z: -6.2 },
    shape: "sphere"
  });

  // ---------- Conflicts (explicit regions) ----------
  const conflictMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.18,
    depthWrite: false
  });

  function makeConflict({ id, name, assumptions, reason, whyItMatters, pos, size }) {
    const geom = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mesh = new THREE.Mesh(geom, conflictMat);
    mesh.position.set(pos.x, pos.y, pos.z);

    tagSelectable(mesh, {
      name: `${id} — ${name}`,
      layer: "Conflicts",
      status: "Contested",
      note:
`Assumptions involved: ${assumptions.join(", ")}
Reason: ${reason}
Why it matters: ${whyItMatters}

NOT THIS: This is not "error" — it is an incompatibility within the current framing.`
    });

    conflictsGroup.add(mesh);

    // Edge outline for legibility (visual only)
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geom),
      new THREE.LineBasicMaterial({ color: 0xcccccc })
    );
    edges.position.copy(mesh.position);
    edges.name = `${id} Outline`;
    conflictsGroup.add(edges);

    return mesh;
  }

  makeConflict({
    id: "C1",
    name: "Definition mismatch",
    assumptions: ["A5 — Definitions", "A2 — Measurement"],
    reason: "definition mismatch",
    whyItMatters: "Measurements may not align with the terms used to interpret them.",
    pos: { x: -1.2, y: 1.0, z: -0.8 },
    size: { x: 3.0, y: 1.2, z: 2.2 }
  });

  makeConflict({
    id: "C2",
    name: "Scope mismatch",
    assumptions: ["A1 — Boundary", "A4 — Independence"],
    reason: "scope mismatch",
    whyItMatters: "Important interactions may exist outside the chosen boundary or violate separability.",
    pos: { x: 2.8, y: 1.1, z: 1.8 },
    size: { x: 3.2, y: 1.2, z: 2.6 }
  });

  makeConflict({
    id: "C3",
    name: "Measurement mismatch",
    assumptions: ["A2 — Measurement", "A3 — Stability"],
    reason: "measurement mismatch",
    whyItMatters: "If conditions change quickly, measurement assumptions may fail.",
    pos: { x: 1.0, y: 1.0, z: -2.6 },
    size: { x: 2.6, y: 1.1, z: 2.6 }
  });

  // ---------- Unsupported regions (gaps / not covered) ----------
  const hazeMat = new THREE.MeshStandardMaterial({
    color: 0x6688ff,
    transparent: true,
    opacity: 0.08,
    depthWrite: false
  });

  function makeUnsupported({ id, name, meaning, implication, pos, shape }) {
    let geom;
    if (shape === "sphere") geom = new THREE.SphereGeometry(1.6, 28, 28);
    else geom = new THREE.BoxGeometry(3.5, 1.6, 2.6);

    const mesh = new THREE.Mesh(geom, hazeMat);
    mesh.position.set(pos.x, pos.y, pos.z);

    tagSelectable(mesh, {
      name: `${id} — ${name}`,
      layer: "Uncertainty",
      status: "Unknown",
      note:
`Meaning: ${meaning}
Implication: ${implication}

NOT THIS: Not an obstacle. Not a hazard. Not a prediction.`
    });

    uncertaintyGroup.add(mesh);

    // faint outline for visibility (visual only)
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geom),
      new THREE.LineBasicMaterial({ color: 0x334466, transparent: true, opacity: 0.6 })
    );
    edges.position.copy(mesh.position);
    edges.name = `${id} Outline`;
    uncertaintyGroup.add(edges);

    return mesh;
  }

  makeUnsupported({
    id: "U1",
    name: "Not covered by assumptions",
    meaning: "This area is not covered by the stated assumptions.",
    implication: "Additional assumptions or evidence may be required.",
    pos: { x: -2.8, y: 1.2, z: 3.0 },
    shape: "box"
  });

  makeUnsupported({
    id: "U2",
    name: "Assumed-away complexity",
    meaning: "Complex interactions are currently treated as negligible or out of scope.",
    implication: "The framing may under-represent coupling effects.",
    pos: { x: 4.6, y: 1.2, z: -0.2 },
    shape: "sphere"
  });

  return { baseGroup, assumptionsGroup, conflictsGroup, uncertaintyGroup };
}

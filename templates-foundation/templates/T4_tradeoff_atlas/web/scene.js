import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function buildScene(scene) {
  const objectivesGroup = new THREE.Group(); objectivesGroup.name = "Objectives";
  const constraintsGroup = new THREE.Group(); constraintsGroup.name = "Constraints";
  const feasibleGroup = new THREE.Group(); feasibleGroup.name = "Feasible Region";
  const frontGroup = new THREE.Group(); frontGroup.name = "Tradeoff Front";
  const uncertaintyGroup = new THREE.Group(); uncertaintyGroup.name = "Uncertainty";

  scene.add(objectivesGroup, constraintsGroup, feasibleGroup, frontGroup, uncertaintyGroup);

  // ---------- Helpers ----------
  function tagSelectable(obj, meta) {
    obj.userData.omegaMeta = meta;
    obj.name = meta.name;
    obj.userData.layer = meta.layer;
    obj.userData.status = meta.status;
    obj.userData.note = meta.note;
  }

  // Materials (calm, minimal)
  const anchorMat = new THREE.MeshStandardMaterial({ color: 0xddddff, transparent: true, opacity: 0.9 });
  const anchorRingMat = new THREE.LineBasicMaterial({ color: 0x666688 });

  const constraintMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, depthWrite: false });
  const constraintEdgeMat = new THREE.LineBasicMaterial({ color: 0x444455 });

  const feasibleMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.12, depthWrite: false });
  const feasibleEdgeMat = new THREE.LineBasicMaterial({ color: 0x2a6a66, transparent: true, opacity: 0.8 });

  const frontMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, depthWrite: false });
  const frontEdgeMat = new THREE.LineBasicMaterial({ color: 0xcccccc });

  const hazeMat = new THREE.MeshStandardMaterial({ color: 0x6688ff, transparent: true, opacity: 0.08, depthWrite: false });
  const hazeEdgeMat = new THREE.LineBasicMaterial({ color: 0x334466, transparent: true, opacity: 0.6 });

  function makeRing(pos, r = 0.9) {
    const curve = new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * 2, false, 0);
    const pts2 = curve.getPoints(64).map(p => new THREE.Vector3(p.x, 0, p.y));
    const geom = new THREE.BufferGeometry().setFromPoints(pts2);
    const line = new THREE.LineLoop(geom, anchorRingMat);
    line.position.copy(pos);
    return line;
  }

  // ---------- Objectives (4 anchors) ----------
  function makeObjective({ name, meaning, tradeoff, pos }) {
    const geom = new THREE.SphereGeometry(0.45, 20, 20);
    const mesh = new THREE.Mesh(geom, anchorMat);
    mesh.position.set(pos.x, pos.y, pos.z);

    tagSelectable(mesh, {
      name,
      layer: "Objectives",
      status: "Neutral",
      note:
`Meaning: ${meaning}
Common tradeoff: ${tradeoff}

NOT THIS: Not a ranking. Not a target. Not a command.`
    });

    objectivesGroup.add(mesh);

    const ring = makeRing(mesh.position.clone().add(new THREE.Vector3(0, -0.55, 0)), 0.7);
    ring.name = `${name} Ring`;
    objectivesGroup.add(ring);

    return mesh;
  }

  makeObjective({
    name: "Safety",
    meaning: "Reducing harm and downside under uncertainty.",
    tradeoff: "Often trades against speed and cost.",
    pos: { x: -7.0, y: 0.6, z: 0.0 }
  });

  makeObjective({
    name: "Cost",
    meaning: "Reducing resource use (time, money, complexity).",
    tradeoff: "Often trades against quality or safety margin.",
    pos: { x: 0.0, y: 0.6, z: -7.0 }
  });

  makeObjective({
    name: "Speed",
    meaning: "Reducing time-to-deliver or time-to-act.",
    tradeoff: "Often trades against safety margin and quality.",
    pos: { x: 7.0, y: 0.6, z: 0.0 }
  });

  makeObjective({
    name: "Quality",
    meaning: "Increasing correctness, robustness, and usability.",
    tradeoff: "Often trades against speed and cost.",
    pos: { x: 0.0, y: 0.6, z: 7.0 }
  });

  // ---------- Constraints (4 planes/walls) ----------
  function makeConstraint({ name, ctype, forbids, why, pos, rotY, size }) {
    const geom = new THREE.PlaneGeometry(size.w, size.h);
    const mesh = new THREE.Mesh(geom, constraintMat);
    mesh.position.set(pos.x, pos.y, pos.z);
    mesh.rotation.y = rotY;

    // Outline for legibility
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geom),
      constraintEdgeMat
    );
    edges.position.copy(mesh.position);
    edges.rotation.copy(mesh.rotation);
    edges.name = `${name} Outline`;
    edges.userData.nonSelectable = true;

    tagSelectable(mesh, {
      name,
      layer: "Constraints",
      status: "Hard",
      note:
`Type: ${ctype}
What it forbids: ${forbids}
Why it exists: ${why}

NOT THIS: Not advice. Not a policy. Not "the right way".`
    });

    constraintsGroup.add(mesh);
    constraintsGroup.add(edges);
    return mesh;
  }

  makeConstraint({
    name: "Physics",
    ctype: "physics",
    forbids: "Actions outside physical capability or stability.",
    why: "Reality bounds what can be done.",
    pos: { x: -2.5, y: 1.5, z: 0.0 },
    rotY: Math.PI / 2,
    size: { w: 10, h: 6 }
  });

  makeConstraint({
    name: "Budget",
    ctype: "budget",
    forbids: "Options requiring resources not available.",
    why: "Finite resources constrain feasible choices.",
    pos: { x: 2.0, y: 1.3, z: -2.5 },
    rotY: 0,
    size: { w: 10, h: 5 }
  });

  makeConstraint({
    name: "Time",
    ctype: "time",
    forbids: "Options that cannot be achieved in the available window.",
    why: "Deadlines and time-to-criticality matter.",
    pos: { x: 2.8, y: 1.7, z: 2.3 },
    rotY: Math.PI / 4,
    size: { w: 9, h: 6 }
  });

  makeConstraint({
    name: "Ethics",
    ctype: "ethics",
    forbids: "Options that exceed acceptable impact or risk.",
    why: "Some tradeoffs are disallowed regardless of capability.",
    pos: { x: -1.0, y: 1.8, z: 2.8 },
    rotY: -Math.PI / 4,
    size: { w: 9, h: 6 }
  });

  // ---------- Feasible region (illustrative blob) ----------
  // Use a stretched sphere to avoid "engineered" shapes that look computed.
  const feasibleGeom = new THREE.SphereGeometry(2.6, 28, 28);
  const feasible = new THREE.Mesh(feasibleGeom, feasibleMat);
  feasible.position.set(0, 0.8, 0);
  feasible.scale.set(1.35, 0.75, 1.10);

  tagSelectable(feasible, {
    name: "Feasible Region",
    layer: "Feasible Region",
    status: "Illustrative",
    note:
`Meaning: Options that remain inside constraints.
Assumptions: Shape is illustrative, not computed.

NOT THIS: Not complete. Not guaranteed. Not validated.`
  });

  feasibleGroup.add(feasible);

  const feasibleEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(feasibleGeom),
    feasibleEdgeMat
  );
  feasibleEdges.position.copy(feasible.position);
  feasibleEdges.scale.copy(feasible.scale);
  feasibleEdges.name = "Feasible Outline";
  feasibleEdges.userData.nonSelectable = true;
  feasibleGroup.add(feasibleEdges);

  // ---------- Tradeoff front (illustrative band) ----------
  const frontGeom = new THREE.TorusGeometry(2.0, 0.20, 12, 40);
  const front = new THREE.Mesh(frontGeom, frontMat);
  front.position.set(0.2, 0.9, 0.1);
  front.rotation.x = Math.PI / 2.2;
  front.scale.set(1.05, 0.85, 1.0);

  tagSelectable(front, {
    name: "Tradeoff Front",
    layer: "Tradeoff Front",
    status: "Illustrative",
    note:
`Meaning: A visible tension zone between objectives.
Why it matters: Improving one dimension tends to cost another.

NOT THIS: Not computed. Not an optimum. Not a recommendation.`
  });

  frontGroup.add(front);

  const frontEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(frontGeom),
    frontEdgeMat
  );
  frontEdges.position.copy(front.position);
  frontEdges.rotation.copy(front.rotation);
  frontEdges.scale.copy(front.scale);
  frontEdges.name = "Front Outline";
  frontEdges.userData.nonSelectable = true;
  frontGroup.add(frontEdges);

  // ---------- Uncertainty regions (2 haze volumes) ----------
  function makeUncertainty({ name, meaning, reduce, pos, shape }) {
    let geom;
    if (shape === "sphere") geom = new THREE.SphereGeometry(1.6, 26, 26);
    else geom = new THREE.BoxGeometry(3.4, 1.6, 2.4);

    const mesh = new THREE.Mesh(geom, hazeMat);
    mesh.position.set(pos.x, pos.y, pos.z);

    tagSelectable(mesh, {
      name,
      layer: "Uncertainty",
      status: "Unknown",
      note:
`Meaning: ${meaning}
What would reduce uncertainty: ${reduce}

NOT THIS: Not a hazard. Not a forecast. Not a verdict.`
    });

    uncertaintyGroup.add(mesh);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geom),
      hazeEdgeMat
    );
    edges.position.copy(mesh.position);
    edges.name = `${name} Outline`;
    edges.userData.nonSelectable = true;
    uncertaintyGroup.add(edges);

    return mesh;
  }

  makeUncertainty({
    name: "Uncertainty Region A",
    meaning: "Feasibility is unclear or assumption-driven here.",
    reduce: "Clarify constraints or gather more evidence.",
    pos: { x: -2.6, y: 1.0, z: -0.5 },
    shape: "box"
  });

  makeUncertainty({
    name: "Uncertainty Region B",
    meaning: "Feasibility depends on unstated assumptions.",
    reduce: "Make assumptions explicit; test edge cases.",
    pos: { x: 2.8, y: 1.0, z: 1.6 },
    shape: "sphere"
  });

  return { objectivesGroup, constraintsGroup, feasibleGroup, frontGroup, uncertaintyGroup };
}

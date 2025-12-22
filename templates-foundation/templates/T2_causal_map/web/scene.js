import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function buildScene(scene) {
  // Groups required by the layer grammar
  const nodesGroup = new THREE.Group(); nodesGroup.name = "Nodes";
  const linksGroup = new THREE.Group(); linksGroup.name = "Links";
  const uncertaintyGroup = new THREE.Group(); uncertaintyGroup.name = "Uncertainty";
  const constraintsGroup = new THREE.Group(); constraintsGroup.name = "Causality Constraints";

  scene.add(nodesGroup, linksGroup, uncertaintyGroup, constraintsGroup);

  // ---------- Helpers ----------
  const nodeMatKnown = new THREE.MeshStandardMaterial({ color: 0xddddff });
  const nodeMatAssumed = new THREE.MeshStandardMaterial({ color: 0xddddff, transparent: true, opacity: 0.6 });
  const nodeMatUnknown = new THREE.MeshStandardMaterial({ color: 0xddddff, transparent: true, opacity: 0.25 });
  const nodeMatContested = new THREE.MeshStandardMaterial({ color: 0xffdddd, transparent: true, opacity: 0.45 });

  const haloMat = new THREE.MeshStandardMaterial({
    color: 0x6688ff,
    transparent: true,
    opacity: 0.10,
    depthWrite: false
  });

  function tagSelectable(obj, meta) {
    obj.userData.omegaMeta = meta;
    obj.name = meta.name;
    // for shared inspector expectations:
    obj.userData.layer = meta.layer;
    obj.userData.status = meta.status;
    obj.userData.note = meta.note;
  }

  function makeNode({ name, type, role, status, definition, notThis, pos }) {
    const geom = new THREE.SphereGeometry(0.55, 24, 24);

    let mat = nodeMatKnown;
    if (status === "Assumed") mat = nodeMatAssumed;
    if (status === "Unknown") mat = nodeMatUnknown;
    if (status === "Contested") mat = nodeMatContested;

    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(pos.x, pos.y, pos.z);

    tagSelectable(mesh, {
      name,
      layer: "Nodes",
      status,
      note:
`Type: ${type}
Role: ${role}
Definition: ${definition}

NOT THIS: ${notThis}`
    });

    nodesGroup.add(mesh);

    // Uncertainty halo (separate layer object)
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 24), haloMat);
    halo.position.copy(mesh.position);

    // scale halo by status (illustrative, non-numeric)
    if (status === "Known") halo.scale.setScalar(0.7);
    if (status === "Assumed") halo.scale.setScalar(1.0);
    if (status === "Unknown") halo.scale.setScalar(1.3);
    if (status === "Contested") halo.scale.setScalar(1.2);

    // halos should not be selectable; they are visual only
    halo.name = `${name} Halo`;
    uncertaintyGroup.add(halo);

    return mesh;
  }

  // ---------- Nodes (Domain-Agnostic Example Set) ----------
  // Layout: core cluster + 3 peripheral clusters
  const nodes = [];

  // Core (center)
  nodes.push(makeNode({
    name: "Process 1",
    type: "Process",
    role: "Core transformation",
    status: "Known",
    definition: "Primary internal process (abstract).",
    notThis: "Not a simulation of dynamics or time.",
    pos: { x: 0, y: 0, z: 0 }
  }));

  nodes.push(makeNode({
    name: "State X",
    type: "State",
    role: "Latent state",
    status: "Assumed",
    definition: "Internal state assumed to exist for reasoning.",
    notThis: "Not a measured variable or verified ground truth.",
    pos: { x: 2.2, y: 0, z: 0.8 }
  }));

  nodes.push(makeNode({
    name: "Constraint C",
    type: "Constraint",
    role: "Limits",
    status: "Known",
    definition: "Bound that restricts possible relationships.",
    notThis: "Not a recommendation or policy.",
    pos: { x: -2.2, y: 0, z: -0.6 }
  }));

  nodes.push(makeNode({
    name: "Confounder Z",
    type: "Confounder",
    role: "Ambiguity source",
    status: "Unknown",
    definition: "Unmodelled factor that may affect relationships.",
    notThis: "Not an identified cause.",
    pos: { x: 0.6, y: 0, z: -2.2 }
  }));

  // Cluster A
  nodes.push(makeNode({
    name: "Input A",
    type: "Input",
    role: "External input",
    status: "Known",
    definition: "An upstream input to the system.",
    notThis: "Not a control signal in a live system.",
    pos: { x: -6, y: 0, z: 3 }
  }));

  nodes.push(makeNode({
    name: "Input B",
    type: "Input",
    role: "External input",
    status: "Assumed",
    definition: "A second upstream input (assumed availability).",
    notThis: "Not guaranteed present or reliable.",
    pos: { x: -8, y: 0, z: 1.2 }
  }));

  nodes.push(makeNode({
    name: "Context K",
    type: "Context",
    role: "Operating context",
    status: "Unknown",
    definition: "Contextual factor affecting multiple links.",
    notThis: "Not a forecast of conditions.",
    pos: { x: -7.2, y: 0, z: -1.2 }
  }));

  // Cluster B
  nodes.push(makeNode({
    name: "Process 2",
    type: "Process",
    role: "Secondary transformation",
    status: "Assumed",
    definition: "Additional process that may mediate effects.",
    notThis: "Not a validated mechanism.",
    pos: { x: 6.5, y: 0, z: 2.5 }
  }));

  nodes.push(makeNode({
    name: "State Y",
    type: "State",
    role: "Observable state",
    status: "Contested",
    definition: "State definition is disputed or inconsistently measured.",
    notThis: "Not a settled construct.",
    pos: { x: 8.2, y: 0, z: 0.6 }
  }));

  // Cluster C
  nodes.push(makeNode({
    name: "Output 1",
    type: "Output",
    role: "Outcome",
    status: "Known",
    definition: "Downstream outcome or output.",
    notThis: "Not a promise of outcome.",
    pos: { x: 0.5, y: 0, z: 6.6 }
  }));

  nodes.push(makeNode({
    name: "Output 2",
    type: "Output",
    role: "Outcome",
    status: "Assumed",
    definition: "Secondary output (assumed measurable).",
    notThis: "Not assured or guaranteed.",
    pos: { x: -1.8, y: 0, z: 8.2 }
  }));

  // Unknown U (floater)
  nodes.push(makeNode({
    name: "Unknown U",
    type: "Unknown",
    role: "Unresolved factor",
    status: "Unknown",
    definition: "Placeholder for missing variable or unknown mechanism.",
    notThis: "Not a discovered variable.",
    pos: { x: 4.0, y: 0, z: -5.5 }
  }));

  // ---------- Link helpers ----------
  const linkMat = new THREE.LineBasicMaterial({ color: 0xaab0ff });
  const linkMatFaint = new THREE.LineBasicMaterial({ color: 0x6688ff, transparent: true, opacity: 0.35 });
  const disallowedMat = new THREE.LineBasicMaterial({ color: 0x666666 });

  function findNode(name) {
    const hit = nodes.find(n => n.name === name);
    if (!hit) throw new Error(`Node not found: ${name}`);
    return hit;
  }

  function makeLine(fromPos, toPos, mat) {
    const pts = [fromPos.clone(), toPos.clone()];
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.Line(geom, mat);
  }

  function makeXMarker(mid, size = 0.35) {
    const g = new THREE.Group();
    const a1 = makeLine(
      new THREE.Vector3(mid.x - size, mid.y, mid.z - size),
      new THREE.Vector3(mid.x + size, mid.y, mid.z + size),
      disallowedMat
    );
    const a2 = makeLine(
      new THREE.Vector3(mid.x - size, mid.y, mid.z + size),
      new THREE.Vector3(mid.x + size, mid.y, mid.z - size),
      disallowedMat
    );
    g.add(a1, a2);
    return g;
  }

  function tagLinkSelectable(obj, meta) {
    obj.userData.omegaMeta = meta;
    obj.name = meta.name;
    obj.userData.layer = meta.layer;
    obj.userData.status = meta.status;
    obj.userData.note = meta.note;
  }

  function makeInfluenceLink({ from, to, sign, strength, evidence, confounders, status }) {
    const a = findNode(from);
    const b = findNode(to);

    const line = makeLine(a.position, b.position, linkMat);

    // Make the link selectable by adding an invisible "pick tube" mesh
    const dir = new THREE.Vector3().subVectors(b.position, a.position);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(a.position, b.position).multiplyScalar(0.5);

    const pickGeom = new THREE.CylinderGeometry(0.18, 0.18, len, 8, 1, true);
    const pickMat = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.0 });
    const pick = new THREE.Mesh(pickGeom, pickMat);

    pick.position.copy(mid);
    pick.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());

    // Tag pick mesh (not the line) so clicks are reliable
    tagLinkSelectable(pick, {
      name: `Link: ${from} → ${to}`,
      layer: "Links",
      status: status,
      note:
`Influence sign: ${sign}
Strength band: ${strength} (illustrative)
Evidence: ${evidence}
Confounders: ${confounders && confounders.length ? confounders.join(", ") : "not assessed"}

NOT THIS: This link is not a forecast. It does not imply "what will happen."`
    });

    // Link uncertainty overlay (separate layer object)
    const faint = makeLine(a.position, b.position, linkMatFaint);
    faint.name = `Uncertainty: ${from} → ${to}`;

    // Scale uncertainty by status (illustrative)
    if (status === "Known") faint.material.opacity = 0.15;
    if (status === "Assumed") faint.material.opacity = 0.30;
    if (status === "Unknown") faint.material.opacity = 0.45;
    if (status === "Contested") faint.material.opacity = 0.50;

    linksGroup.add(line);
    linksGroup.add(pick);
    uncertaintyGroup.add(faint);
  }

  function makeDisallowedLink({ from, to, reason }) {
    const a = findNode(from);
    const b = findNode(to);

    const line = makeLine(a.position, b.position, disallowedMat);
    line.name = `Disallowed: ${from} → ${to}`;

    const mid = new THREE.Vector3().addVectors(a.position, b.position).multiplyScalar(0.5);
    const x = makeXMarker(mid, 0.35);
    x.name = `X: ${from} → ${to}`;

    // Selectable "pick tube" for disallowed link
    const dir = new THREE.Vector3().subVectors(b.position, a.position);
    const len = dir.length();
    const pickGeom = new THREE.CylinderGeometry(0.20, 0.20, len, 8, 1, true);
    const pickMat = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.0 });
    const pick = new THREE.Mesh(pickGeom, pickMat);
    pick.position.copy(mid);
    pick.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());

    tagLinkSelectable(pick, {
      name: `Disallowed: ${from} → ${to}`,
      layer: "Causality Constraints",
      status: "Conservative",
      note:
`This causal inference is not supported here.
Reason: ${reason}

NOT THIS: This is not a claim that the relationship is impossible everywhere — only that it is disallowed within this map's scope.`
    });

    constraintsGroup.add(line);
    constraintsGroup.add(x);
    constraintsGroup.add(pick);
  }

  // ---------- Links (10–18 total, mix of certainty) ----------
  makeInfluenceLink({
    from: "Input A", to: "Process 1",
    sign: "+", strength: "medium", evidence: "observed", confounders: ["Context K"], status: "Known"
  });

  makeInfluenceLink({
    from: "Input B", to: "Process 1",
    sign: "+", strength: "low", evidence: "assumed", confounders: ["Context K"], status: "Assumed"
  });

  makeInfluenceLink({
    from: "Process 1", to: "State X",
    sign: "+", strength: "medium", evidence: "theoretical", confounders: ["Confounder Z"], status: "Assumed"
  });

  makeInfluenceLink({
    from: "State X", to: "Output 1",
    sign: "+", strength: "high", evidence: "theoretical", confounders: ["Confounder Z"], status: "Assumed"
  });

  makeInfluenceLink({
    from: "Process 2", to: "State Y",
    sign: "mixed", strength: "medium", evidence: "unknown", confounders: ["Confounder Z"], status: "Contested"
  });

  makeInfluenceLink({
    from: "State Y", to: "Output 2",
    sign: "+", strength: "low", evidence: "unknown", confounders: ["Confounder Z"], status: "Unknown"
  });

  makeInfluenceLink({
    from: "Context K", to: "Output 1",
    sign: "-", strength: "low", evidence: "unknown", confounders: [], status: "Unknown"
  });

  makeInfluenceLink({
    from: "Constraint C", to: "Process 1",
    sign: "-", strength: "high", evidence: "observed", confounders: [], status: "Known"
  });

  makeInfluenceLink({
    from: "Unknown U", to: "Process 2",
    sign: "unknown", strength: "low", evidence: "unknown", confounders: ["Confounder Z"], status: "Unknown"
  });

  makeInfluenceLink({
    from: "Confounder Z", to: "State X",
    sign: "unknown", strength: "medium", evidence: "unknown", confounders: [], status: "Unknown"
  });

  // ---------- Disallowed Links (Constraints layer) ----------
  makeDisallowedLink({
    from: "Output 1", to: "Input A",
    reason: "Outside boundary (reverse causality not supported in this scope)."
  });

  makeDisallowedLink({
    from: "Output 2", to: "Process 1",
    reason: "Evidence insufficient (directionality not established here)."
  });

  makeDisallowedLink({
    from: "State Y", to: "Input B",
    reason: "Confounded / not inferable here (latent factors not resolved)."
  });

  // Return groups for future blocks
  return { nodesGroup, linksGroup, uncertaintyGroup, constraintsGroup, nodes };
}

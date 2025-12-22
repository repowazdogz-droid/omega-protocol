export function setupInspector(scene, camera, renderer) {
  const inspector = document.getElementById("inspector");
  inspector.innerHTML = "Click an element to inspect.";

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  renderer.domElement.addEventListener("click", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const hits = raycaster.intersectObjects(scene.children, true);
    if (!hits.length) return;

    const usable = hits.find(i => !i.object?.userData?.nonSelectable);
    const hit = usable || null;
    if (!hit) return;

    const obj = hit.object;
    inspector.innerHTML = `
      <strong>${obj.name || "Element"}</strong><br/>
      Layer: ${obj.userData.layer || "—"}<br/>
      Status: ${obj.userData.status || "—"}<br/><br/>
      ${obj.userData.note || "No metadata provided."}
    `;
  });
}


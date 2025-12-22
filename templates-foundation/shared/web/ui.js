export function setupUI(scene) {
  const ui = document.getElementById("ui");
  ui.innerHTML = "<strong>Layers</strong><br/>";

  scene.children.forEach(obj => {
    if (obj.name) {
      const label = document.createElement("label");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = true;
      cb.onchange = () => obj.visible = cb.checked;
      label.appendChild(cb);
      label.append(" " + obj.name);
      ui.appendChild(label);
      ui.appendChild(document.createElement("br"));
    }
  });
}






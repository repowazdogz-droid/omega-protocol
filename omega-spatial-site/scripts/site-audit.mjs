import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const targets = [
  "app/page.tsx",
  "app/demo/page.tsx",
  "app/demo-kit/page.tsx",
  "app/trust/page.tsx",
  "app/rooms/page.tsx",
];

const mustNotContain = [
  "Offerings", // removed from nav
];

const mustContainSomewhere = [
  "Omega Spatial",
];

let ok = true;

for (const t of targets) {
  const p = path.join(root, t);
  if (!fs.existsSync(p)) {
    console.log(`[AUDIT] ${t} does not exist`);
    ok = false;
    continue;
  }
  const s = fs.readFileSync(p, "utf8");

  for (const bad of mustNotContain) {
    if (s.includes(bad)) {
      console.log(`[AUDIT] ${t} contains forbidden string: "${bad}"`);
      ok = false;
    }
  }
}

for (const t of targets) {
  const p = path.join(root, t);
  if (!fs.existsSync(p)) continue;
  const s = fs.readFileSync(p, "utf8");
  for (const req of mustContainSomewhere) {
    if (!s.includes(req)) {
      console.log(`[AUDIT] ${t} missing expected anchor: "${req}"`);
      ok = false;
    }
  }
}

console.log(ok ? "[AUDIT] OK" : "[AUDIT] FAIL");
process.exit(ok ? 0 : 1);



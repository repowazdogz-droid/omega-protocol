import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function fail(msg) {
  console.error(`❌ Contract validation failed: ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`✅ ${msg}`);
}

const root = path.resolve(__dirname, "..", "..", "..", "..");
const examplesDir = path.join(root, "omega-spatial", "spine", "contracts", "examples");

const examplePath = path.join(examplesDir, "causal_surface.example.json");
if (!fs.existsSync(examplePath)) fail(`Missing example: ${examplePath}`);

const ex = readJson(examplePath);

// Minimal "spine sanity" checks (fast, deterministic, no JSONSchema runtime yet)
const requiredTop = ["schemaVersion", "surfaceId", "surfaceType", "trust", "layers", "elements", "bounds"];
for (const k of requiredTop) if (!(k in ex)) fail(`Example missing top-level key: ${k}`);

if (ex.schemaVersion !== "1.0") fail(`schemaVersion must be 1.0`);
if (!ex.trust?.humanLed || !ex.trust?.nonAutonomous || !ex.trust?.visualReasoningOnly) fail(`trust flags must be true`);
const exclusions = ex.bounds?.explicitExclusions || [];
const mustExclude = ["simulation", "prediction", "optimization", "recommendations", "control", "autonomy"];
for (const m of mustExclude) if (!exclusions.includes(m)) fail(`bounds.explicitExclusions missing required: ${m}`);

const layerIds = new Set(ex.layers.map(l => l.id));
for (const el of ex.elements) {
  if (!layerIds.has(el.layerId)) fail(`element ${el.id} references missing layerId: ${el.layerId}`);
  if (typeof el.selectable !== "boolean") fail(`element ${el.id} selectable must be boolean`);
  if (!el.title || !el.meaning) fail(`element ${el.id} must have title and meaning`);
}

ok("Example contract passes minimal spine sanity checks.");
console.log("ℹ️ Next: add full JSON Schema validation once we decide runtime (Ajv / zod / swift decoder).");



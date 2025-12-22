import { execSync, spawn } from "node:child_process";

const PORT = process.env.PORT || "3001";

function killPort(port) {
  try {
    const out = execSync(`lsof -ti :${port}`, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();

    if (!out) {
      console.log(`✅ Port ${port} is free.`);
      return;
    }

    const pids = out.split("\n").filter(Boolean);
    execSync(`kill -9 ${pids.join(" ")}`, { stdio: "ignore" });
    console.log(`✅ Killed ${pids.length} process(es) on port ${port}.`);
  } catch {
    console.log(`✅ Port ${port} is free.`);
  }
}

killPort(PORT);

console.log(`▶ Starting Next.js on http://127.0.0.1:${PORT}`);
const child = spawn("npx", ["next", "dev", "-p", PORT], { stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 0));






import { spawn } from "node:child_process";

function banner(msg) {
  console.log(`\n====================\n${msg}\n====================\n`);
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      ...opts,
    });

    p.on("exit", (code) => {
      if (code === 0) return resolve();
      reject(new Error(`[${cmd} ${args.join(" ")}] failed with exit code ${code}`));
    });
  });
}

function runLong(cmd, args, opts = {}) {
  return spawn(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...opts,
  });
}

async function main() {
  banner("DEV SAFE: LINT");
  await run("npm", ["run", "lint"]);

  banner("DEV SAFE: TYPECHECK");
  await run("npm", ["run", "typecheck"]);

  banner("DEV SAFE: TEST");
  await run("npm", ["run", "test"]);

  banner("DEV SAFE: START NEXT DEV");
  const dev = runLong("npm", ["run", "dev"]);

  banner("DEV SAFE: WAIT FOR http://127.0.0.1:3001");
  try {
    await run("npx", ["wait-on", "-t", "60000", "http://127.0.0.1:3001"]);
  } catch (e) {
    console.error("\n❌ Server never became ready on http://127.0.0.1:3001");
    dev.kill("SIGINT");
    throw e;
  }

  banner("DEV SAFE: OPEN /demo");
  await run("npx", ["open", "http://127.0.0.1:3001/demo"]);

  dev.on("exit", (code) => process.exit(code ?? 0));
}

main().catch((e) => {
  console.error("\n❌ Dev safe launch aborted:", e.message);
  process.exit(1);
});


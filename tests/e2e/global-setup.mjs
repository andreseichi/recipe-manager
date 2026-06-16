import { spawn, spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";

const port = process.env.E2E_PORT ?? "3100";
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${port}`;
const pidFile = ".next-e2e/server.pid";
const nextBin = "node_modules/next/dist/bin/next";

function stopServer(pid) {
  if (!pid) return;

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], {
      stdio: "ignore",
      windowsHide: true,
    });
    return;
  }

  try {
    process.kill(-pid, "SIGTERM");
  } catch {
    process.kill(pid, "SIGTERM");
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(server, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let exitCode;

  server.once("exit", (code, signal) => {
    exitCode = code ?? signal ?? 0;
  });

  while (Date.now() < deadline) {
    if (exitCode !== undefined) {
      throw new Error(`Next.js E2E server exited early: ${exitCode}`);
    }

    try {
      const response = await fetch(baseURL, { redirect: "manual" });
      if (response.status < 500) return;
    } catch {
      // Keep polling until Next.js finishes booting.
    }

    await delay(250);
  }

  throw new Error(`Timed out waiting for Next.js E2E server at ${baseURL}`);
}

export default async function globalSetup() {
  const server = spawn(process.execPath, [nextBin, "dev", "--port", port], {
    detached: process.platform !== "win32",
    env: {
      ...process.env,
      E2E_PORT: port,
      E2E_TEST_MODE: "true",
      NEXT_DIST_DIR: ".next-e2e",
      BETTER_AUTH_URL: baseURL,
      BETTER_AUTH_SECRET:
        process.env.BETTER_AUTH_SECRET ??
        "e2e-secret-with-at-least-thirty-two-characters",
    },
    stdio: "ignore",
    windowsHide: true,
  });

  try {
    await waitForServer(server, 120_000);
    await mkdir(".next-e2e", { recursive: true });
    await writeFile(pidFile, String(server.pid), "utf8");
    server.unref();
  } catch (error) {
    stopServer(server.pid);
    throw error;
  }
}

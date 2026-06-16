import { spawnSync } from "node:child_process";
import { readFile, rm } from "node:fs/promises";

const pidFile = ".next-e2e/server.pid";

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

export default async function globalTeardown() {
  try {
    const pid = Number.parseInt(await readFile(pidFile, "utf8"), 10);
    stopServer(pid);
  } catch {
    // The setup may have failed before writing the PID file.
  } finally {
    await rm(pidFile, { force: true });
  }
}

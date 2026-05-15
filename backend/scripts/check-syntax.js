const { execFileSync } = require("node:child_process");
const { readdirSync, statSync } = require("node:fs");
const { join } = require("node:path");

function collectJavaScriptFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);

    return stats.isDirectory() ? collectJavaScriptFiles(fullPath) : fullPath.endsWith(".js") ? [fullPath] : [];
  });
}

for (const filePath of collectJavaScriptFiles(join(__dirname, "..", "src"))) {
  execFileSync(process.execPath, ["--check", filePath], { stdio: "inherit" });
}

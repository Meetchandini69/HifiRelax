/**
 * Cross-platform preinstall check (Windows, macOS, Linux).
 * Uses .cjs extension so Node.js always treats this as CommonJS,
 * even when scripts/package.json contains "type": "module".
 *
 * - Removes package-lock.json and yarn.lock if they exist.
 * - Exits with an error if the install is NOT being run via pnpm.
 */
const fs   = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");

// Remove stray lock files left by npm or yarn
["package-lock.json", "yarn.lock"].forEach(function(f) {
  var full = path.join(root, f);
  if (fs.existsSync(full)) fs.unlinkSync(full);
});

// Enforce pnpm
var agent = process.env.npm_config_user_agent || "";
if (agent.indexOf("pnpm") !== 0) {
  process.stderr.write(
    "\nERROR: Please use pnpm to install dependencies.\n" +
    "  Install pnpm:  npm install -g pnpm\n" +
    "  Then run:      pnpm install\n\n"
  );
  process.exit(1);
}

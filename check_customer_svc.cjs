const fs = require("fs");
const path = require("path");

const walk = (d) => {
  const entries = fs.readdirSync(d, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === "node_modules" || e.name === ".next") continue;
    const full = path.join(d, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.name.endsWith(".tsx") || e.name.endsWith(".ts")) {
      const src = fs.readFileSync(full, "utf8");
      if (src.includes("Service") && src.includes("getBranch")) {
        console.log("Found in:", full);
        const matches = src.match(/api\.\w+\.\w+/g);
        if (matches) console.log("  API calls:", [...new Set(matches)].join(", "));
      }
    }
  }
};
walk(".");

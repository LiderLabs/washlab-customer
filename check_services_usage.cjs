const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

// Find dbServices usage in step 1
const idx = src.indexOf("dbServices");
console.log("=== dbServices query ===");
console.log(JSON.stringify(src.substring(idx - 20, idx + 200)));

// Find ServiceCard usage
const idx2 = src.indexOf("ServiceCard");
console.log("=== ServiceCard usage ===");
console.log(JSON.stringify(src.substring(idx2, idx2 + 400)));

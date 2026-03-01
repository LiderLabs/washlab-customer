const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

// Find branches query
const idx = src.indexOf("branches");
console.log("=== branches query ===");
console.log(JSON.stringify(src.substring(idx - 20, idx + 200)));

// Find branchId state
const idx2 = src.indexOf("branchId");
console.log("=== branchId state ===");
console.log(JSON.stringify(src.substring(idx2 - 20, idx2 + 150)));

// Find customer profile query
const idx3 = src.indexOf("getProfile");
console.log("=== getProfile ===");
console.log(JSON.stringify(src.substring(idx3 - 20, idx3 + 150)));

const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

// Check step validation
const idx = src.indexOf("case 1:");
console.log("=== case 1 validation ===");
console.log(JSON.stringify(src.substring(idx, idx + 200)));

// Check setServiceType
const idx2 = src.indexOf("setServiceType");
console.log("=== setServiceType ===");
console.log(JSON.stringify(src.substring(idx2 - 50, idx2 + 150)));

const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

// Find STEPS array
const idx = src.indexOf("STEPS");
console.log("=== STEPS ===");
console.log(JSON.stringify(src.substring(idx, idx + 200)));

// Find step 0 render
const idx2 = src.indexOf("currentStep === 0");
console.log("=== step 0 render ===");
console.log(JSON.stringify(src.substring(idx2, idx2 + 600)));

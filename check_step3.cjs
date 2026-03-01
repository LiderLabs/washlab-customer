const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

// Find currentStep === 3 render
const idx = src.indexOf("currentStep === 3");
console.log(JSON.stringify(src.substring(idx, idx + 1500)));

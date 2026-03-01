const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
// Find useState for step/currentStep
const idx = src.indexOf("useState");
console.log(JSON.stringify(src.substring(idx - 20, idx + 600)));

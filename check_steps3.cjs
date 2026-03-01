const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

// Find StepIndicator in JSX
const idx = src.indexOf("<StepIndicator");
console.log("=== StepIndicator JSX ===");
console.log(JSON.stringify(src.substring(idx, idx + 300)));

// Find setCurrentStep usages
let pos = 0, i = 0;
while ((pos = src.indexOf("setCurrentStep", pos)) !== -1) {
  console.log(`setCurrentStep occurrence ${++i}:`, JSON.stringify(src.substring(pos - 30, pos + 80)));
  pos += 1;
  if (i > 8) break;
}

const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

// Find step state and surrounding context
const idx = src.indexOf("useState(0)");
console.log("=== step state ===");
console.log(JSON.stringify(src.substring(idx - 50, idx + 200)));

// Find StepIndicator usage
const idx2 = src.indexOf("StepIndicator");
console.log("=== StepIndicator ===");
console.log(JSON.stringify(src.substring(idx2, idx2 + 300)));

// Find where step changes (next/back buttons)
const idx3 = src.indexOf("setStep") || src.indexOf("setCurrentStep");
console.log("=== setStep ===");
console.log(JSON.stringify(src.substring(idx3, idx3 + 300)));

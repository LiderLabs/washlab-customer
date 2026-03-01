const fs = require("fs");
let src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

// 1. Update STEPS array - add Branch first
src = src.replace(
  `STEPS = ['Service', 'Clothes', 'Whites', 'Branch & Delivery', 'Details', 'Summary'];`,
  `STEPS = ['Branch', 'Service', 'Clothes', 'Whites', 'Delivery', 'Details', 'Summary'];`
);

// 2. Fix all currentStep === X references (shift up by 1)
src = src.replace(/currentStep === 5/g, "currentStep === 6");
src = src.replace(/currentStep === 4/g, "currentStep === 5");
src = src.replace(/currentStep === 3/g, "currentStep === 4");
src = src.replace(/currentStep === 2/g, "currentStep === 3");
src = src.replace(/currentStep === 1/g, "currentStep === 2");
src = src.replace(/currentStep === 0/g, "currentStep === 1");

fs.writeFileSync("app/(public)/order/page.tsx", src, "utf8");
console.log("STEPS updated:", src.includes("'Branch', 'Service'"));
console.log("Steps shifted:", src.includes("currentStep === 1 &&"));

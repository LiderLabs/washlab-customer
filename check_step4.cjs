const fs = require("fs");
let src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

// Check what step 4 looks like now
const idx = src.indexOf("currentStep === 4 &&");
console.log(JSON.stringify(src.substring(idx, idx + 600)));

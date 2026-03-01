const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

// Find Branch & Delivery step
const idx = src.indexOf("Branch & Delivery") ;
console.log("=== Branch step ===");
console.log(JSON.stringify(src.substring(idx, idx + 1500)));

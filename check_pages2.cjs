const fs = require("fs");

// Check full pricing page
const pricing = fs.readFileSync("app/(public)/pricing/page.tsx", "utf8");
console.log("=== PRICING LENGTH:", pricing.length);
console.log(JSON.stringify(pricing.substring(800, 2000)));

// Check order page - branch selection part
const order = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
const branchIdx = order.indexOf("branch");
console.log("=== ORDER branch section ===");
console.log(JSON.stringify(order.substring(branchIdx - 50, branchIdx + 600)));

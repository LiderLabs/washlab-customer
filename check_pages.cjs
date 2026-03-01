const fs = require("fs");

// Check pricing page
const pricing = fs.readFileSync("app/(public)/pricing/page.tsx", "utf8");
console.log("=== PRICING ===");
console.log(JSON.stringify(pricing.substring(0, 800)));

// Check order page
const order = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
console.log("=== ORDER ===");
console.log(JSON.stringify(order.substring(0, 800)));

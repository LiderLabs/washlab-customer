const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
const matches = src.match(/api\.\w+\.\w+/g);
console.log("API calls:", [...new Set(matches || [])].join(", "));
console.log("Has services:", src.includes("service") || src.includes("Service"));
const idx = src.indexOf("No services");
if (idx !== -1) console.log("Near 'No services':", JSON.stringify(src.substring(idx - 200, idx + 100)));

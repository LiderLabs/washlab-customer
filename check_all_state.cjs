const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
// Find all useState calls
const matches = [...src.matchAll(/useState[^;]{1,100}/g)];
matches.slice(0, 10).forEach((m, i) => console.log(i, JSON.stringify(m[0])));

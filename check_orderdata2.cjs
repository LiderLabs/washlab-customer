const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
const idx = src.indexOf("const orderData");
console.log(JSON.stringify(src.substring(idx + 600, idx + 1200)));

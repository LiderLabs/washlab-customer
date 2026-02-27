const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
const idx = src.indexOf("estimatedPrice.toFixed");
console.log(JSON.stringify(src.substring(idx - 400, idx + 300)));

const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
const idx = src.indexOf("case 0:");
console.log(JSON.stringify(src.substring(idx, idx + 600)));

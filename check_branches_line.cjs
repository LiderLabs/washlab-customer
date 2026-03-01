const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
const idx = src.indexOf("branches.getActive");
console.log(JSON.stringify(src.substring(idx - 20, idx + 100)));

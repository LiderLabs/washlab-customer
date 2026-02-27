const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
const idx = src.indexOf("getActive\|dbServices\|services");
const idx2 = src.indexOf("dbServices");
console.log(JSON.stringify(src.substring(idx2 - 50, idx2 + 300)));

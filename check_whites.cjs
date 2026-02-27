const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
const idx = src.indexOf("washSeparately\|hasWhites\|separate");
const idx2 = src.indexOf("washSeparately");
console.log(JSON.stringify(src.substring(idx2 - 50, idx2 + 400)));

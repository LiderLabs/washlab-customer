const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
const idx = src.indexOf("mixDisclaimer\|washSeparately\|mix");
const idx2 = src.indexOf("washSeparately");
console.log(JSON.stringify(src.substring(idx2 - 20, idx2 + 200)));

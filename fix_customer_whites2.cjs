const fs = require("fs");
let src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

const oldText = "{estimatedLoads} cycle{estimatedLoads !== 1 ? 's' : ''} \u00d7 \u20b5{selectedDbService.basePrice.toFixed(2)}/cycle";
const newText = "{estimatedLoads} cycle{estimatedLoads !== 1 ? 's' : ''} \u00d7 \u20b5{selectedDbService.basePrice.toFixed(2)}/cycle{extraLoadsForWhites > 0 ? ' (incl. +1 whites)' : ''}";

src = src.replace(oldText, newText);
fs.writeFileSync("app/(public)/order/page.tsx", src, "utf8");
console.log("Fixed:", src.includes("incl. +1 whites"));

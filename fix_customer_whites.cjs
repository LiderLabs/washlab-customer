const fs = require("fs");
let src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

src = src.replace(
  `{estimatedLoads} cycle{estimatedLoads !== 1 ? 's' : ''} × ₵{selectedDbService.basePrice.toFixed(2)}/cycle`,
  `{estimatedLoads} cycle{estimatedLoads !== 1 ? 's' : ''} × ₵{selectedDbService.basePrice.toFixed(2)}/cycle${extraLoadsForWhites > 0 ? ' (incl. +1 whites)' : ''}`
);

fs.writeFileSync("app/(public)/order/page.tsx", src, "utf8");
console.log("Fixed:", src.includes("incl. +1 whites"));

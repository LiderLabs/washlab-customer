const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
const idx = src.indexOf("dry_only");
if (idx !== -1) console.log(JSON.stringify(src.substring(idx - 200, idx + 100)));
const idx2 = src.indexOf("selectedService");
if (idx2 !== -1) console.log(JSON.stringify(src.substring(idx2 - 50, idx2 + 200)));

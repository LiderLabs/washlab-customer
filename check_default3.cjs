const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
const idx = src.indexOf("dbServices as any[]).length > 0 && !serviceType");
console.log(JSON.stringify(src.substring(idx - 10, idx + 200)));

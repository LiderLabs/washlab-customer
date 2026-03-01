const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
console.log("Length:", src.length);
// Find step logic
const idx = src.indexOf("step");
console.log(JSON.stringify(src.substring(idx - 50, idx + 400)));

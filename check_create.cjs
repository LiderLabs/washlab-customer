const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
const idx = src.indexOf("createOrder(");
console.log(JSON.stringify(src.substring(idx - 50, idx + 600)));

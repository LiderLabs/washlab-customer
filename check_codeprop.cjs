const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
const idx = src.indexOf("code={service.code}");
console.log("code prop found:", idx > -1);
console.log(JSON.stringify(src.substring(idx - 50, idx + 100)));

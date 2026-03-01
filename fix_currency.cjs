const fs = require("fs");
let src = fs.readFileSync("app/(public)/pricing/page.tsx", "utf8");
src = src.replace(/\?{service\.price/g, "₵{service.price");
fs.writeFileSync("app/(public)/pricing/page.tsx", src, "utf8");
console.log("Fixed:", src.includes("₵{service.price"));

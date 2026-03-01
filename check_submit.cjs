const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
const idx = src.indexOf("handlePlaceOrder\|handleSubmit\|createOrder(");
const idx2 = src.indexOf("createOrder(");
console.log(JSON.stringify(src.substring(idx2 - 50, idx2 + 500)));

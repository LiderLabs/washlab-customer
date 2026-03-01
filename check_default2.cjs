const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
let pos = 0;
while(true) {
  pos = src.indexOf("selectedService", pos + 1);
  if (pos === -1) break;
  console.log(JSON.stringify(src.substring(pos - 50, pos + 150)));
  console.log("---");
}

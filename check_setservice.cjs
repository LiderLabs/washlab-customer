const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
const idx = src.indexOf("setServiceType");
let pos = 0;
while(true) {
  pos = src.indexOf("setServiceType", pos + 1);
  if (pos === -1) break;
  console.log(JSON.stringify(src.substring(pos - 100, pos + 150)));
  console.log("---");
}

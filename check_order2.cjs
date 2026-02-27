const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
const idx = src.indexOf("wash_and_dry\|Wash & Dry\|50\|25\|SERVICES\|services");
const idx2 = src.indexOf("SERVICES");
const idx3 = src.indexOf("wash_and_dry");
console.log("SERVICES at:", idx2);
console.log("wash_and_dry at:", idx3);
console.log(JSON.stringify(src.substring(idx3 > -1 ? idx3 - 50 : idx2 - 50, (idx3 > -1 ? idx3 : idx2) + 400)));

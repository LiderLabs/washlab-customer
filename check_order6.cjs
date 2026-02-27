const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
const idx = src.indexOf("dbServices.map\|dbServices &&\|dbServices.length\|services.map");
const idx2 = src.indexOf("dbServices.map");
const idx3 = src.indexOf(".map(service");
console.log("dbServices.map at:", idx2);
console.log(".map(service at:", idx3);
console.log(JSON.stringify(src.substring(idx3 - 100, idx3 + 200)));

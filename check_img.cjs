const fs = require("fs");
const src = fs.readFileSync("components/ServiceCard.tsx", "utf8");
const idx = src.indexOf("SERVICE_IMAGES");
console.log(JSON.stringify(src.substring(idx, idx + 200)));

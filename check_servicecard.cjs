const fs = require("fs");
const src = fs.readFileSync("components/ServiceCard.tsx", "utf8");
console.log(JSON.stringify(src.substring(0, 800)));

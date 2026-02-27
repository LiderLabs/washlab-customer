const fs = require("fs");
let src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

src = src.replace(
  "onClick={() => setServiceType(service.code as ServiceType)}",
  "onClick={() => setServiceType(service.code as ServiceType)}\n                        code={service.code}"
);

fs.writeFileSync("app/(public)/order/page.tsx", src, "utf8");
console.log("Fixed:", src.includes("code={service.code}"));

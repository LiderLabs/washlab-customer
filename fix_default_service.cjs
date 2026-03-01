const fs = require("fs");
let src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

src = src.replace(
  `if ((dbServices as any[]).length > 0 && !serviceType) {\r\n      setServiceType((dbServices as any[])[0].code as ServiceType);\r\n    }`,
  `if ((dbServices as any[]).length > 0 && !serviceType) {\r\n      const washAndDry = (dbServices as any[]).find((s: any) => s.code === "wash_and_dry");\r\n      setServiceType((washAndDry || (dbServices as any[])[0]).code as ServiceType);\r\n    }`
);

fs.writeFileSync("app/(public)/order/page.tsx", src, "utf8");
console.log("Fixed:", src.includes('find((s: any) => s.code === "wash_and_dry")'));

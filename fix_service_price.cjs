const fs = require("fs");
let src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

// Fix price prop to handle both branchServices (price) and old services (basePrice/pricingType)
src = src.replace(
  `price={service.pricingType === 'per_kg'\r\n                          ? \`₵\${service.basePrice.toFixed(2)}/kg\`\r\n                          : \`₵\${service.basePrice.toFixed(2)}/load\`}`,
  `price={service.price != null
                          ? \`₵\${service.price.toFixed(2)}\`
                          : service.pricingType === 'per_kg'
                          ? \`₵\${service.basePrice.toFixed(2)}/kg\`
                          : \`₵\${service.basePrice.toFixed(2)}/load\`}`
);

fs.writeFileSync("app/(public)/order/page.tsx", src, "utf8");
console.log("Fixed:", src.includes("service.price != null"));

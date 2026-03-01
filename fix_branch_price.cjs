const fs = require("fs");
let src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

// Remove price display from branch cards
src = src.replace(
  `                      {branch.pricingPerKg && (
                        <p className="text-xs text-primary font-medium mt-2">₵{branch.pricingPerKg}/kg</p>
                      )}`,
  ``
);

fs.writeFileSync("app/(public)/order/page.tsx", src, "utf8");
console.log("Fixed:", !src.includes("branch.pricingPerKg"));

const fs = require("fs");
let src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

// Replace global services query with branch-specific one
src = src.replace(
  `const dbServices = useQuery(api.services.getActive) ?? [];`,
  `const dbServices = useQuery(
    (api as any).admin.getBranchServicesPublic,
    branchId ? { branchId: branchId as any } : "skip"
  ) ?? [];`
);

fs.writeFileSync("app/(public)/order/page.tsx", src, "utf8");
console.log("Fixed:", src.includes("getBranchServicesPublic"));

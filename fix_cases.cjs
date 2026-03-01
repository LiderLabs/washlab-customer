const fs = require("fs");
let src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

src = src.replace(
  `case 0: return serviceType !== null;\r\n      case 1: return clothesCount > 0;\r\n      case 2:\r\n        if (hasWhites === null) return false;\r\n        if (hasWhites === false) return true;\r\n        return washSeparately ? separateDisclaimer : mixDisclaimer;\r\n      case 3: return branchId !== '';\r\n      case 4:\r\n        if (isAuthenticated && convexUser) return true;\r\n        return !!(customerInfo.phone && customerInfo.name && customerInfo.email && customerInfo.hall && customerInfo.room);\r\n      default: return true;`,
  `case 0: return branchId !== '';\r\n      case 1: return serviceType !== null;\r\n      case 2: return clothesCount > 0;\r\n      case 3:\r\n        if (hasWhites === null) return false;\r\n        if (hasWhites === false) return true;\r\n        return washSeparately ? separateDisclaimer : mixDisclaimer;\r\n      case 4: return true;\r\n      case 5:\r\n        if (isAuthenticated && convexUser) return true;\r\n        return !!(customerInfo.phone && customerInfo.name && customerInfo.email && customerInfo.hall && customerInfo.room);\r\n      default: return true;`
);

fs.writeFileSync("app/(public)/order/page.tsx", src, "utf8");
console.log("Fixed:", src.includes("case 0: return branchId !== ''"));

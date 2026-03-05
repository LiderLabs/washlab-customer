const fs = require("fs");
let src = fs.readFileSync("app/layout.tsx", "utf8");

// Add PWAInstallPrompt import
src = src.replace(
  'import type { Metadata } from "next"',
  'import type { Metadata } from "next"\nimport { PWAInstallPrompt } from "@/components/PWAInstallPrompt"'
);

// Add manifest + theme color to metadata
src = src.replace(
  'export const metadata: Metadata = {\r\n  title: "WashLab - Campus Laundry Made Easy",\r\n  description:\r\n    "Wash. Dry. Fold. Done. Professional laundry service for campus life.",\r\n}',
  'export const metadata: Metadata = {\r\n  title: "WashLab - Campus Laundry Made Easy",\r\n  description: "Wash. Dry. Fold. Done. Professional laundry service for campus life.",\r\n  manifest: "/manifest.json",\r\n  themeColor: "#2563eb",\r\n  appleWebApp: {\r\n    capable: true,\r\n    statusBarStyle: "default",\r\n    title: "WashLab",\r\n  },\r\n}'
);

// Add PWAInstallPrompt before closing body
src = src.replace(
  '</AuthProvider>\r\n      </OrderProvider>',
  '</AuthProvider>\r\n      </OrderProvider>\r\n      <PWAInstallPrompt />'
);

fs.writeFileSync("app/layout.tsx", src, "utf8");
console.log("Manifest added:", src.includes('manifest: "/manifest.json"'));
console.log("PWA prompt added:", src.includes("PWAInstallPrompt"));

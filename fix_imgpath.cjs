const fs = require("fs");
let src = fs.readFileSync("components/ServiceCard.tsx", "utf8");

src = src.replace(
  "wash_and_dry: '/laundry-hero-1.jpg',\n  wash_only: '/stacked-clothes.jpg',\n  dry_only: '/laundry-hero-2.jpg',",
  "wash_and_dry: '/assets/laundry-hero-1.jpg',\n  wash_only: '/assets/stacked-clothes.jpg',\n  dry_only: '/assets/laundry-hero-2.jpg',"
);

fs.writeFileSync("components/ServiceCard.tsx", src, "utf8");
console.log("Fixed:", src.includes("/assets/laundry-hero-1.jpg"));

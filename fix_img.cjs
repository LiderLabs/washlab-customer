const fs = require("fs");
let src = fs.readFileSync("components/ServiceCard.tsx", "utf8");

// Replace Next Image with regular img tag
src = src.replace(
  'import Image from \'next/image\';\n',
  ''
);

src = src.replace(
  `          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />`,
  `          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />`
);

fs.writeFileSync("components/ServiceCard.tsx", src, "utf8");
console.log("Fixed:", !src.includes("from 'next/image'"));

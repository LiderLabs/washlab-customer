const fs = require('fs');
let src = fs.readFileSync('components/Logo.tsx', 'utf8');
src = src.replace(
  `  sm: 'h-[80px]',  // mobile / small
  md: 'h-[100px]',  // default desktop
  lg: 'h-[200px]',  // large`,
  `  sm: 'h-[36px]',  // mobile / small
  md: 'h-[48px]',  // default desktop
  lg: 'h-[80px]',  // large`
);
src = src.replace(
  `  height={size === 'sm' ? 40 : size === 'md' ? 56 : 80}  // exact pixel height
      width={size === 'sm' ? 150 : size === 'md' ? 250 : 280}`,
  `  height={size === 'sm' ? 36 : size === 'md' ? 48 : 80}
      width={size === 'sm' ? 120 : size === 'md' ? 180 : 280}`
);
fs.writeFileSync('components/Logo.tsx', src, 'utf8');
console.log('Customer logo sizes fixed');

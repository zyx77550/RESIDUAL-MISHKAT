import fs from 'fs';

let content = fs.readFileSync('src/components/Diftar.tsx', 'utf-8');

content = content.replace(
  /(<\/AnimatePresence>\r?\n\r?\n)(\s*<div\r?\n\s*ref={scrollContainerRef})/s,
  `$1        </motion.div>\n$2`
);

content = content.replace(
  /(<div\r?\n\s*ref={scrollContainerRef}\r?\n\s*className="[^"]+)(")/s,
  `$1 pt-28"`
);

fs.writeFileSync('src/components/Diftar.tsx', content);
console.log('Fixed tags applied.');

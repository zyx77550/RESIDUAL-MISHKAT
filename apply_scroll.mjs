import fs from 'fs';

let content = fs.readFileSync('src/components/Diftar.tsx', 'utf-8');

// 1. Add Smart Scroll logic right after closeAllPanels
content = content.replace(
  /const closeAllPanels = \(\) => {.*?\n/s,
  (match) => match + `
  const { scrollY } = useScroll({ container: scrollContainerRef });
  const [isToolbarHidden, setIsToolbarHidden] = useState(false);
  const lastYRef = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const diff = latest - lastYRef.current;
    if (diff > 15 && latest > 50) { 
      if (!isToolbarHidden) {
        setIsToolbarHidden(true);
        closeAllPanels(); 
      }
    } else if (diff < -15 || latest < 50) { 
      if (isToolbarHidden) setIsToolbarHidden(false);
    }
    lastYRef.current = latest;
  });
`
);

// 2. Wrap toolbar in floating motion.div
content = content.replace(
  /<div\s+className="sticky top-0 z-10 backdrop-blur-2xl rounded-\[2rem\] shadow-xl border p-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar flex-shrink-0"/s,
  `<motion.div
            animate={{ y: isToolbarHidden ? -150 : 0, opacity: isToolbarHidden ? 0 : 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-2 left-2 right-2 z-[100] flex flex-col gap-2 pointer-events-none"
          >
          <div
            className="backdrop-blur-2xl rounded-[2rem] shadow-xl border p-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar flex-shrink-0 pointer-events-auto"`
);

// 3. Add pointer-events-auto to menus container
content = content.replace(
  /<motion\.div\n\s*initial={{ opacity: 0, y: -10, scale: 0\.95 }}\n\s*animate={{ opacity: 1, y: 0, scale: 1 }}\n\s*exit={{ opacity: 0, y: -10, scale: 0\.95 }}\n\s*transition={{ type: 'spring', damping: 25, stiffness: 300 }}\n\s*className="w-full max-w-2xl mx-auto"/g,
  `<motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-2xl mx-auto pointer-events-auto"`
);

// 4. Close the motion.div wrapper right before the canvas scroll container
content = content.replace(
  /(<\/AnimatePresence>\s*)(\s*<div\n\s*ref={scrollContainerRef})/s,
  `$1
        </motion.div>$2`
);

// 5. Add pt-24 to the scroll container
content = content.replace(
  /(<div\n\s*ref={scrollContainerRef}\n\s*className="[^"]+)(")/s,
  `$1 pt-24"`
);

fs.writeFileSync('src/components/Diftar.tsx', content);
console.log('Smart scroll applied successfully.');

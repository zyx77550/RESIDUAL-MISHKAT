import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const QURAN_VERSES = [
  'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ',
  'يَهْدِي اللَّهُ لِنُورِهِ مَن يَشَاءُ',
  'نُّورٌ عَلَىٰ نُورٍ',
  'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
  'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
  'رَبِّ زِدْنِي عِلْمًا',
  'وَاللَّهُ يَعْلَمُ وَأَنتُمْ لَا تَعْلَمُونَ',
  'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
  'وَلَذِكْرُ اللَّهِ أَكْبَرُ',
  'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
  'يَا أَيُّهَا الَّذِينَ آمَنُوا اذْكُرُوا اللَّهَ ذِكْرًا كَثِيرًا',
  'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ',
  'إِنَّ فِي ذَٰلِكَ لَذِكْرَىٰ لِمَن كَانَ لَهُ قَلْبٌ',
  'وَاللَّهُ غَفُورٌ رَّحِيمٌ',
  'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ',
];

const PARTICLES = [
  { left: '10%', dur: '7s',   delay: '-1s',   drift: '20px',  scale: 1.5, op: 0.9 },
  { left: '20%', dur: '9s',   delay: '-4s',   drift: '-15px', scale: 0.8, op: 0.6 },
  { left: '30%', dur: '6s',   delay: '-2s',   drift: '30px',  scale: 2.0, op: 0.5 },
  { left: '40%', dur: '8s',   delay: '-5s',   drift: '-25px', scale: 1.2, op: 0.8 },
  { left: '50%', dur: '7.5s', delay: '-3s',   drift: '10px',  scale: 0.9, op: 0.7 },
  { left: '60%', dur: '10s',  delay: '-6s',   drift: '-20px', scale: 1.8, op: 0.9 },
  { left: '70%', dur: '5.5s', delay: '-1.5s', drift: '15px',  scale: 1.1, op: 0.8 },
  { left: '80%', dur: '8.5s', delay: '-4.5s', drift: '-30px', scale: 0.7, op: 0.5 },
  { left: '90%', dur: '6.5s', delay: '-2.5s', drift: '25px',  scale: 1.4, op: 0.9 },
  { left: '15%', dur: '8s',   delay: '-0.5s', drift: '-10px', scale: 1.0, op: 0.6 },
  { left: '85%', dur: '9.5s', delay: '-3.5s', drift: '20px',  scale: 1.3, op: 0.7 },
];

interface Props {
  lang: string;
  onDone: () => void;
}

export const WelcomeSplash: React.FC<Props> = ({ lang, onDone }) => {
  const fr = lang === 'fr';
  const containerRef = useRef<HTMLDivElement>(null);
  const lightRef     = useRef<HTMLDivElement>(null);
  const verseRef     = useRef<HTMLDivElement>(null);
  const [isExiting, setIsExiting] = useState(false);
  const verseRunning = useRef(true);
  const verseIdx     = useRef(0);

  // Inject keyframes once
  useEffect(() => {
    const id = 'ms-splash-kf';
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `
      @keyframes ms-morph{0%{border-radius:40% 60% 70% 30%/40% 50% 60% 50%}34%{border-radius:70% 30% 50% 50%/30% 30% 70% 70%}67%{border-radius:100% 60% 60% 100%/100% 100% 60% 60%}100%{border-radius:40% 60% 70% 30%/40% 50% 60% 50%}}
      @keyframes ms-move{0%{transform:translate(-30vw,-30vh) rotate(0deg) scale(0.9)}33%{transform:translate(20vw,10vh) rotate(120deg) scale(1.1)}66%{transform:translate(-10vw,30vh) rotate(240deg) scale(0.95)}100%{transform:translate(30vw,-20vh) rotate(360deg) scale(1.05)}}
      @keyframes ms-float{0%{transform:translate3d(0,0,0) scale(var(--sc,1));opacity:0}15%{opacity:var(--op,0.8)}30%{transform:translate3d(var(--dr,15px),-30vh,0) scale(calc(var(--sc,1)*1.2));opacity:calc(var(--op,0.8)*0.4)}50%{opacity:var(--op,0.8)}60%{transform:translate3d(calc(var(--dr,15px)*-1),-60vh,0) scale(calc(var(--sc,1)*0.8));opacity:calc(var(--op,0.8)*0.5)}85%{opacity:var(--op,0.8)}100%{transform:translate3d(calc(var(--dr,15px)*0.5),-120vh,0) scale(var(--sc,1));opacity:0}}
      @keyframes ms-shimmer{to{background-position:200% center}}
      @keyframes ms-dot{0%,100%{opacity:0.2}50%{opacity:1}}
      @keyframes ms-light-in{to{opacity:1}}
      @keyframes ms-breathe-motif{0%{transform:scale(1);opacity:0.5}100%{transform:scale(1.05);opacity:0.9}}
      @keyframes ms-breathe-glow{0%{opacity:0.05}100%{opacity:0.12}}
      @keyframes ms-breathe-ar{0%{opacity:0.7;transform:scale(0.98)}100%{opacity:1;transform:scale(1.02)}}
      @keyframes ms-wave{0%{opacity:0;transform:translateY(10px);filter:blur(6px);background-position:100% center}25%{opacity:0.85;transform:translateY(0);filter:blur(0);background-position:50% center}80%{opacity:0.6;background-position:0% center}100%{opacity:0;transform:translateY(-8px);filter:blur(3px);background-position:-50% center}}
      .ms-ww{opacity:0;background:linear-gradient(110deg,#7a5a1f 0%,#f4c269 50%,#d4a64a 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;}
    `;
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  // Autonomous light orbit
  useEffect(() => {
    let angle = Math.random() * 360;
    let tid: ReturnType<typeof setTimeout>;
    const step = () => {
      const el = lightRef.current;
      if (!el) return;
      angle += 40 + Math.random() * 50;
      const rad = angle * (Math.PI / 180);
      el.style.setProperty('--lx', `${50 + Math.cos(rad) * 55}vw`);
      el.style.setProperty('--ly', `${50 + Math.sin(rad) * 55}vh`);
      const dur = 4 + Math.random() * 3;
      el.style.setProperty('--ls', `${dur}s`);
      tid = setTimeout(step, dur * 1000);
    };
    const init = setTimeout(step, 100);
    return () => { clearTimeout(init); clearTimeout(tid); };
  }, []);

  // Wind gusts
  useEffect(() => {
    if (isExiting) return;
    let tid: ReturnType<typeof setTimeout>;
    const gust = () => {
      const c = containerRef.current;
      if (!c) return;
      const dir = Math.random() > 0.5 ? 1 : -1;
      const str = (10 + Math.random() * 15) * dir;
      const dur = 2 + Math.random() * 2;
      c.style.setProperty('--wind', `${str}vw`);
      c.style.setProperty('--wd', `${dur}s`);
      setTimeout(() => {
        if (c) { c.style.setProperty('--wind', '0vw'); c.style.setProperty('--wd', `${dur + 2}s`); }
      }, dur * 1000);
      tid = setTimeout(gust, 5000 + Math.random() * 7000);
    };
    const init = setTimeout(gust, 2500);
    return () => { clearTimeout(init); clearTimeout(tid); };
  }, [isExiting]);

  // Verse wave loop
  useEffect(() => {
    verseRunning.current = true;
    const STAGGER = 0.25, LIFE = 2.0;
    const run = async () => {
      while (verseRunning.current) {
        const el = verseRef.current;
        if (!el) { await new Promise(r => setTimeout(r, 200)); continue; }
        const words = QURAN_VERSES[verseIdx.current].split(' ');
        el.innerHTML = '';
        words.forEach((w, i) => {
          const sp = document.createElement('span');
          sp.className = 'ms-ww';
          sp.textContent = w;
          sp.style.animation = `ms-wave ${LIFE}s ease-in-out forwards ${i * STAGGER}s`;
          el.appendChild(sp);
        });
        await new Promise(r => setTimeout(r, (words.length * STAGGER + LIFE) * 1000 + 400));
        verseIdx.current = (verseIdx.current + 1) % QURAN_VERSES.length;
      }
    };
    const tid = setTimeout(run, 500);
    return () => { verseRunning.current = false; clearTimeout(tid); };
  }, []);

  const handleEnter = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(onDone, 1900);
  };

  const exitFade = isExiting ? { opacity: 0, transition: { duration: 1 } } : {};
  const exitSlide = isExiting
    ? { opacity: 0, y: 15, transition: { duration: 0.4 } }
    : {};

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'radial-gradient(circle at center, #1a1612 0%, #0c0a08 100%)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        overflow: 'hidden', color: '#f5e9d0',
        '--wind': '0vw', '--wd': '4s',
      } as React.CSSProperties}
    >
      {/* ── Organic bumps ── */}
      <motion.div
        animate={exitFade}
        style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none', filter: 'blur(50px)' }}
      >
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 'max(60vw, 500px)', height: 'max(60vw, 500px)',
          background: 'radial-gradient(circle at 40% 40%, rgba(212,166,74,0.12) 0%, rgba(12,10,8,0.6) 40%, transparent 70%)',
          borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
          animation: 'ms-morph 12s ease-in-out infinite alternate, ms-move 25s linear infinite alternate',
          mixBlendMode: 'hard-light',
        }}/>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 'max(50vw, 400px)', height: 'max(50vw, 400px)',
          background: 'radial-gradient(circle at 60% 60%, rgba(122,90,31,0.08) 0%, rgba(12,10,8,0.4) 50%, transparent 70%)',
          borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
          animation: 'ms-morph 15s ease-in-out infinite alternate-reverse -5s, ms-move 35s linear infinite alternate-reverse -12s',
          mixBlendMode: 'hard-light',
        }}/>
      </motion.div>

      {/* ── Central glow ── */}
      <motion.div animate={exitFade} style={{
        position: 'absolute', inset: 0, zIndex: 1, mixBlendMode: 'soft-light',
        background: 'radial-gradient(circle at center, #d4a64a 0%, transparent 45%)',
        animation: 'ms-breathe-glow 4s ease-in-out infinite alternate',
      }}/>

      {/* ── Geometric motif ── */}
      <motion.div animate={exitFade} style={{
        position: 'absolute', inset: 0, zIndex: 1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M40 0l5 35 35 5-35 5-5 35-5-35-35-5 35-5z' fill='none' stroke='%23d4a64a' stroke-width='0.5' stroke-opacity='0.25'/%3E%3Cpath d='M20 20l20 10 20-10-10 20 10 20-20-10-20 10 10-20z' fill='none' stroke='%23d4a64a' stroke-width='0.5' stroke-opacity='0.15'/%3E%3Ccircle cx='40' cy='40' r='26' fill='none' stroke='%23d4a64a' stroke-width='0.2' stroke-opacity='0.2'/%3E%3C/svg%3E")`,
        backgroundSize: '100px 100px',
        WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 65%)',
        maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 65%)',
        animation: 'ms-breathe-motif 8s ease-in-out infinite alternate',
      }}/>

      {/* ── Autonomous light ── */}
      <div
        ref={lightRef}
        style={{
          position: 'fixed', top: 0, left: 0, zIndex: 2,
          width: 'clamp(600px, 80vw, 1000px)', height: 'clamp(600px, 80vw, 1000px)',
          background: 'radial-gradient(circle, rgba(212,166,74,0.15) 0%, transparent 50%)',
          borderRadius: '50%', pointerEvents: 'none', mixBlendMode: 'screen',
          transform: 'translate(calc(var(--lx, 50vw) - 50%), calc(var(--ly, -50vh) - 50%))',
          transition: 'transform var(--ls, 5s) ease-in-out',
          opacity: 0, animation: 'ms-light-in 3s ease-in forwards 0.5s',
        } as React.CSSProperties}
      />

      {/* ── Particles ── */}
      <motion.div animate={exitFade} style={{ position: 'absolute', inset: 0, zIndex: 3, overflow: 'hidden', pointerEvents: 'none' }}>
        {PARTICLES.map((p, i) => (
          <div key={i} style={{
            position: 'absolute', bottom: 0, left: p.left, width: 0, height: 0,
            transform: `translateX(calc(var(--wind) * ${p.scale}))`,
            transition: 'transform var(--wd) ease-in-out',
          } as React.CSSProperties}>
            <div style={{
              position: 'absolute', bottom: -20, width: 3, height: 3,
              background: '#d4a64a', borderRadius: '50%',
              boxShadow: `0 0 ${8 * p.scale}px ${2 * p.scale}px rgba(212,166,74,0.5)`,
              opacity: 0,
              animation: `ms-float ${p.dur} ease-in-out infinite ${p.delay}`,
              '--sc': p.scale, '--dr': p.drift, '--op': p.op,
            } as React.CSSProperties}/>
          </div>
        ))}
      </motion.div>

      {/* ── Central text ── */}
      <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* App name */}
        <motion.div
          animate={isExiting ? { scale: 1.15, filter: 'blur(8px)', opacity: 0, transition: { duration: 1, delay: 0.2 } } : {}}
          style={{
            fontFamily: 'Fraunces, serif', fontSize: 'clamp(40px, 8vw, 56px)',
            fontWeight: 300, color: 'transparent',
            background: 'linear-gradient(90deg, #7a5a1f, #d4a64a, #f5e9d0, #d4a64a, #7a5a1f)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            letterSpacing: '-0.01em', marginBottom: 4,
            animation: 'ms-shimmer 3s linear infinite',
            filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.4))',
          }}
        >
          Mishkat
        </motion.div>

        {/* Arabic greeting + subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <motion.div
            animate={isExiting ? { scale: 1.15, filter: 'blur(8px)', opacity: 0, transition: { duration: 1, delay: 0.2 } } : {}}
            style={{
              fontFamily: 'Amiri Quran, serif', fontSize: 26,
              color: '#d4a64a', opacity: 0.9,
              textShadow: '0 2px 10px rgba(212,166,74,0.3)',
              animation: 'ms-breathe-ar 4s ease-in-out infinite alternate',
            }}
          >
            السَّلَامُ عَلَيْكُمْ
          </motion.div>

          <motion.div
            animate={exitSlide}
            style={{
              fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#5d5240',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <span>As-salamu alaykum</span>
            {[0, 0.2, 0.4].map((d, i) => (
              <span key={i} style={{ animation: `ms-dot 1.5s infinite ${d}s` }}>.</span>
            ))}
          </motion.div>
        </div>

        {/* Enter button */}
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={isExiting ? { opacity: 0, y: 15 } : { opacity: 1, y: 0 }}
          transition={isExiting ? { duration: 0.4 } : { delay: 1, duration: 0.8, ease: 'easeOut' }}
          onClick={handleEnter}
          whileHover={isExiting ? {} : { backgroundColor: '#f4c269', y: -2, boxShadow: '0 6px 20px rgba(212,166,74,0.25)' }}
          whileTap={isExiting ? {} : { scale: 0.95 }}
          style={{
            marginTop: 40, padding: '9px 28px',
            background: '#d4a64a', color: '#1a0f00',
            fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 12,
            border: 'none', borderRadius: 8, cursor: 'pointer',
            textTransform: 'uppercase', letterSpacing: '0.12em',
            boxShadow: '0 4px 15px rgba(212,166,74,0.15)',
            pointerEvents: isExiting ? 'none' : 'auto',
          }}
        >
          {fr ? 'Entrer' : 'ادخل'}
        </motion.button>
      </div>

      {/* ── Verse wave ── */}
      <motion.div
        animate={isExiting ? { opacity: 0, y: 20, transition: { duration: 0.8 } } : {}}
        style={{
          position: 'absolute', bottom: '6vh',
          left: '50%', transform: 'translateX(-50%)',
          width: '90vw', maxWidth: 800, zIndex: 10,
        }}
      >
        <div
          ref={verseRef}
          dir="rtl"
          style={{
            fontFamily: 'Amiri Quran, serif', fontSize: 'clamp(20px, 4vw, 28px)',
            textAlign: 'center', lineHeight: 1.8, direction: 'rtl',
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 12px',
          }}
        />
      </motion.div>

      {/* ── Light explosion (exit) ── */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={isExiting
          ? { scale: 250, opacity: [0, 1, 1], backgroundColor: ['#ffffff', '#f4c269', '#0c0a08'] }
          : { scale: 0, opacity: 0 }}
        transition={isExiting ? { duration: 1.5, delay: 0.4, ease: [0.7, 0, 0.1, 1] } : {}}
        style={{
          position: 'absolute',
          top: 'calc(50% - 10px)', left: 'calc(50% - 10px)',
          width: 20, height: 20,
          backgroundColor: '#ffffff',
          borderRadius: '50%',
          transformOrigin: 'center center',
          pointerEvents: 'none', zIndex: 50,
        }}
      />
    </div>
  );
};

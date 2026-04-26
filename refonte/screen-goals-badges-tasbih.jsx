// ═══════════════════════════════════════════════════════════════
// SCREEN: GOALS + BADGES + TASBIH
// ═══════════════════════════════════════════════════════════════

const GoalsScreen = () => {
  const t = useT();
  return (
    <AppFrame active="goals" subtitle="Novembre 2025 · 5 objectifs" title="Objectifs" headerRight={
      <PrimaryBtn icon={<Icon d={Icons.plus} size={13}/>}>Nouvel objectif</PrimaryBtn>
    }>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
        <MemoStat label="Complétés" value="2" sub="/ 5 objectifs" t={t}/>
        <MemoStat label="En cours" value="3" sub="à poursuivre" t={t}/>
        <MemoStat label="Taux de complétion" value="64%" sub="ce mois" t={t}/>
      </div>

      <SectionLabel right={<GhostBtn>Filtrer</GhostBtn>}>Liste des objectifs</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SAMPLE.goals.map((g, i) => (
          <Card key={i} padding="16px 20px">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                background: g.done ? t.accent : 'transparent',
                border: `1.5px solid ${g.done ? t.accent : t.line}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {g.done && <Icon d={Icons.check} size={11} style={{ color: '#1a0f00' }} stroke={2.4}/>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, color: g.done ? t.inkDim : t.ink, fontWeight: 500, textDecoration: g.done ? 'line-through' : 'none' }}>{g.text}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  <div style={{ flex: 1, height: 3, background: t.lineSoft, borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${g.progress * 100}%`, background: g.done ? t.accentSoft : t.accent, borderRadius: 3 }}/>
                  </div>
                  <span style={{ fontSize: 10.5, color: t.inkMute, fontFamily: 'Fraunces', minWidth: 32, textAlign: 'right' }}>{Math.round(g.progress * 100)}%</span>
                </div>
              </div>
              <Icon d={Icons.more} size={14} style={{ color: t.inkMute }}/>
            </div>
          </Card>
        ))}
      </div>
    </AppFrame>
  );
};

// ─── Badges ───
const BadgesScreen = () => {
  const t = useT();
  const rarityColor = {
    common: t.inkDim, rare: t.accent, epic: '#a78bdb', legendary: t.accentBright,
  };
  const iconMap = { star: Icons.star, flame: Icons.flame, sparkle: Icons.sparkle, moon: Icons.moon, book: Icons.book, beads: Icons.beads, pen: Icons.pen, palette: Icons.palette };

  return (
    <AppFrame active="badges" subtitle={`${SAMPLE.badgesEarned.length} sur 42 débloqués`} title="Badges" headerRight={
      <GhostBtn icon={<Icon d={Icons.filter} size={13}/>}>Toutes les raretés</GhostBtn>
    }>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 18 }}>
        {[['common','Communs','12'],['rare','Rares','2'],['epic','Épiques','0'],['legendary','Légendaires','0']].map(([k, l, v]) => (
          <Card key={k} padding="14px 16px">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: rarityColor[k] }}/>
              <span style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.16em', textTransform: 'uppercase' }}>{l}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontFamily: 'Fraunces', fontSize: 26, color: t.ink, fontWeight: 300 }}>{v}</span>
              <span style={{ fontSize: 11, color: t.inkDim }}>débloqués</span>
            </div>
          </Card>
        ))}
      </div>

      <SectionLabel>Débloqués récemment</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 22 }}>
        {SAMPLE.badgesEarned.map((b, i) => (
          <div key={b.id} style={{
            padding: '18px 14px', background: t.card, border: `1px solid ${rarityColor[b.rarity]}33`,
            borderRadius: 12, textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${rarityColor[b.rarity]}22, transparent 70%)`}}/>
            <div style={{ width: 44, height: 44, margin: '0 auto', borderRadius: '50%', background: t.cardElev, border: `1px solid ${rarityColor[b.rarity]}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
              <Icon d={iconMap[b.icon] || Icons.star} size={20} style={{ color: rarityColor[b.rarity] }} stroke={1.5}/>
            </div>
            <div style={{ fontSize: 11.5, color: t.ink, fontWeight: 500, marginTop: 10, position: 'relative', zIndex: 1 }}>{b.title}</div>
            <div style={{ fontSize: 9, color: rarityColor[b.rarity], letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 4, position: 'relative', zIndex: 1 }}>{b.rarity}</div>
          </div>
        ))}
      </div>

      <SectionLabel>À débloquer</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
        {SAMPLE.badgesLocked.map((b) => (
          <div key={b.id} style={{
            padding: '18px 14px', background: t.bgSoft, border: `1px dashed ${t.line}`,
            borderRadius: 12, textAlign: 'center', opacity: 0.55,
          }}>
            <div style={{ width: 44, height: 44, margin: '0 auto', borderRadius: '50%', background: t.cardElev, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon d={Icons.lock} size={16} style={{ color: t.inkMute }}/>
            </div>
            <div style={{ fontSize: 11.5, color: t.inkDim, fontWeight: 500, marginTop: 10 }}>{b.title}</div>
            <div style={{ fontSize: 9, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 4 }}>{b.rarity}</div>
          </div>
        ))}
      </div>
    </AppFrame>
  );
};

// ─── Tasbih ───
const TasbihScreen = () => {
  const t = useT();
  const count = 33, target = 99;
  const r = 110, c = 2 * Math.PI * r;

  return (
    <AppFrame active="tasbih" subtitle="Dhikr & contemplation" title="Tasbih" headerRight={
      <div style={{ display: 'flex', gap: 8 }}>
        <GhostBtn icon={<Icon d={Icons.refresh} size={13}/>}>Réinitialiser</GhostBtn>
        <GhostBtn icon={<Icon d={Icons.list} size={13}/>}>Historique</GhostBtn>
      </div>
    }>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card padding="0" style={{ minHeight: 540, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {/* Phrase */}
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <div style={{ fontSize: 10.5, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>Phrase actuelle</div>
            <div style={{ fontFamily: 'Amiri Quran, serif', fontSize: 36, color: t.ink, direction: 'rtl' }}>سُبْحَانَ اللَّه</div>
            <div style={{ fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: 13, color: t.inkDim, marginTop: 6 }}>SubhanAllah · Gloire à Allah</div>
          </div>
          {/* Counter ring */}
          <div style={{ position: 'relative', width: 240, height: 240, marginBottom: 24 }}>
            <svg width={240} height={240} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={120} cy={120} r={r} stroke={t.lineSoft} strokeWidth="3" fill="none"/>
              <circle cx={120} cy={120} r={r} stroke={t.accent} strokeWidth="3" fill="none" strokeDasharray={c} strokeDashoffset={c * (1 - count/target)} strokeLinecap="round"/>
              {/* Tick marks */}
              {Array.from({ length: 33 }).map((_, i) => {
                const a = (i / 33) * Math.PI * 2;
                const x1 = 120 + Math.cos(a) * (r + 12), y1 = 120 + Math.sin(a) * (r + 12);
                const x2 = 120 + Math.cos(a) * (r + 18), y2 = 120 + Math.sin(a) * (r + 18);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i < count ? t.accent : t.lineSoft} strokeWidth="1"/>;
              })}
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Fraunces', fontWeight: 300, fontSize: 76, color: t.ink, lineHeight: 1 }}>{count}</span>
              <span style={{ fontSize: 11, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 4 }}>/ {target}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <GhostBtn icon={<Icon d={Icons.refresh} size={13}/>}>Reset</GhostBtn>
            <PrimaryBtn icon={<Icon d={Icons.plus} size={14}/>} style={{ padding: '14px 32px', fontSize: 14 }}>Tap</PrimaryBtn>
            <GhostBtn icon={<Icon d={Icons.arrow} size={13}/>}>Suivante</GhostBtn>
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <SectionLabel>Stats</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><div style={{ fontFamily: 'Fraunces', fontSize: 30, color: t.ink, fontWeight: 300 }}>{SAMPLE.tasbihToday}</div><div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Aujourd'hui</div></div>
              <div><div style={{ fontFamily: 'Fraunces', fontSize: 30, color: t.ink, fontWeight: 300 }}>{SAMPLE.tasbihTotal.toLocaleString()}</div><div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Total</div></div>
              <div><div style={{ fontFamily: 'Fraunces', fontSize: 30, color: t.accentBright, fontWeight: 300 }}>{SAMPLE.tasbihBest}</div><div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Meilleure session</div></div>
              <div><div style={{ fontFamily: 'Fraunces', fontSize: 30, color: t.ink, fontWeight: 300 }}>7</div><div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Sessions / sem.</div></div>
            </div>
          </Card>
          <Card>
            <SectionLabel>Phrases</SectionLabel>
            {SAMPLE.tasbihPhrases.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px', borderBottom: i < 3 ? `1px solid ${t.lineSoft}` : 'none' }}>
                <div style={{ width: 22, height: 22, borderRadius: 5, background: i === 0 ? t.accent : t.cardElev, border: i === 0 ? 'none' : `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces', fontSize: 11, color: i === 0 ? '#1a0f00' : t.inkDim }}>{i+1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: t.ink, fontWeight: 500 }}>{p.tr}</div>
                  <div style={{ fontSize: 10, color: t.inkMute, marginTop: 1 }}>{p.fr}</div>
                </div>
                <span style={{ fontFamily: 'Amiri Quran, serif', fontSize: 17, color: t.accentBright }}>{p.ar}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </AppFrame>
  );
};

window.GoalsScreen = GoalsScreen;
window.BadgesScreen = BadgesScreen;
window.TasbihScreen = TasbihScreen;

// ═══════════════════════════════════════════════════════════════
// SCREEN: MEMORIZATION + CALENDAR
// ═══════════════════════════════════════════════════════════════

const MemorizationScreen = () => {
  const t = useT();
  // sample mix: 8 memorized, 2 in_progress, 4 review, rest not_started
  const states = (id) => {
    if ([1,112,113,114,110,108,109,111].includes(id)) return 'memorized';
    if ([67,68].includes(id)) return 'progress';
    if ([36,55,56,18].includes(id)) return 'review';
    return 'none';
  };
  const surahs = Array.from({ length: 47 }).map((_, i) => {
    const id = 67 + i; if (id > 114) return null;
    const names = ['Al-Mulk','Al-Qalam','Al-Haqqah','Al-Maarij','Nuh','Al-Jinn','Al-Muzzammil','Al-Muddathir','Al-Qiyamah','Al-Insan','Al-Mursalat','An-Naba','An-Naziat','Abasa','At-Takwir','Al-Infitar','Al-Mutaffifin','Al-Inshiqaq','Al-Buruj','At-Tariq','Al-Ala','Al-Ghashiyah','Al-Fajr','Al-Balad','Ash-Shams','Al-Layl','Ad-Duha','Ash-Sharh','At-Tin','Al-Alaq','Al-Qadr','Al-Bayyinah','Az-Zalzalah','Al-Adiyat','Al-Qariah','At-Takathur','Al-Asr','Al-Humazah','Al-Fil','Quraysh','Al-Maun','Al-Kawthar','Al-Kafirun','An-Nasr','Al-Masad','Al-Ikhlas','Al-Falaq','An-Nas'];
    return { id, name: names[i], arabic: ['الملك','القلم','الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد','الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس'][i], verses: 30, st: states(id) };
  }).filter(Boolean);

  return (
    <AppFrame active="memo" subtitle="48 sourates · Juz 29 — 30" title="Mémorisation" headerRight={
      <div style={{ display: 'flex', gap: 8 }}>
        <GhostBtn icon={<Icon d={Icons.filter} size={13} />}>Filtrer</GhostBtn>
        <GhostBtn icon={<Icon d={Icons.list} size={13} />}>Vue liste</GhostBtn>
        <PrimaryBtn icon={<Icon d={Icons.plus} size={13}/>}>Reprendre</PrimaryBtn>
      </div>
    }>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 18 }}>
        <MemoStat label="Mémorisées" value="8" sub="/114" t={t}/>
        <MemoStat label="En cours" value="2" sub="sourates actives" t={t}/>
        <MemoStat label="En révision" value="4" sub="à consolider" t={t}/>
        <MemoStat label="Versets" value="384" sub="acquis au total" t={t}/>
      </div>

      <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 14, padding: '10px 14px', background: t.bgSoft, border: `1px solid ${t.line}`, borderRadius: 10 }}>
        <span style={{ fontSize: 10.5, color: t.inkMute, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Filtre</span>
        {['Toutes', 'Mémorisées', 'En cours', 'Révision', 'Juz Amma', 'Tabarak'].map((f, i) => (
          <span key={f} style={{ fontSize: 11.5, color: i === 0 ? t.ink : t.inkDim, fontWeight: i === 0 ? 500 : 400, padding: '4px 10px', borderRadius: 999, background: i === 0 ? `${t.accent}18` : 'transparent', border: i === 0 ? `1px solid ${t.accent}33` : '1px solid transparent' }}>{f}</span>
        ))}
        <div style={{ flex: 1 }}/>
        <span style={{ fontSize: 11, color: t.inkMute }}>Tri : N° de sourate ↓</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
        {surahs.map(s => {
          const isMemo = s.st === 'memorized', isProg = s.st === 'progress', isRev = s.st === 'review';
          return (
            <div key={s.id} style={{
              padding: '12px 10px', background: isMemo ? `${t.accent}12` : t.card,
              border: `1px solid ${isProg ? t.accent : isRev ? `${t.accent}55` : t.line}`,
              borderRadius: 9, position: 'relative', minHeight: 88,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Fraunces', fontSize: 10.5, color: t.inkMute }}>{s.id.toString().padStart(3,'0')}</span>
                {isMemo && <Icon d={Icons.check} size={11} style={{ color: t.accent }}/>}
                {isProg && <span style={{ width: 5, height: 5, background: t.accent, borderRadius: '50%' }}/>}
                {isRev && <Icon d={Icons.rotate} size={10} style={{ color: t.accentBright, opacity: 0.7 }}/>}
              </div>
              <div style={{ fontFamily: 'Amiri Quran, serif', fontSize: 18, color: isMemo ? t.accentBright : t.ink, marginTop: 6, direction: 'rtl', lineHeight: 1 }}>{s.arabic}</div>
              <div style={{ fontSize: 10.5, color: t.inkDim, marginTop: 4, fontWeight: 500 }}>{s.name}</div>
            </div>
          );
        })}
      </div>
    </AppFrame>
  );
};

const MemoStat = ({ label, value, sub, t }) => (
  <Card padding="14px 18px">
    <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.16em', textTransform: 'uppercase' }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
      <span style={{ fontFamily: 'Fraunces', fontSize: 26, color: t.ink, fontWeight: 300 }}>{value}</span>
      <span style={{ fontSize: 11, color: t.inkDim }}>{sub}</span>
    </div>
  </Card>
);

// ─── Calendar ────────────────────────────────────────────────────
const CalendarScreen = () => {
  const t = useT();
  const days = Array.from({ length: 35 }, (_, i) => {
    const dn = i - 5;
    if (dn < 1 || dn > 30) return null;
    const today = dn === 24;
    const fast = [12, 13, 19, 20, 26, 27].includes(dn);
    const prayers = [3, 5, 5, 5, 5, 4, 5, 5, 5, 5, 4, 5, 5, 5, 5, 5, 5, 5, 5, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5][dn-1] ?? 0;
    const pages = dn <= 24 ? Math.max(0, Math.floor(Math.random() * 8)) : 0;
    return { n: dn, today, fast, prayers, pages };
  });

  return (
    <AppFrame active="cal" subtitle={`Mois en cours · ${SAMPLE.calMonth}`} title="Calendrier" headerRight={
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <GhostBtn icon={<Icon d={Icons.arrow} size={13} style={{transform: 'rotate(180deg)'}}/>}/>
        <span style={{ fontFamily: 'Fraunces', fontSize: 16, color: t.ink, padding: '0 8px' }}>Nov 2025</span>
        <GhostBtn icon={<Icon d={Icons.arrow} size={13}/>}/>
      </div>
    }>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, marginBottom: 8 }}>
            {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d => (
              <div key={d} style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase', textAlign: 'center', padding: '6px 0' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {days.map((d, i) => {
              if (!d) return <div key={i} style={{ aspectRatio: '1', background: t.bgSoft, borderRadius: 7, opacity: 0.4 }}/>;
              const has = d.prayers > 0 || d.fast || d.pages > 0;
              return (
                <div key={i} style={{
                  aspectRatio: '1', borderRadius: 7,
                  background: d.today ? `${t.accent}22` : has ? t.cardElev : t.bgSoft,
                  border: d.today ? `1.5px solid ${t.accent}` : `1px solid ${has ? t.line : t.lineSoft}`,
                  padding: '6px 7px', position: 'relative',
                }}>
                  <div style={{ fontFamily: 'Fraunces', fontSize: 14, color: d.today ? t.accentBright : t.ink, fontWeight: 300 }}>{d.n}</div>
                  <div style={{ position: 'absolute', bottom: 5, left: 7, right: 7, display: 'flex', gap: 2, alignItems: 'center' }}>
                    {d.prayers > 0 && (
                      <div style={{ display: 'flex', gap: 1.5 }}>
                        {Array.from({ length: 5 }).map((_, k) => (
                          <span key={k} style={{ width: 3, height: 3, borderRadius: '50%', background: k < d.prayers ? t.accent : t.lineSoft }}/>
                        ))}
                      </div>
                    )}
                    {d.fast && <span style={{ fontSize: 9, color: t.accentBright, marginLeft: 'auto' }}>◐</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <SectionLabel>Aujourd'hui · 24 Nov</SectionLabel>
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 10.5, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>Prières</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {['Fajr','Dhuhr','Asr','Maghrib','Isha'].map((p, i) => (
                  <div key={p} style={{ flex: 1, padding: '8px 4px', borderRadius: 7, background: i < 4 ? `${t.accent}22` : t.cardElev, border: `1px solid ${i < 4 ? `${t.accent}55` : t.line}`, textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: t.inkDim, marginBottom: 3 }}>{p}</div>
                    {i < 4 ? <Icon d={Icons.check} size={11} style={{ color: t.accent }}/> : <span style={{ width: 5, height: 5, borderRadius: '50%', background: t.lineSoft, display: 'inline-block' }}/>}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10.5, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>Lecture</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: 'Fraunces', fontSize: 24, color: t.ink, fontWeight: 300 }}>5</span>
                <span style={{ fontSize: 11, color: t.inkDim }}>versets aujourd'hui</span>
              </div>
            </div>
          </Card>
          <Card>
            <SectionLabel>Mois — résumé</SectionLabel>
            <Stat icon={Icons.flame} value="12" label="jours d'affilée" t={t}/>
            <Stat icon={Icons.moon} value="6" label="jours de jeûne" t={t}/>
            <Stat icon={Icons.book} value="98" label="versets ce mois" t={t}/>
            <Stat icon={Icons.check} value="142/150" label="prières faites" t={t}/>
          </Card>
        </div>
      </div>
    </AppFrame>
  );
};

window.MemorizationScreen = MemorizationScreen;
window.CalendarScreen = CalendarScreen;

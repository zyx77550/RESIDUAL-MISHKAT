// ═══════════════════════════════════════════════════════════════
// SCREEN: COLORING + DIFTAR + KANBAN
// ═══════════════════════════════════════════════════════════════

const ColoringScreen = () => {
  const t = useT();
  // simulate colored surahs
  const colored = {
    1: t.accent, 2: '#5fb088', 18: '#5b9bd5', 36: '#d96b7a', 55: '#a78bdb',
    67: t.accentBright, 78: '#e89460', 79: '#8da4c0', 80: '#bfa97a',
    81: t.accent, 82: '#5fb088', 88: '#d96b7a', 89: '#a78bdb', 91: '#e89460',
    93: t.accent, 94: '#5fb088', 95: '#5b9bd5', 96: '#d96b7a',
    103: t.accentBright, 105: t.accent, 108: '#d96b7a', 109: '#5fb088',
    110: '#5b9bd5', 111: '#e89460', 112: t.accent, 113: '#a78bdb', 114: '#d96b7a',
  };
  return (
    <AppFrame active="coloring" subtitle={`${Object.keys(colored).length} sur 114 colorées`} title="Coloriage" headerRight={
      <div style={{ display: 'flex', gap: 8 }}>
        <GhostBtn icon={<Icon d={Icons.download} size={13}/>}>Export</GhostBtn>
        <GhostBtn icon={<Icon d={Icons.refresh} size={13}/>}>Réinit.</GhostBtn>
      </div>
    }>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 14 }}>
        <Card>
          <div style={{ fontSize: 10.5, color: t.inkMute, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>Coran complet · 114 sourates</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: 4 }}>
            {Array.from({ length: 114 }).map((_, i) => {
              const id = i + 1, c = colored[id];
              return (
                <div key={id} style={{
                  aspectRatio: '1', borderRadius: 5,
                  background: c || t.bgSoft,
                  border: c ? 'none' : `1px solid ${t.line}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Fraunces', fontSize: 10, fontWeight: 300,
                  color: c ? '#1a0f00' : t.inkMute,
                }}>{id}</div>
              );
            })}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <SectionLabel>Palette</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {SAMPLE.coloringPalette.map((c, i) => (
                <div key={c} style={{ aspectRatio: '1', borderRadius: 8, background: c, border: i === 0 ? `2px solid ${t.ink}` : 'none', cursor: 'pointer' }}/>
              ))}
            </div>
          </Card>
          <Card>
            <SectionLabel>Statistiques</SectionLabel>
            <Stat icon={Icons.palette} value={Object.keys(colored).length} label="sourates colorées" t={t}/>
            <Stat icon={Icons.sparkle} value="6" label="couleurs utilisées" t={t}/>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.line}`, fontSize: 10.5, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>Progression</div>
            <div style={{ height: 4, background: t.lineSoft, borderRadius: 4 }}>
              <div style={{ height: '100%', width: '24%', background: `linear-gradient(90deg, ${t.accent}, ${t.accentBright})`, borderRadius: 4 }}/>
            </div>
            <div style={{ fontSize: 10.5, color: t.inkDim, marginTop: 6, fontFamily: 'Fraunces' }}>24 % du Coran</div>
          </Card>
        </div>
      </div>
    </AppFrame>
  );
};

// ─── Diftar ───
const DiftarScreen = () => {
  const t = useT();
  const types = { tafsir: '#5b9bd5', vocab: '#5fb088', dua: '#d96b7a', tajweed: '#a78bdb', schema: '#e89460', objectives: t.accent };
  return (
    <AppFrame active="diftar" subtitle={`${SAMPLE.diftarPages.length} pages · cahier numérique`} title="Diftar" headerRight={
      <div style={{ display: 'flex', gap: 8 }}>
        <GhostBtn icon={<Icon d={Icons.search} size={13}/>}>Rechercher</GhostBtn>
        <PrimaryBtn icon={<Icon d={Icons.plus} size={14}/>}>Nouvelle page</PrimaryBtn>
      </div>
    }>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {['Toutes','Tafsir','Vocab','Dua','Notes','Tajweed','Schémas','Objectifs'].map((f, i) => (
          <span key={f} style={{ fontSize: 11, color: i === 0 ? t.ink : t.inkDim, fontWeight: i === 0 ? 500 : 400, padding: '6px 12px', borderRadius: 999, background: i === 0 ? `${t.accent}18` : t.bgSoft, border: `1px solid ${i === 0 ? `${t.accent}33` : t.line}` }}>{f}</span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {SAMPLE.diftarPages.map((p, i) => {
          const c = types[p.type] || t.accent;
          return (
            <div key={i} style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 10, overflow: 'hidden', minHeight: 220, display: 'flex', flexDirection: 'column' }}>
              {/* Page preview */}
              <div style={{ flex: 1, position: 'relative', padding: 16, background: `linear-gradient(135deg, ${c}10, transparent)`, borderBottom: `1px solid ${t.line}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: c }}/>
                  <span style={{ fontSize: 9, color: c, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>{p.type}</span>
                </div>
                {/* fake handwritten lines */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, opacity: 0.55 }}>
                  {[80, 92, 70, 88, 65, 78].map((w, k) => (
                    <div key={k} style={{ height: 1.5, background: t.inkMute, width: `${w}%`, borderRadius: 1 }}/>
                  ))}
                </div>
                {p.type === 'schema' && (
                  <svg style={{ position: 'absolute', bottom: 10, right: 10 }} width="50" height="40" fill="none" stroke={c} strokeWidth="1" opacity="0.6">
                    <circle cx="10" cy="10" r="6"/><circle cx="40" cy="10" r="6"/><circle cx="25" cy="32" r="6"/>
                    <line x1="10" y1="16" x2="25" y2="26"/><line x1="40" y1="16" x2="25" y2="26"/><line x1="16" y1="10" x2="34" y2="10"/>
                  </svg>
                )}
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12.5, color: t.ink, fontWeight: 500 }}>{p.title}</div>
                  <div style={{ fontSize: 10, color: t.inkMute, marginTop: 2 }}>Modifié il y a {p.updated}</div>
                </div>
                <Icon d={Icons.more} size={14} style={{ color: t.inkMute }}/>
              </div>
            </div>
          );
        })}
        <div style={{ background: 'transparent', border: `1.5px dashed ${t.line}`, borderRadius: 10, minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: t.inkDim }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.cardElev, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d={Icons.plus} size={18} style={{ color: t.accent }}/>
          </div>
          <span style={{ fontSize: 12 }}>Nouvelle page</span>
        </div>
      </div>
    </AppFrame>
  );
};

// ─── Kanban ───
const KanbanScreen = () => {
  const t = useT();
  const cols = [
    { key: 'todo', label: 'À mémoriser', items: SAMPLE.kanban.todo, color: t.inkMute },
    { key: 'progress', label: 'En cours', items: SAMPLE.kanban.progress, color: t.accent },
    { key: 'review', label: 'Révision', items: SAMPLE.kanban.review, color: '#a78bdb' },
    { key: 'done', label: 'Mémorisées', items: SAMPLE.kanban.done, color: '#5fb088' },
  ];
  return (
    <AppFrame active="kanban" subtitle="Suivi visuel · glissez les sourates entre les colonnes" title="Suivi" headerRight={
      <PrimaryBtn icon={<Icon d={Icons.plus} size={13}/>}>Ajouter sourate</PrimaryBtn>
    }>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, height: 660 }}>
        {cols.map(col => (
          <div key={col.key} style={{ background: t.bgSoft, border: `1px solid ${t.line}`, borderRadius: 10, padding: 10, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '4px 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: col.color }}/>
                <span style={{ fontSize: 10.5, color: t.ink, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 500 }}>{col.label}</span>
              </div>
              <span style={{ fontFamily: 'Fraunces', fontSize: 13, color: t.inkDim }}>{col.items.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflowY: 'auto' }}>
              {col.items.map((name, i) => (
                <div key={i} style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 7, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 9.5, color: t.inkMute, fontFamily: 'Fraunces' }}>#{67 + i}</span>
                    <span style={{ fontFamily: 'Amiri Quran, serif', fontSize: 13, color: col.color }}>الملك</span>
                  </div>
                  <div style={{ fontSize: 12, color: t.ink, fontWeight: 500 }}>{name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                    <div style={{ flex: 1, height: 2, background: t.lineSoft, borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${col.key === 'done' ? 100 : col.key === 'review' ? 90 : col.key === 'progress' ? 60 : 0}%`, background: col.color }}/>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ padding: '10px', borderRadius: 7, border: `1.5px dashed ${t.line}`, color: t.inkMute, fontSize: 11, textAlign: 'center', cursor: 'pointer' }}>+ Ajouter</div>
            </div>
          </div>
        ))}
      </div>
    </AppFrame>
  );
};

window.ColoringScreen = ColoringScreen;
window.DiftarScreen = DiftarScreen;
window.KanbanScreen = KanbanScreen;

// ═══════════════════════════════════════════════════════════════
// SCREEN: AL-BAQARAH READER + SETTINGS + ADMIN + AUTH
// ═══════════════════════════════════════════════════════════════

const AlBaqaraScreen = () => {
  const t = useT();
  return (
    <AppFrame active="albaqara" subtitle="Sourate 2 · 286 versets · Médinoise" title="Al-Baqarah" headerRight={
      <div style={{ display: 'flex', gap: 8 }}>
        <GhostBtn icon={<Icon d={Icons.play} size={12}/>}>Récitation</GhostBtn>
        <GhostBtn icon={<Icon d={Icons.bookmark} size={12}/>}>Marquer</GhostBtn>
        <GhostBtn icon={<Icon d={Icons.settings} size={12}/>}/>
      </div>
    }>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 14 }}>
        <Card padding="0" style={{ overflow: 'hidden' }}>
          {/* Header bar */}
          <div style={{ padding: '18px 28px', borderBottom: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `linear-gradient(180deg, ${t.accent}08, transparent)` }}>
            <div>
              <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Lecture en cours</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 4 }}>
                <span style={{ fontFamily: 'Fraunces', fontSize: 22, color: t.ink, fontWeight: 300 }}>Verset 4 / 286</span>
                <span style={{ fontSize: 11, color: t.inkDim }}>· Juz 1</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontFamily: 'Fraunces', fontSize: 12, color: t.inkDim }}>1.4%</div>
              <div style={{ width: 120, height: 3, background: t.lineSoft, borderRadius: 3 }}>
                <div style={{ height: '100%', width: '1.4%', background: t.accent }}/>
              </div>
            </div>
          </div>

          {/* Bismillah */}
          <div style={{ padding: '28px 40px 18px', textAlign: 'center', borderBottom: `1px solid ${t.line}` }}>
            <div style={{ fontFamily: 'Amiri Quran, serif', fontSize: 28, color: t.accentBright, direction: 'rtl' }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
          </div>

          {/* Verses */}
          <div style={{ padding: '6px 8px 30px' }}>
            {SAMPLE.baqaraVerses.map(v => (
              <div key={v.n} style={{
                padding: '20px 32px', borderBottom: `1px solid ${t.lineSoft}`,
                background: v.current ? `${t.accent}08` : 'transparent',
                position: 'relative',
              }}>
                {v.current && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: t.accent }}/>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18 }}>
                  <div style={{ width: 30, height: 30, flexShrink: 0, borderRadius: '50%', border: `1px solid ${v.current ? t.accent : t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces', fontSize: 11, color: v.current ? t.accentBright : t.inkDim }}>
                    {v.n}
                  </div>
                  <div style={{ flex: 1, textAlign: 'right', direction: 'rtl' }}>
                    <div style={{ fontFamily: 'Amiri Quran, serif', fontSize: 24, lineHeight: 2, color: t.ink, textWrap: 'pretty' }}>{v.ar}</div>
                    <div style={{ fontFamily: 'Fraunces', fontStyle: 'italic', fontWeight: 300, fontSize: 13, color: t.inkDim, marginTop: 8, lineHeight: 1.6, direction: 'ltr', textAlign: 'left' }}>{v.fr}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, opacity: v.current ? 1 : 0.4 }}>
                    {v.read && <Icon d={Icons.check} size={12} style={{ color: t.accent }}/>}
                    <Icon d={Icons.bookmark} size={12} style={{ color: t.inkMute }}/>
                    <Icon d={Icons.pen} size={12} style={{ color: t.inkMute }}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <SectionLabel>Progression</SectionLabel>
            <Stat icon={Icons.check} value="4 / 286" label="versets lus" t={t}/>
            <Stat icon={Icons.bookmark} value="2" label="signets" t={t}/>
            <Stat icon={Icons.pen} value="1" label="annotation" t={t}/>
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${t.line}` }}>
              <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>Estimation</div>
              <div style={{ fontFamily: 'Fraunces', fontSize: 14, color: t.ink, fontWeight: 300 }}>~4h30 restantes</div>
            </div>
          </Card>
          <Card>
            <SectionLabel>Aller au verset</SectionLabel>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <input style={{ flex: 1, padding: '8px 10px', background: t.bgSoft, border: `1px solid ${t.line}`, borderRadius: 7, color: t.ink, fontFamily: 'Inter', fontSize: 13 }} placeholder="N° de verset"/>
              <PrimaryBtn style={{ padding: '8px 14px' }}>Aller</PrimaryBtn>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 12 }}>
              {[1, 50, 100, 152, 183, 255, 286].map(n => (
                <span key={n} style={{ padding: '4px 9px', background: t.bgSoft, border: `1px solid ${t.line}`, borderRadius: 5, fontSize: 10.5, fontFamily: 'Fraunces', color: t.inkDim }}>v.{n}</span>
              ))}
            </div>
            <div style={{ fontSize: 9, color: t.inkMute, marginTop: 8, fontStyle: 'italic' }}>v.255 = Ayat al-Kursi</div>
          </Card>
        </div>
      </div>
    </AppFrame>
  );
};

// ─── Settings ───
const SettingsScreen = () => {
  const t = useT();
  return (
    <AppFrame active="settings" subtitle="Personnalisation · accessibilité · données" title="Réglages">
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 14 }}>
        <Card padding="14px 4px">
          {[['Profil', true],['Apparence'],['Langue'],['Notifications'],['Accessibilité'],['Récitation'],['Données'],['À propos']].map(([l, on]) => (
            <div key={l} style={{ padding: '9px 16px', fontSize: 12.5, color: on ? t.ink : t.inkDim, fontWeight: on ? 500 : 400, borderLeft: on ? `2px solid ${t.accent}` : '2px solid transparent', background: on ? `${t.accent}10` : 'transparent' }}>{l}</div>
          ))}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <SectionLabel>Profil</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${t.accent}, ${t.accentBright})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces', fontSize: 26, color: '#1a0f00', fontWeight: 500 }}>{SAMPLE.username[0]}</div>
              <div>
                <div style={{ fontFamily: 'Fraunces', fontSize: 19, color: t.ink, fontWeight: 300 }}>{SAMPLE.username}</div>
                <div style={{ fontSize: 11, color: t.inkDim, marginTop: 2 }}>nour@mishkat.app · membre depuis 2024</div>
                <GhostBtn style={{ marginTop: 8, padding: '5px 12px', fontSize: 11 }}>Modifier l'avatar</GhostBtn>
              </div>
            </div>
            <Field label="Nom d'utilisateur" value="Nour" t={t}/>
            <Field label="Email" value="nour@mishkat.app" t={t}/>
            <Field label="Ville (horaires de prière)" value="Casablanca, Maroc" t={t}/>
          </Card>

          <Card>
            <SectionLabel>Apparence</SectionLabel>
            <div style={{ fontSize: 11, color: t.inkDim, marginBottom: 10 }}>Thème</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {Object.entries(THEMES).map(([k, th]) => {
                const active = k === Object.keys(THEMES).find(x => THEMES[x] === t);
                return (
                  <div key={k} style={{ padding: 10, background: th.card, border: `1px solid ${active ? th.accent : t.line}`, borderRadius: 8, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                      <div style={{ width: 18, height: 18, borderRadius: 4, background: th.accent }}/>
                      <div style={{ width: 18, height: 18, borderRadius: 4, background: th.accentBright }}/>
                      <div style={{ width: 18, height: 18, borderRadius: 4, background: th.bg, border: `1px solid ${th.line}` }}/>
                    </div>
                    <div style={{ fontSize: 11, color: th.ink, fontWeight: 500 }}>{th.name}</div>
                    {active && <div style={{ fontSize: 9, color: th.accent, letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: 3 }}>Actuel</div>}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <SectionLabel>Accessibilité</SectionLabel>
            <Toggle label="Réduire les animations" on={false} t={t}/>
            <Toggle label="Police pour dyslexie (OpenDyslexic)" on={false} t={t}/>
            <Toggle label="Contraste élevé" on={false} t={t}/>
            <Toggle label="Effets sonores" on={true} t={t}/>
            <Field label="Taille de police" value="Moyenne" select t={t}/>
            <Field label="Espacement des lignes" value="Confortable" select t={t}/>
          </Card>
        </div>
      </div>
    </AppFrame>
  );
};

const Field = ({ label, value, select, t }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: `1px solid ${t.lineSoft}` }}>
    <span style={{ fontSize: 12, color: t.inkDim }}>{label}</span>
    <span style={{ fontSize: 12.5, color: t.ink, display: 'flex', alignItems: 'center', gap: 6 }}>{value} {select && <Icon d={Icons.arrowDown} size={11} style={{color:t.inkMute}}/>}</span>
  </div>
);

const Toggle = ({ label, on, t }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: `1px solid ${t.lineSoft}` }}>
    <span style={{ fontSize: 12, color: t.ink }}>{label}</span>
    <div style={{ width: 36, height: 20, borderRadius: 999, background: on ? t.accent : t.cardElev, border: `1px solid ${on ? t.accent : t.line}`, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 1, left: on ? 17 : 1, width: 16, height: 16, borderRadius: '50%', background: '#fff' }}/>
    </div>
  </div>
);

// ─── Admin ───
const AdminScreen = () => {
  const t = useT();
  return (
    <AppFrame active="admin" subtitle="Gestion utilisateurs · stats globales" title="Admin" headerRight={
      <div style={{ display: 'flex', gap: 8 }}>
        <GhostBtn icon={<Icon d={Icons.download} size={13}/>}>Export CSV</GhostBtn>
        <PrimaryBtn icon={<Icon d={Icons.plus} size={13}/>}>Inviter</PrimaryBtn>
      </div>
    }>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 18 }}>
        <MemoStat label="Utilisateurs" value="1 247" sub="+82 ce mois" t={t}/>
        <MemoStat label="Actifs 7j" value="894" sub="71.7%" t={t}/>
        <MemoStat label="Hafiz complets" value="3" sub="à célébrer" t={t}/>
        <MemoStat label="Versets / jour" value="3 142" sub="moyenne globale" t={t}/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
        <Card padding="0">
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 10.5, color: t.inkMute, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Utilisateurs récents</div>
            <span style={{ fontSize: 11, color: t.inkDim }}>5 sur 1 247</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.line}` }}>
                {['Nom','Email','Sourates','Streak','Rôle','Inscrit',''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 9.5, color: t.inkMute, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAMPLE.adminUsers.map((u, i) => (
                <tr key={u.email} style={{ borderBottom: i < 4 ? `1px solid ${t.lineSoft}` : 'none' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.cardElev, border: `1px solid ${t.line}`, fontFamily: 'Fraunces', fontSize: 12, color: t.accentBright, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{u.name[0]}</div>
                      <span style={{ fontSize: 12.5, color: t.ink, fontWeight: 500 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 11.5, color: t.inkDim }}>{u.email}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: t.ink, fontFamily: 'Fraunces' }}>{u.surahs}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: u.streak > 30 ? t.accentBright : t.inkDim }}>
                      <Icon d={Icons.flame} size={11}/>{u.streak}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 9.5, padding: '3px 8px', borderRadius: 4, background: u.role === 'admin' ? `${t.accent}22` : t.cardElev, color: u.role === 'admin' ? t.accentBright : t.inkDim, letterSpacing: '0.16em', textTransform: 'uppercase' }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 11, color: t.inkMute }}>{u.joined}</td>
                  <td style={{ padding: '12px 14px' }}><Icon d={Icons.more} size={13} style={{ color: t.inkMute }}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <SectionLabel>Activité (7j)</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 90, marginTop: 8 }}>
              {[60, 78, 85, 72, 90, 95, 82].map((v, i) => (
                <div key={i} style={{ flex: 1, height: `${v}%`, background: i === 6 ? t.accent : t.accentSoft, borderRadius: '3px 3px 0 0', opacity: i === 6 ? 1 : 0.6 }}/>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9, color: t.inkMute }}>
              {['L','M','M','J','V','S','D'].map((d, i) => <span key={i}>{d}</span>)}
            </div>
          </Card>
          <Card>
            <SectionLabel>Sourates les + populaires</SectionLabel>
            {[['Al-Fatihah', 1247],['Al-Ikhlas', 1102],['Al-Mulk', 643],['Ya-Sin', 524]].map(([n, c]) => (
              <div key={n} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${t.lineSoft}`, fontSize: 12 }}>
                <span style={{ color: t.ink }}>{n}</span>
                <span style={{ color: t.inkDim, fontFamily: 'Fraunces' }}>{c.toLocaleString()}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </AppFrame>
  );
};

// ─── Auth (login) ───
const AuthScreen = () => {
  const t = useT();
  return (
    <div style={{ width: 1280, height: 820, background: t.bg, color: t.ink, display: 'flex', overflow: 'hidden', fontFamily: 'Inter, sans-serif', position: 'relative' }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none' }}>
        <defs>
          <pattern id="authpat" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <rect x="20" y="20" width="40" height="40" fill="none" stroke={t.accent} strokeWidth="0.5" />
            <rect x="20" y="20" width="40" height="40" fill="none" stroke={t.accent} strokeWidth="0.5" transform="rotate(45 40 40)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#authpat)" />
      </svg>

      {/* Left: visual */}
      <div style={{ flex: 1, padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', borderRight: `1px solid ${t.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <LanternMark size={42} color={t.accent}/>
          <div>
            <div style={{ fontFamily: 'Fraunces', fontSize: 22, color: t.ink, fontWeight: 300 }}>Mishkat</div>
            <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.32em', textTransform: 'uppercase' }}>مِشْكَاة · حِفْظ القرآن</div>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <svg width="500" height="500" viewBox="0 0 500 500" fill="none" style={{ position: 'absolute', left: -50, top: -50, opacity: 0.4 }}>
            <circle cx="250" cy="250" r="200" stroke={t.accent} strokeWidth="0.4"/>
            <circle cx="250" cy="250" r="160" stroke={t.accent} strokeWidth="0.4"/>
            <circle cx="250" cy="250" r="120" stroke={t.accent} strokeWidth="0.4"/>
            <path d="M 250 50 L 290 130 L 380 130 L 320 190 L 350 280 L 250 220 L 150 280 L 180 190 L 120 130 L 210 130 Z" fill={t.accent} opacity="0.2"/>
          </svg>
          <div style={{ position: 'relative', maxWidth: 460 }}>
            <div style={{ fontFamily: 'Amiri Quran, serif', fontSize: 32, color: t.ink, lineHeight: 1.7, direction: 'rtl', textAlign: 'right' }}>اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ</div>
            <div style={{ fontFamily: 'Fraunces', fontStyle: 'italic', fontWeight: 300, fontSize: 15, color: t.inkDim, marginTop: 14, lineHeight: 1.6 }}>« Lis, au nom de ton Seigneur qui a créé. »</div>
            <div style={{ fontSize: 10, color: t.accentBright, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 8 }}>Al-ʿAlaq · 96:1</div>
          </div>
        </div>

        <div style={{ fontSize: 10.5, color: t.inkMute, letterSpacing: '0.16em' }}>UNE LANTERNE POUR LA MÉMOIRE DU CŒUR</div>
      </div>

      {/* Right: form */}
      <div style={{ width: 480, padding: '60px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: t.bgSoft }}>
        <div style={{ fontSize: 11, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>Bienvenue</div>
        <h1 style={{ fontFamily: 'Fraunces', fontWeight: 300, fontSize: 36, margin: 0, color: t.ink, letterSpacing: '-0.02em', marginBottom: 32 }}>Reprenez votre mémorisation</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 10.5, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>Email</div>
            <input style={{ width: '100%', padding: '12px 14px', background: t.card, border: `1px solid ${t.line}`, borderRadius: 8, color: t.ink, fontFamily: 'Inter', fontSize: 13 }} value="nour@mishkat.app" readOnly/>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10.5, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Mot de passe</span>
              <span style={{ fontSize: 10.5, color: t.accentBright }}>Oublié ?</span>
            </div>
            <input type="password" style={{ width: '100%', padding: '12px 14px', background: t.card, border: `1px solid ${t.line}`, borderRadius: 8, color: t.ink, fontFamily: 'Inter', fontSize: 13 }} value="••••••••••" readOnly/>
          </div>
          <PrimaryBtn style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 8 }} icon={<Icon d={Icons.arrow} size={14}/>}>Continuer</PrimaryBtn>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
          <div style={{ flex: 1, height: 1, background: t.line }}/>
          <span style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase' }}>ou</span>
          <div style={{ flex: 1, height: 1, background: t.line }}/>
        </div>

        <GhostBtn style={{ width: '100%', justifyContent: 'center', padding: '12px' }} icon={<Icon d={Icons.globe} size={13}/>}>Continuer avec Google</GhostBtn>

        <div style={{ marginTop: 32, fontSize: 11.5, color: t.inkDim, textAlign: 'center' }}>
          Première visite ? <span style={{ color: t.accentBright, fontWeight: 500 }}>Créer un compte</span>
        </div>
      </div>
    </div>
  );
};

window.AlBaqaraScreen = AlBaqaraScreen;
window.SettingsScreen = SettingsScreen;
window.AdminScreen = AdminScreen;
window.AuthScreen = AuthScreen;

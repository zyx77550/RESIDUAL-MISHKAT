let ctx: AudioContext | null = null;
let _enabled = true;

export function setSoundEnabled(v: boolean) { _enabled = v; }

async function getCtx(): Promise<AudioContext> {
  if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  if (ctx.state === 'suspended') await ctx.resume();
  return ctx;
}

function tone(
  ac: AudioContext,
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType = 'sine',
  peak = 0.25,
) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peak, start + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.start(start);
  osc.stop(start + duration + 0.01);
}

// Soft bead click for Tasbih
export async function playTasbihTap() {
  if (!_enabled) return;
  try {
    const ac = await getCtx();
    const t = ac.currentTime;
    tone(ac, 600, t, 0.07, 'sine', 0.28);
    tone(ac, 200, t, 0.05, 'triangle', 0.10);
  } catch {}
}

// Ascending two-note chime for Kanban advance
export async function playKanbanAdvance() {
  if (!_enabled) return;
  try {
    const ac = await getCtx();
    const t = ac.currentTime;
    tone(ac, 392, t, 0.10, 'sine', 0.18);
    tone(ac, 523, t + 0.09, 0.14, 'sine', 0.18);
  } catch {}
}

// Celebratory arpeggio for badge unlock
export async function playBadgeUnlock() {
  if (!_enabled) return;
  try {
    const ac = await getCtx();
    const t = ac.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => {
      tone(ac, f, t + i * 0.1, 0.28, 'sine', 0.20);
    });
    tone(ac, 3500, t + 0.32, 0.12, 'sine', 0.05);
  } catch {}
}

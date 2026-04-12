import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useScroll, useMotionValueEvent } from 'framer-motion';
import { NotebookPen, Edit2, ChevronRight, ChevronLeft, Plus, Save, Check, Undo, Redo, Trash2, Eraser, Ruler, Download, X, Settings2, Pencil, Brush, Highlighter, Palette, Star, Wind, Zap, Pen } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { cn } from '../lib/utils';
import { Stroke, Shape, DiftarPage, UserData } from '../types';

// Page templates
const PAGE_TEMPLATES = [
  { type: 'revision',   icon: '📖', labelFr: 'Révision',   labelAr: 'مراجعة', paperStyle: 'lines'     as const, paperColor: '#fdfcf8', defaultTitle: { fr: 'Révision', ar: 'مراجعة' } },
  { type: 'tafsir',     icon: '🔍', labelFr: 'Tafsir',     labelAr: 'تفسير',  paperStyle: 'arabesque' as const, paperColor: '#f4ecd8', defaultTitle: { fr: 'Tafsir', ar: 'تفسير' } },
  { type: 'dates',      icon: '📅', labelFr: 'Planning',   labelAr: 'تخطيط',  paperStyle: 'grid'      as const, paperColor: '#fdfcf8', defaultTitle: { fr: 'Planning', ar: 'تخطيط' } },
  { type: 'objectives', icon: '🎯', labelFr: 'Objectifs',  labelAr: 'أهداف',  paperStyle: 'dots'      as const, paperColor: '#fff0f3', defaultTitle: { fr: 'Objectifs', ar: 'أهداف' } },
  { type: 'custom',     icon: '✨', labelFr: 'Libre',      labelAr: 'حر',     paperStyle: 'blank'     as const, paperColor: '#ffffff',  defaultTitle: { fr: 'Nouvelle Page', ar: 'صفحة جديدة' } },
];

const PAPER_COLOR_NAMES: Record<string, string> = {
  '#fdfcf8': 'Crème', '#ffffff': 'Blanc', '#f4ecd8': 'Sépia',
  '#0f172a': 'Nuit', '#f0f7f0': 'Sauge', '#fff0f3': 'Rose',
};

// All shapes, organized by category
const SHAPE_CATEGORIES = [
  {
    label: { fr: 'Géométriques', ar: 'هندسية' },
    shapes: [
      { id: 'circle',    type: 'circle'    as const, label: { fr: 'Cercle',    ar: 'دائرة'  } },
      { id: 'square',    type: 'square'    as const, label: { fr: 'Carré',     ar: 'مربع'   } },
      { id: 'rectangle', type: 'rectangle' as const, label: { fr: 'Rectangle', ar: 'مستطيل' } },
      { id: 'triangle',  type: 'triangle'  as const, label: { fr: 'Triangle',  ar: 'مثلث'   } },
      { id: 'diamond',   type: 'diamond'   as const, label: { fr: 'Losange',   ar: 'معين'   } },
      { id: 'hexagon',   type: 'hexagon'   as const, label: { fr: 'Hexagone',  ar: 'سداسي'  } },
      { id: 'pentagon',  type: 'pentagon'  as const, label: { fr: 'Pentagone', ar: 'خماسي'  } },
    ],
  },
  {
    label: { fr: 'Décoratifs', ar: 'زخرفية' },
    shapes: [
      { id: 'star',     type: 'star'     as const, label: { fr: 'Étoile',    ar: 'نجمة'  } },
      { id: 'heart',    type: 'heart'    as const, label: { fr: 'Cœur',      ar: 'قلب'   } },
      { id: 'crescent', type: 'crescent' as const, label: { fr: 'Croissant', ar: 'هلال'  } },
    ],
  },
  {
    label: { fr: 'Lignes', ar: 'خطوط' },
    shapes: [
      { id: 'line',  type: 'line'  as const, label: { fr: 'Ligne', ar: 'خط'  } },
      { id: 'arrow', type: 'arrow' as const, label: { fr: 'Flèche', ar: 'سهم' } },
    ],
  },
];

// Color palette organized by category
const COLOR_PALETTE = {
  classiques: [
    '#000000', '#1a1a1a', '#4a4a4a', '#888888', '#cccccc', '#ffffff',
    '#8B2635', '#D4AF37', '#1D3557', '#2A9D8F', '#264653', '#5f4339',
  ],
  pastels: [
    '#FFD6E7', '#FFC9D0', '#FFDAB9', '#FFF3CD', '#D1F5E0', '#C7ECEE',
    '#D0D9FF', '#E8D5FF', '#FFE4E1', '#F0E6FF', '#E0F4FF', '#F5F5DC',
  ],
  vives: [
    '#E63946', '#F4722B', '#F9C74F', '#43AA8B', '#00B4D8', '#7B2FBE',
    '#FF006E', '#FB5607', '#FFBE0B', '#06D6A0', '#118AB2', '#8338EC',
  ],
  sombres: [
    '#0f172a', '#1e293b', '#2d1b69', '#14213d', '#1b4332', '#3d0000',
    '#4a1942', '#7c3f00', '#1a3c1a', '#002855', '#4b0082', '#660000',
  ],
  speciaux: [
    'gradient:gold-red', 'gradient:blue-cyan', 'gradient:purple-pink',
    'gradient:green-teal', 'gradient:sunset', 'gradient:ocean',
    'pattern:dots', 'pattern:stripes', 'pattern:crosses',
  ],
};

export const Diftar = ({ userData, setUserData, lang }: { userData: UserData; setUserData: React.Dispatch<React.SetStateAction<UserData>>; lang: string }) => {
  const [activePageId, setActivePageId]     = useState<string | null>(null);
  const [editingPageId, setEditingPageId]   = useState<string | null>(null);
  const [tool, setTool]                     = useState<'pen' | 'highlighter' | 'fountain-pen' | 'chalk' | 'eraser' | 'ruler' | 'spray' | 'marker' | 'neon' | 'pencil' | 'watercolor'>('pen');
  const [shapeSize, setShapeSize]           = useState(60);
  const [showToolsMenu, setShowToolsMenu]           = useState(false);
  const [showCustomizationMenu, setShowCustomizationMenu] = useState(false);
  const [color, setColor]                   = useState('#8B2635');
  const [colorTab, setColorTab]             = useState<keyof typeof COLOR_PALETTE>('classiques');
  const [width, setWidth]                   = useState(3);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [undoStack, setUndoStack]           = useState<{ strokes: Stroke[]; shapes: Shape[] }[]>([]);
  const [redoStack, setRedoStack]           = useState<{ strokes: Stroke[]; shapes: Shape[] }[]>([]);
  const [currentStrokes, setCurrentStrokes] = useState<Stroke[]>([]);
  const [shapes, setShapes]             = useState<Shape[]>([]);
  const [showShapePicker, setShowShapePicker]   = useState(false);
  const [shapeCategory, setShapeCategory]       = useState(0);
  const [showPaperSettings, setShowPaperSettings]   = useState(false);
  const [isSaving, setIsSaving]             = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [paperStyle, setPaperStyle]         = useState<'lines'|'blank'|'grid'|'dots'|'arabesque'>('lines');
  const [paperColor, setPaperColor]         = useState('#fdfcf8');
  const [pageHeight, setPageHeight]         = useState(5000);
  const [canvasScale, setCanvasScale]       = useState(1);
  const isDrawingRef    = useRef(false);
  const activeStrokeRef = useRef<Stroke | null>(null);
  const stickerCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [activeShapeType, setActiveShapeType] = useState<Shape['type'] | null>(null);
  const activeShapeTypeRef = useRef<Shape['type'] | null>(null);
  const setActiveShapeTypeWithRef = useCallback((val: Shape['type'] | null) => {
    activeShapeTypeRef.current = val;
    setActiveShapeType(val);
  }, []);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [showConfirmClear, setShowConfirmClear]   = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isDrawing, setIsDrawing]           = useState(false);
  const [toastMessage, setToastMessage]     = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const staticBufferRef = useRef<HTMLCanvasElement | null>(null);

  const activePage = userData.diftarPages.find(p => p.id === activePageId);

  const updateStaticBuffer = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!staticBufferRef.current) staticBufferRef.current = document.createElement('canvas');
    const sb = staticBufferRef.current;
    if (sb.width !== canvas.width || sb.height !== canvas.height) { sb.width = canvas.width; sb.height = canvas.height; }
    const sctx = sb.getContext('2d');
    if (!sctx) return;
    sctx.clearRect(0, 0, sb.width, sb.height);

    const renderStroke = (stroke, targetCtx) => {
      if (stroke.type === 'spray') {
        if (stroke.points.length === 0) return;
        targetCtx.save(); targetCtx.fillStyle = stroke.color; targetCtx.globalAlpha = 0.75;
        stroke.points.forEach((point: {x:number;y:number}, pi: number) => {
          const base = ((point.x * 97 + point.y * 31 + pi * 17) | 0);
          for (let i = 0; i < 10; i++) {
            const h1 = ((base + i * 1103515245 + 12345) >>> 0) % 1000;
            const h2 = ((h1 * 22695477 + 1) >>> 0) % 1000;
            targetCtx.beginPath();
            targetCtx.arc(point.x + Math.cos((h1/1000)*Math.PI*2)*(h2/1000)*stroke.width*2.5, point.y + Math.sin((h1/1000)*Math.PI*2)*(h2/1000)*stroke.width*2.5, 0.7, 0, Math.PI*2);
            targetCtx.fill();
          }
        });
        targetCtx.restore(); return;
      }
      if (stroke.points.length < 2) return;
      targetCtx.save();
      targetCtx.beginPath();
      targetCtx.strokeStyle = getStrokeStyle(targetCtx, stroke);
      targetCtx.lineJoin = 'round';
      if (stroke.type === 'highlighter') {
        targetCtx.globalCompositeOperation = 'multiply'; targetCtx.globalAlpha = 0.4;
        targetCtx.lineCap = 'square'; targetCtx.lineWidth = stroke.width * 2.5;
      } else if (stroke.type === 'fountain-pen') {
        targetCtx.globalCompositeOperation = 'source-over'; targetCtx.lineCap = 'butt';
        targetCtx.lineWidth = stroke.width * 1.2; targetCtx.setTransform(1, 0, 0.4, 1, 0, 0);
      } else if (stroke.type === 'chalk') {
        targetCtx.globalCompositeOperation = 'source-over'; targetCtx.globalAlpha = 0.75;
        targetCtx.lineCap = 'round'; targetCtx.lineWidth = stroke.width * 2;
        targetCtx.setLineDash([2, 3]); targetCtx.shadowBlur = 4; targetCtx.shadowColor = stroke.color;
      } else if (stroke.type === 'eraser') {
        targetCtx.globalCompositeOperation = 'destination-out'; targetCtx.strokeStyle = 'rgba(0,0,0,1)';
        targetCtx.lineCap = 'round'; targetCtx.lineWidth = stroke.width * 4;
      } else if (stroke.type === 'marker') {
        targetCtx.globalCompositeOperation = 'source-over'; targetCtx.globalAlpha = 0.65;
        targetCtx.lineCap = 'square'; targetCtx.lineWidth = stroke.width * 2;
      } else if (stroke.type === 'neon') {
        targetCtx.globalCompositeOperation = 'source-over'; targetCtx.lineCap = 'round';
        targetCtx.lineWidth = stroke.width; targetCtx.shadowBlur = stroke.width * 5;
        targetCtx.shadowColor = stroke.color; targetCtx.globalAlpha = 0.95;
      } else if (stroke.type === 'pencil') {
        targetCtx.globalCompositeOperation = 'source-over'; targetCtx.globalAlpha = 0.55;
        targetCtx.lineCap = 'round'; targetCtx.lineWidth = stroke.width * 0.85; targetCtx.setLineDash([1, 1.2]);
      } else if (stroke.type === 'watercolor') {
        targetCtx.globalCompositeOperation = 'source-over'; targetCtx.globalAlpha = 0.16;
        targetCtx.lineCap = 'round'; targetCtx.lineWidth = stroke.width * 5;
        targetCtx.shadowBlur = stroke.width * 4; targetCtx.shadowColor = stroke.color;
      } else {
        targetCtx.globalCompositeOperation = 'source-over'; targetCtx.lineCap = 'round'; targetCtx.lineWidth = stroke.width;
      }
      targetCtx.moveTo(stroke.points[0].x, stroke.points[0].y);
      if (stroke.type === 'ruler') {
        const last = stroke.points[stroke.points.length - 1]; targetCtx.lineTo(last.x, last.y);
      } else {
        for (let i = 1; i < stroke.points.length - 1; i++) {
          const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
          const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
          targetCtx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, xc, yc);
        }
        const last = stroke.points[stroke.points.length - 1]; targetCtx.lineTo(last.x, last.y);
      }
      targetCtx.stroke(); targetCtx.restore();
    };

    currentStrokes.forEach(s => renderStroke(s, sctx));
    shapes.forEach((shape) => {
      sctx.save(); sctx.strokeStyle = shape.color; sctx.fillStyle = shape.color; sctx.lineWidth = 2;
      sctx.translate(shape.x, shape.y); if (shape.rotation) sctx.rotate((shape.rotation * Math.PI) / 180);
      const w = shape.width, h = shape.height;
      switch (shape.type) {
        case 'circle':    sctx.beginPath(); sctx.arc(0, 0, w / 2, 0, Math.PI * 2); sctx.fill(); break;
        case 'square':    sctx.fillRect(-w / 2, -h / 2, w, h); break;
        case 'rectangle': sctx.fillRect(-w / 2, -h / 2, w, h); break;
        case 'triangle':  sctx.beginPath(); sctx.moveTo(0, -h / 2); sctx.lineTo(-w / 2, h / 2); sctx.lineTo(w / 2, h / 2); sctx.closePath(); sctx.fill(); break;
        case 'diamond':   sctx.beginPath(); sctx.moveTo(0, -h / 2); sctx.lineTo(w / 2, 0); sctx.lineTo(0, h / 2); sctx.lineTo(-w / 2, 0); sctx.closePath(); sctx.fill(); break;
        case 'hexagon': { sctx.beginPath(); for (let i = 0; i < 6; i++) { const a = (i * Math.PI) / 3 - Math.PI / 6; i === 0 ? sctx.moveTo(Math.cos(a) * w / 2, Math.sin(a) * h / 2) : sctx.lineTo(Math.cos(a) * w / 2, Math.sin(a) * h / 2); } sctx.closePath(); sctx.fill(); break; }
        case 'pentagon': { sctx.beginPath(); for (let i = 0; i < 5; i++) { const a = (i * 2 * Math.PI) / 5 - Math.PI / 2; i === 0 ? sctx.moveTo(Math.cos(a) * w / 2, Math.sin(a) * h / 2) : sctx.lineTo(Math.cos(a) * w / 2, Math.sin(a) * h / 2); } sctx.closePath(); sctx.fill(); break; }
        case 'star': { sctx.beginPath(); for (let i = 0; i < 10; i++) { const a = (i * Math.PI) / 5 - Math.PI / 2; const r = i % 2 === 0 ? w / 2 : w / 4; i === 0 ? sctx.moveTo(Math.cos(a) * r, Math.sin(a) * r) : sctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } sctx.closePath(); sctx.fill(); break; }
        case 'heart': { const hw = w / 2, hh = h / 2; sctx.beginPath(); sctx.moveTo(0, hh * 0.9); sctx.bezierCurveTo(hw * 1.4, hh * 0.4, hw * 1.4, -hh * 0.4, hw, -hh * 0.2); sctx.bezierCurveTo(hw * 0.7, -hh * 0.9, 0, -hh * 0.8, 0, -hh * 0.3); sctx.bezierCurveTo(0, -hh * 0.8, -hw * 0.7, -hh * 0.9, -hw, -hh * 0.2); sctx.bezierCurveTo(-hw * 1.4, -hh * 0.4, -hw * 1.4, hh * 0.4, 0, hh * 0.9); sctx.closePath(); sctx.fill(); break; }
        case 'crescent': { sctx.beginPath(); sctx.arc(0, 0, w / 2, 0, Math.PI * 2, false); sctx.arc(w * 0.22, -h * 0.08, w * 0.42, 0, Math.PI * 2, true); sctx.fill('evenodd'); break; }
        case 'line':  sctx.beginPath(); sctx.moveTo(-w / 2, 0); sctx.lineTo(w / 2, 0); sctx.stroke(); break;
        case 'arrow': { const aw = Math.min(15, w * 0.2); sctx.beginPath(); sctx.moveTo(-w / 2, 0); sctx.lineTo(w / 2 - aw, 0); sctx.moveTo(w / 2 - aw, 0); sctx.lineTo(w / 2 - aw - 6, -aw * 0.5); sctx.moveTo(w / 2 - aw, 0); sctx.lineTo(w / 2 - aw - 6, aw * 0.5); sctx.stroke(); break; }
      }
      sctx.restore();
    });
  }, [currentStrokes, shapes, paperColor]);

  const SIZE_PRESETS = [
    { label: lang === 'fr' ? 'Fin' : 'رفيع',    value: 1  },
    { label: lang === 'fr' ? 'Normal' : 'عادي',  value: 3  },
    { label: lang === 'fr' ? 'Épais' : 'سميك',   value: 8  },
    { label: lang === 'fr' ? 'Gros' : 'كبير',    value: 15 },
    { label: lang === 'fr' ? 'XL' : 'ضخم',       value: 25 },
  ];

  const PAPER_COLORS = [
    { label: lang === 'fr' ? 'Crème' : 'كريم',   value: '#fdfcf8' },
    { label: lang === 'fr' ? 'Blanc' : 'أبيض',   value: '#ffffff' },
    { label: lang === 'fr' ? 'Sépia' : 'بني',    value: '#f4ecd8' },
    { label: lang === 'fr' ? 'Bleu nuit' : 'ليلي', value: '#0f172a' },
    { label: lang === 'fr' ? 'Vert sage' : 'أخضر',value: '#f0f7f0' },
    { label: lang === 'fr' ? 'Rose pâle' : 'وردي', value: '#fff0f3' },
  ];

  const getBrandColorForPaper = (pc: string) => {
    if (pc === '#0f172a') return '#D4AF37';
    return '#8B2635';
  };

  const getColoredStickerSvg = (svg: string, pc: string) => {
    const brandColor = getBrandColorForPaper(pc);
    let colored = svg
      .replace('<svg ', `<svg width="60" height="60" `)
      .replace(/currentColor/g, brandColor);
    return colored;
  };

  const getStrokeStyle = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.color === 'pattern:dots') {
      const pc = document.createElement('canvas'); pc.width = 10; pc.height = 10;
      const pctx = pc.getContext('2d')!;
      pctx.fillStyle = '#8B2635'; pctx.beginPath(); pctx.arc(5, 5, 2, 0, Math.PI * 2); pctx.fill();
      return ctx.createPattern(pc, 'repeat') || '#8B2635';
    }
    if (stroke.color === 'pattern:stripes') {
      const pc = document.createElement('canvas'); pc.width = 10; pc.height = 10;
      const pctx = pc.getContext('2d')!;
      pctx.strokeStyle = '#D4AF37'; pctx.lineWidth = 2; pctx.beginPath(); pctx.moveTo(0, 0); pctx.lineTo(10, 10); pctx.stroke();
      return ctx.createPattern(pc, 'repeat') || '#D4AF37';
    }
    if (stroke.color === 'pattern:crosses') {
      const pc = document.createElement('canvas'); pc.width = 12; pc.height = 12;
      const pctx = pc.getContext('2d')!;
      pctx.strokeStyle = '#2A9D8F'; pctx.lineWidth = 1.5;
      pctx.beginPath(); pctx.moveTo(6, 0); pctx.lineTo(6, 12);
      pctx.moveTo(0, 6); pctx.lineTo(12, 6); pctx.stroke();
      return ctx.createPattern(pc, 'repeat') || '#2A9D8F';
    }
    const gradients: Record<string, [string, string]> = {
      'gradient:gold-red':    ['#D4AF37', '#8B2635'],
      'gradient:blue-cyan':   ['#1D3557', '#A8DADC'],
      'gradient:purple-pink': ['#6D597A', '#FF99C8'],
      'gradient:green-teal':  ['#2D6A4F', '#95D5B2'],
      'gradient:sunset':      ['#F4A261', '#E76F51'],
      'gradient:ocean':       ['#03045E', '#90E0EF'],
    };
    if (gradients[stroke.color]) {
      const [c1, c2] = gradients[stroke.color];
      const grad = ctx.createLinearGradient(0, 0, 1000, 1400);
      grad.addColorStop(0, c1); grad.addColorStop(1, c2);
      return grad;
    }
    return stroke.color;
  };

  useEffect(() => {
    if (activePage) {
      setCurrentStrokes(activePage.strokes || []);
      setShapes((activePage.shapes as any) || []);
      setPageHeight(activePage.height || 5000);
      setPaperStyle(activePage.paperStyle || 'lines');
      setPaperColor((activePage as any).paperColor || '#fdfcf8');
      setUndoStack([]);
      setRedoStack([]);
    }
  }, [activePageId]);

  useEffect(() => {
    if (!activePageId) return;
    const username = (userData.settings.username || '').trim();
    const message = username.toLowerCase() === 'rahima'
      ? (lang === 'fr' ? `Bienvenue Rahima, votre Diftar est prêt.` : `مرحبا يا رحيمة، دفترك جاهز للكتابة.`)
      : (lang === 'fr' ? `Bienvenue ${username}, votre Diftar est prêt.` : `أهلاً ${username}، دفترك جاهز.`);

    setToastMessage(message);
    const timer = window.setTimeout(() => setToastMessage(null), 4500);
    return () => window.clearTimeout(timer);
  }, [activePageId, lang, userData.settings.username]);

  const drawPaperLines = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    if (paperStyle === 'blank') return;
    const isDark = paperColor === '#0f172a';
    const lineColor = isDark ? 'rgba(255,255,255,0.08)' : '#8B263512';
    const marginColor = isDark ? 'rgba(255,255,255,0.15)' : '#8B263528';

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;

    if (paperStyle === 'lines' || paperStyle === 'grid') {
      for (let y = 60; y < h; y += 32) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
    }
    if (paperStyle === 'grid') {
      for (let x = 0; x < w; x += 32) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    }
    if (paperStyle === 'dots') {
      for (let x = 32; x < w; x += 32) {
        for (let y = 32; y < h; y += 32) { ctx.moveTo(x, y); ctx.arc(x, y, 0.7, 0, Math.PI * 2); }
      }
    }
    if (paperStyle === 'arabesque') {
      for (let y = 60; y < h; y += 32) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      for (let y = 80; y < h; y += 96) {
        ctx.save();
        ctx.strokeStyle = isDark ? 'rgba(212,175,55,0.15)' : '#D4AF3720';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < w; x += 20) {
          ctx.moveTo(x, y); ctx.lineTo(x + 10, y - 10); ctx.lineTo(x + 20, y);
        }
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = marginColor;
    ctx.lineWidth = 1.5;
    const marginX = lang === 'ar' ? w - 80 : 80;
    ctx.moveTo(marginX, 0); ctx.lineTo(marginX, h);
    ctx.stroke();

    ctx.restore();
  };

  const handleManualScroll = (yPercent: number) => {
    const sc = scrollContainerRef.current;
    if (!sc) return;
    sc.scrollTop = yPercent * (sc.scrollHeight - sc.clientHeight);
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = paperColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPaperLines(ctx, canvas.width, canvas.height);

    if (!offscreenRef.current) offscreenRef.current = document.createElement('canvas');
    const strokesLayer = offscreenRef.current;
    if (strokesLayer.width !== canvas.width || strokesLayer.height !== canvas.height) {
      strokesLayer.width = canvas.width;
      strokesLayer.height = canvas.height;
    }
    const sctx = strokesLayer.getContext('2d')!;
    sctx.clearRect(0, 0, strokesLayer.width, strokesLayer.height);

    if (staticBufferRef.current) {
      sctx.drawImage(staticBufferRef.current, 0, 0);
    }

    if (activeStrokeRef.current) {
      const stroke = activeStrokeRef.current;
      sctx.save();
      if (stroke.type === 'spray') {
        sctx.fillStyle = stroke.color; sctx.globalAlpha = 0.75;
        stroke.points.forEach((point: {x:number;y:number}, pi: number) => {
          const base = ((point.x * 97 + point.y * 31 + pi * 17) | 0);
          for (let i = 0; i < 10; i++) {
            const h1 = ((base + i * 1103515245 + 12345) >>> 0) % 1000;
            const h2 = ((h1 * 22695477 + 1) >>> 0) % 1000;
            sctx.beginPath();
            sctx.arc(point.x + Math.cos((h1/1000)*Math.PI*2)*(h2/1000)*stroke.width*2.5, point.y + Math.sin((h1/1000)*Math.PI*2)*(h2/1000)*stroke.width*2.5, 0.7, 0, Math.PI*2);
            sctx.fill();
          }
        });
      } else {
        sctx.beginPath();
        if (stroke.type === 'eraser') {
          sctx.globalCompositeOperation = 'destination-out';
          sctx.strokeStyle = 'rgba(0,0,0,1)';
          sctx.lineCap = 'round';
          sctx.lineWidth = stroke.width * 4;
        } else {
          sctx.strokeStyle = getStrokeStyle(sctx, stroke);
          sctx.lineJoin = 'round';
          if (stroke.type === 'highlighter') {
            sctx.globalCompositeOperation = 'multiply'; sctx.globalAlpha = 0.4; sctx.lineCap = 'square'; sctx.lineWidth = stroke.width * 2.5;
          } else if (stroke.type === 'fountain-pen') {
            sctx.globalCompositeOperation = 'source-over'; sctx.lineCap = 'butt'; sctx.lineWidth = stroke.width * 1.2; sctx.setTransform(1, 0, 0.4, 1, 0, 0);
          } else if (stroke.type === 'chalk') {
            sctx.globalCompositeOperation = 'source-over'; sctx.globalAlpha = 0.75; sctx.lineCap = 'round'; sctx.lineWidth = stroke.width * 2; sctx.setLineDash([2, 3]); sctx.shadowBlur = 4; sctx.shadowColor = stroke.color;
          } else if (stroke.type === 'marker') {
            sctx.globalCompositeOperation = 'source-over'; sctx.globalAlpha = 0.65; sctx.lineCap = 'square'; sctx.lineWidth = stroke.width * 2;
          } else if (stroke.type === 'neon') {
            sctx.globalCompositeOperation = 'source-over'; sctx.lineCap = 'round'; sctx.lineWidth = stroke.width; sctx.shadowBlur = stroke.width * 5; sctx.shadowColor = stroke.color; sctx.globalAlpha = 0.95;
          } else if (stroke.type === 'pencil') {
            sctx.globalCompositeOperation = 'source-over'; sctx.globalAlpha = 0.55; sctx.lineCap = 'round'; sctx.lineWidth = stroke.width * 0.85; sctx.setLineDash([1, 1.2]);
          } else if (stroke.type === 'watercolor') {
            sctx.globalCompositeOperation = 'source-over'; sctx.globalAlpha = 0.16; sctx.lineCap = 'round'; sctx.lineWidth = stroke.width * 5; sctx.shadowBlur = stroke.width * 4; sctx.shadowColor = stroke.color;
          } else {
            sctx.globalCompositeOperation = 'source-over'; sctx.lineCap = 'round'; sctx.lineWidth = stroke.width;
          }
        }
        if (stroke.points.length > 0) {
          sctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          if (stroke.type === 'ruler') {
            const last = stroke.points[stroke.points.length - 1]; sctx.lineTo(last.x, last.y);
          } else {
            for (let i = 1; i < stroke.points.length - 1; i++) {
              const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
              const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
              sctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, xc, yc);
            }
            const last = stroke.points[stroke.points.length - 1]; sctx.lineTo(last.x, last.y);
          }
          sctx.stroke();
        }
      }
      sctx.restore();
    }

    ctx.drawImage(strokesLayer, 0, 0);
  };

  useEffect(() => { updateStaticBuffer(); redrawCanvas(); }, [currentStrokes, shapes, paperColor, paperStyle, pageHeight]);

  useEffect(() => {
    const sc = scrollContainerRef.current;
    if (!sc) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = sc;
      setScrollProgress(scrollTop / (scrollHeight - clientHeight || 1));
    };
    sc.addEventListener('scroll', handleScroll);
    return () => sc.removeEventListener('scroll', handleScroll);
  }, []);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = ('touches' in e) ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = ('touches' in e) ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeShapeTypeRef.current) {
      const { x, y } = getCoords(e);
      setUndoStack(prev => [...prev, { strokes: currentStrokes, shapes }]);
      setRedoStack([]);
      const type = activeShapeTypeRef.current;
      const newShape: Shape = {
        id: Date.now().toString(),
        type,
        x, y,
        width:  type === 'rectangle' ? shapeSize * 1.7 : type === 'line' || type === 'arrow' ? shapeSize * 2 : shapeSize,
        height: type === 'rectangle' ? shapeSize * 0.7 : shapeSize,
        color: color,
      };
      setShapes(prev => [...prev, newShape]);
      setActiveShapeTypeWithRef(null);
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeShapeTypeRef.current) { handleCanvasClick(e); return; }
    const { x, y } = getCoords(e);
    if (tool === 'eraser') {
      const idx = shapes.findIndex((s: Shape) => Math.sqrt(Math.pow(s.x - x, 2) + Math.pow(s.y - y, 2)) < 30);
      if (idx !== -1) {
        setUndoStack(prev => [...prev, { strokes: currentStrokes, shapes }]);
        setRedoStack([]);
        setShapes(prev => prev.filter((_, i) => i !== idx));
        return;
      }
    }
    isDrawingRef.current = true;
    setIsDrawing(true);
    activeStrokeRef.current = {
      points: [{ x, y }],
      color: tool === 'eraser' ? 'rgba(0,0,0,1)' : color,
      width: tool === 'highlighter' ? width * 5 : width,
      type: tool,
      timestamp: Date.now(),
    };
    setUndoStack(prev => [...prev, { strokes: currentStrokes, shapes }]);
    setRedoStack([]);
  };

  const drawFrameRef = useRef<number>(undefined);

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current || !activeStrokeRef.current) return;
    const { x, y } = getCoords(e);
    if (activeStrokeRef.current.type === 'ruler') {
      const start = activeStrokeRef.current.points[0];
      const dx = Math.abs(x - start.x), dy = Math.abs(y - start.y);
      activeStrokeRef.current.points = dx > dy ? [start, { x, y: start.y }] : [start, { x: start.x, y }];
      if (!drawFrameRef.current) {
        drawFrameRef.current = requestAnimationFrame(() => {
          redrawCanvas();
          drawFrameRef.current = undefined;
        });
      }
      return;
    }
    activeStrokeRef.current.points.push({ x, y });
    if (!drawFrameRef.current) {
      drawFrameRef.current = requestAnimationFrame(() => {
        redrawCanvas();
        drawFrameRef.current = undefined;
      });
    }
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current || !activeStrokeRef.current) { isDrawingRef.current = false; setIsDrawing(false); return; }
    isDrawingRef.current = false; setIsDrawing(false);
    const finishedStroke = activeStrokeRef.current;
    setCurrentStrokes(prev => [...prev, finishedStroke]);
    activeStrokeRef.current = null;
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(s => [...s, { strokes: currentStrokes, shapes }]);
    setUndoStack(s => s.slice(0, -1));
    setCurrentStrokes(prev.strokes); setShapes(prev.shapes);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(s => [...s, { strokes: currentStrokes, shapes }]);
    setRedoStack(s => s.slice(0, -1));
    setCurrentStrokes(next.strokes); setShapes(next.shapes);
  };

  const exportPDF = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    const pageHeightNum = pdf.internal.pageSize.getHeight();
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    position -= pageHeightNum;

    while (position > -pdfHeight) {
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      position -= pageHeightNum;
    }
    pdf.save(`${activePage?.title || 'diftar'}.pdf`);
  };

  const savePage = () => {
    if (!activePageId) return;
    setIsSaving(true);
    setUserData((prev: UserData) => ({
      ...prev,
      diftarPages: prev.diftarPages.map(p =>
        p.id === activePageId
          ? { ...p, strokes: currentStrokes, shapes, height: pageHeight, paperStyle, paperColor: paperColor, lastSaved: Date.now() }
          : p
      ),
    }));
    setTimeout(() => setIsSaving(false), 1000);
  };

  useEffect(() => {
    const timer = setInterval(() => { if (activePageId) savePage(); }, 5000);
    return () => clearInterval(timer);
  }, [currentStrokes, shapes, activePageId]);

  const createPage = (tpl?: typeof PAGE_TEMPLATES[0]) => {
    const template = tpl || PAGE_TEMPLATES[4];
    const newPage: DiftarPage = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      title: lang === 'fr' ? template.defaultTitle.fr : template.defaultTitle.ar,
      type: template.type as any,
      strokes: [], shapes: [],
      height: 5000,
      paperStyle: template.paperStyle,
      paperColor: template.paperColor,
      lastSaved: Date.now(),
    };
    setUserData((prev: UserData) => ({ ...prev, diftarPages: [newPage, ...prev.diftarPages] }));
    setShowTemplateModal(false);
    setActivePageId(newPage.id);
  };

  const renamePage = (id: string, newTitle: string) => {
    setUserData((prev: UserData) => ({ ...prev, diftarPages: prev.diftarPages.map(p => p.id === id ? { ...p, title: newTitle } : p) }));
  };

  useEffect(() => {
    const updateScale = () => {
      const canvas = canvasRef.current;
      if (canvas) { const rect = canvas.getBoundingClientRect(); setCanvasScale(rect.width / canvas.width); }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [activePageId]);

  const cursorX = useMotionValue(0), cursorY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 200 };
  const cursorXSpring = useSpring(cursorX, springConfig), cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const container = scrollContainerRef.current; if (!container || !activePageId) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollTop + clientHeight >= scrollHeight - 800) setPageHeight(prev => prev + 1000);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activePageId]);

  useEffect(() => {
    const handle = (e: MouseEvent) => { cursorX.set(e.clientX); cursorY.set(e.clientY); };
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  const closeAllPanels = () => { setShowToolsMenu(false); setShowCustomizationMenu(false); setShowShapePicker(false); setShowPaperSettings(false); setActiveShapeTypeWithRef(null); };

  // ── Raccourcis clavier ──────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); if (activePageId) savePage(); return; }
      if (e.key === 'Escape') { closeAllPanels(); return; }
      if (!activePageId || e.ctrlKey || e.metaKey) return;
      if (e.key === '1') setTool('pen');
      if (e.key === '2') setTool('fountain-pen');
      if (e.key === '3') setTool('highlighter');
      if (e.key === '4') setTool('chalk');
      if (e.key === '5') setTool('ruler');
      if (e.key === '6') setTool('eraser');
      if (e.key === '7') setTool('spray');
      if (e.key === '8') setTool('marker');
      if (e.key === '9') setTool('neon');
      if (e.key === '0') setTool('pencil');
      if (e.key === '-') setTool('watercolor');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activePageId, undo, redo, savePage]);

  const { scrollY } = useScroll({ container: scrollContainerRef });

  // ──────────────────────────────────
  // PAGE LIST VIEW (Gallery)
  // ──────────────────────────────────
  if (!activePageId) {
    const lastModified = userData.diftarPages.length > 0
      ? new Date(Math.max(...userData.diftarPages.map(p => p.lastSaved))).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'ar-SA')
      : null;

    return (
      <div className="flex flex-col gap-7 pb-4">

        {/* ── Header ── */}
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div>
            <h2 className="text-4xl sm:text-5xl font-serif italic leading-tight" style={{ color: 'var(--brand-primary)' }}>
              {lang === 'fr' ? 'Mon Diftar' : 'دفتري'}
            </h2>
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold mt-1.5" style={{ color: 'var(--brand-secondary)', opacity: 0.65 }}>
              دَفْتَرُ الحِفْظِ الرَّقْمِي
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Stats chips */}
            {userData.diftarPages.length > 0 && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest"
                      style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--brand-primary)' }}>
                  {userData.diftarPages.length} {lang === 'fr' ? 'page(s)' : 'صفحة'}
                </span>
                {lastModified && (
                  <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest"
                        style={{ background: 'color-mix(in srgb, var(--brand-secondary) 8%, transparent)', color: 'var(--brand-secondary)' }}>
                    {lang === 'fr' ? `Modifié le ${lastModified}` : `آخر تعديل ${lastModified}`}
                  </span>
                )}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
              onClick={() => setShowTemplateModal(true)}
              className="premium-button flex items-center gap-2"
            >
              <Plus size={18} />
              <span className="text-sm">{lang === 'fr' ? 'Nouvelle page' : 'صفحة جديدة'}</span>
            </motion.button>
          </div>
        </div>

        {/* ── Empty state ── */}
        {userData.diftarPages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-6 py-24 glass-card relative overflow-hidden">
            <div className="absolute inset-0 arabesque-pattern opacity-30" style={{ color: 'var(--brand-primary)' }} />
            <div className="relative z-10 text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-xl"
                   style={{ background: 'var(--brand-primary)' }}>
                <NotebookPen size={36} className="text-white" />
              </div>
              <h3 className="text-2xl font-serif italic" style={{ color: 'var(--brand-primary)' }}>
                {lang === 'fr' ? 'Votre Diftar est vide' : 'دفترك فارغ'}
              </h3>
              <p className="text-sm max-w-xs" style={{ color: 'var(--brand-text-muted)' }}>
                {lang === 'fr'
                  ? 'Créez votre première page pour commencer à écrire vos notes, révisions ou réflexions.'
                  : 'أنشئ أول صفحة لك وابدأ في كتابة ملاحظاتك ومراجعاتك.'}
              </p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowTemplateModal(true)}
                className="premium-button inline-flex items-center gap-2 mx-auto">
                <Plus size={17} />
                {lang === 'fr' ? 'Créer une page' : 'إنشاء صفحة'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          <AnimatePresence>
            {userData.diftarPages.map((page, idx) => {
              const paperBg = (page as any).paperColor || '#fdfcf8';
              const isDark = paperBg === '#0f172a';
              const borderColor = isDark ? '#D4AF37' : 'var(--brand-primary)';
              const templateIcon = PAGE_TEMPLATES.find(t => t.type === page.type)?.icon || '📄';

              return (
                <motion.div
                  key={page.id}
                  layout
                  initial={{ opacity: 0, scale: 0.88, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ delay: idx * 0.04 }}
                  whileHover={{ y: -8 }}
                  className="group flex flex-col gap-2"
                >
                  {/* Notebook cover */}
                  <div
                    className="relative aspect-[3/4] cursor-pointer rounded-r-2xl overflow-hidden transition-all duration-300 group-hover:shadow-2xl"
                    style={{ background: paperBg, borderLeft: `10px solid ${borderColor}`, boxShadow: '0 6px 24px rgba(0,0,0,0.1)' }}
                    onClick={() => setActivePageId(page.id)}
                  >
                    {/* Paper texture */}
                    {page.paperStyle && page.paperStyle !== 'blank' && (
                      <div className="absolute inset-0 opacity-40" style={{
                        backgroundImage: page.paperStyle === 'grid'
                          ? `linear-gradient(${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(139,38,53,0.05)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(139,38,53,0.05)'} 1px, transparent 1px)`
                          : page.paperStyle === 'lines'
                            ? `repeating-linear-gradient(transparent, transparent 19px, ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(139,38,53,0.07)'} 20px)`
                            : 'none',
                        backgroundSize: page.paperStyle === 'grid' ? '20px 20px' : 'auto',
                      }} />
                    )}

                    {/* Spiral holes */}
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-around py-4 px-2">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="w-2.5 h-2.5 rounded-full border-2 shadow-inner"
                             style={{ borderColor, background: 'var(--brand-page)', opacity: 0.5 }} />
                      ))}
                    </div>

                    {/* Content */}
                    <div className="p-4 h-full flex flex-col justify-between ml-3 relative z-10">
                      <div className="space-y-2">
                        {/* Type badge + icon */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{templateIcon}</span>
                          {page.type && page.type !== 'custom' && (
                            <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                                  style={{ background: isDark ? 'rgba(212,175,55,0.2)' : 'rgba(139,38,53,0.08)', color: isDark ? '#D4AF37' : 'var(--brand-primary)' }}>
                              {PAGE_TEMPLATES.find(t => t.type === page.type)?.[lang === 'fr' ? 'labelFr' : 'labelAr']}
                            </span>
                          )}
                        </div>

                        {editingPageId === page.id ? (
                          <div onClick={e => e.stopPropagation()}>
                            <input
                              autoFocus
                              className="w-full bg-transparent border-b-2 px-1 py-0.5 text-sm font-serif italic focus:outline-none"
                              style={{ borderColor, color: isDark ? '#fff' : 'var(--brand-primary)' }}
                              value={page.title}
                              onChange={e => renamePage(page.id, e.target.value)}
                              onBlur={() => setEditingPageId(null)}
                              onKeyDown={e => e.key === 'Enter' && setEditingPageId(null)}
                            />
                          </div>
                        ) : (
                          <h3 className="text-sm font-serif italic leading-snug"
                              style={{ color: isDark ? '#F5EFE6' : 'var(--brand-primary)' }}>
                            {page.title}
                          </h3>
                        )}

                        <div className="w-6 h-0.5 rounded-full" style={{ background: isDark ? '#D4AF37' : 'var(--brand-secondary)', opacity: 0.4 }} />
                      </div>

                      <div className="space-y-1">
                        {/* Paper style tag */}
                        <p className="text-[8px] uppercase tracking-widest font-bold"
                           style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'var(--brand-primary)', opacity: 0.4 }}>
                          {PAPER_COLOR_NAMES[paperBg] || 'Crème'} · {
                            page.paperStyle === 'lines' ? '≡' :
                            page.paperStyle === 'grid' ? '⊞' :
                            page.paperStyle === 'dots' ? '⁝' :
                            page.paperStyle === 'arabesque' ? '✦' : '□'
                          }
                        </p>
                        <p className="text-[8px] uppercase tracking-widest font-bold"
                           style={{ color: isDark ? 'rgba(255,255,255,0.25)' : 'var(--brand-primary)', opacity: 0.35 }}>
                          {new Date(page.lastSaved).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'ar-SA')}
                        </p>
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                         style={{ background: `color-mix(in srgb, ${borderColor} 8%, transparent)` }}>
                      <div className="px-4 py-2 rounded-xl text-white text-xs font-black uppercase tracking-widest shadow-lg"
                           style={{ background: borderColor }}>
                        {lang === 'fr' ? 'Ouvrir' : 'فتح'}
                      </div>
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="flex gap-1.5">
                    <button onClick={() => setActivePageId(page.id)}
                      className="flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all hover:scale-105"
                      style={{ background: 'var(--brand-primary)', color: '#fff', boxShadow: '0 3px 10px color-mix(in srgb, var(--brand-primary) 25%, transparent)' }}>
                      {lang === 'fr' ? 'Ouvrir' : 'فتح'}
                    </button>
                    <button onClick={e => { e.stopPropagation(); setEditingPageId(editingPageId === page.id ? null : page.id); }}
                      className="px-2.5 py-2 rounded-xl transition-all hover:scale-105"
                      style={{ background: 'color-mix(in srgb, var(--brand-secondary) 12%, transparent)', color: 'var(--brand-primary)' }}
                      title={lang === 'fr' ? 'Renommer' : 'تسمية'}>
                      <Edit2 size={12} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setShowConfirmDelete(page.id); }}
                      className="px-2.5 py-2 rounded-xl transition-all hover:scale-105"
                      style={{ background: 'rgba(239,68,68,0.08)', color: 'rgba(239,68,68,0.65)' }}
                      title={lang === 'fr' ? 'Supprimer' : 'حذف'}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ── Template Modal ── */}
        <AnimatePresence>
          {showTemplateModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 backdrop-blur-md z-[200] flex items-center justify-center p-6"
              style={{ background: 'color-mix(in srgb, var(--brand-primary) 25%, transparent)' }}
              onClick={() => setShowTemplateModal(false)}>
              <motion.div initial={{ scale: 0.88, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88, y: 24 }}
                transition={{ type: 'spring', bounce: 0.3 }}
                className="glass-card p-8 max-w-lg w-full space-y-6 relative overflow-hidden"
                onClick={e => e.stopPropagation()}>
                <div className="card-accent-bar" />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-serif italic" style={{ color: 'var(--brand-primary)' }}>
                      {lang === 'fr' ? 'Choisir un modèle' : 'اختر نموذجاً'}
                    </h3>
                    <p className="text-[10px] uppercase tracking-widest font-bold mt-0.5"
                       style={{ color: 'var(--brand-text-muted)' }}>
                      {lang === 'fr' ? 'Sélectionnez le type de page' : 'اختر نوع الصفحة'}
                    </p>
                  </div>
                  <button onClick={() => setShowTemplateModal(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--brand-text-muted)' }}>
                    <X size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PAGE_TEMPLATES.map(tpl => (
                    <motion.button
                      key={tpl.type}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => createPage(tpl)}
                      className="flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all text-left"
                      style={{
                        background: tpl.paperColor,
                        borderColor: 'var(--border-subtle)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--brand-primary)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                    >
                      <span className="text-3xl">{tpl.icon}</span>
                      <div>
                        <p className="text-sm font-bold font-serif italic" style={{ color: tpl.paperColor === '#0f172a' ? '#fff' : 'var(--brand-primary)' }}>
                          {lang === 'fr' ? tpl.labelFr : tpl.labelAr}
                        </p>
                        <p className="text-[8px] uppercase tracking-widest font-bold mt-0.5"
                           style={{ color: tpl.paperColor === '#0f172a' ? 'rgba(255,255,255,0.4)' : 'var(--brand-text-muted)' }}>
                          {tpl.paperStyle}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Confirm delete modal ── */}
        <AnimatePresence>
          {showConfirmDelete && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 backdrop-blur-md z-[200] flex items-center justify-center p-6"
              style={{ background: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="glass-card p-10 max-w-sm w-full text-center space-y-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                     style={{ background: 'rgba(239,68,68,0.1)' }}>
                  <Trash2 size={30} style={{ color: '#ef4444' }} />
                </div>
                <h3 className="text-2xl font-serif italic" style={{ color: 'var(--brand-primary)' }}>
                  {lang === 'fr' ? 'Supprimer la page ?' : 'حذف الصفحة؟'}
                </h3>
                <div className="flex gap-3">
                  <button onClick={() => setShowConfirmDelete(null)}
                    className="flex-1 py-3 rounded-2xl border font-bold text-xs uppercase tracking-widest"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--brand-text-muted)' }}>
                    {lang === 'fr' ? 'Annuler' : 'إلغاء'}
                  </button>
                  <button
                    onClick={() => {
                      setUserData((prev: UserData) => ({ ...prev, diftarPages: prev.diftarPages.filter(p => p.id !== showConfirmDelete) }));
                      setShowConfirmDelete(null);
                    }}
                    className="flex-1 py-3 rounded-2xl text-white font-bold text-xs uppercase tracking-widest"
                    style={{ background: '#ef4444' }}>
                    {lang === 'fr' ? 'Supprimer' : 'حذف'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ──────────────────────────────────
  // CANVAS / EDITOR VIEW
  // ──────────────────────────────────
  return (
    // FIX 1 : overflow-hidden supprimé + relative gardé pour le curseur custom
    <div className="flex-1 flex flex-col relative h-full">

      {/* ─── TOOLBAR FIXÉE ─────────────────────────────────────────────────────
          FIX 2 : fixed au lieu de sticky — complètement hors du flow scrollable.
          pointer-events-none sur le wrapper, pointer-events-auto sur les enfants
          pour ne pas bloquer les clics sur le canvas derrière.
      ──────────────────────────────────────────────────────────────────────── */}
      <div className="fixed top-2 left-0 right-0 z-[100] px-4 flex flex-col gap-2 pointer-events-none">

        {/* Barre principale */}
        <div
          className="backdrop-blur-2xl rounded-[2rem] shadow-xl border p-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar flex-shrink-0 pointer-events-auto"
          style={{ background: 'var(--brand-surface)', borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}
        >
          {/* Left: back + title */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <motion.button
              onClick={() => { savePage(); setActivePageId(null); }}
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-full transition-all hover:scale-105"
              style={{ color: 'var(--brand-primary)', background: 'color-mix(in srgb, var(--brand-primary) 6%, transparent)' }}
            >
              <ChevronLeft size={20} />
            </motion.button>
            <input
              value={activePage?.title}
              onChange={e => setUserData((prev: UserData) => ({ ...prev, diftarPages: prev.diftarPages.map(p => p.id === activePageId ? { ...p, title: e.target.value } : p) }))}
              className="font-serif italic text-base w-28 sm:w-40 bg-transparent border-none focus:ring-0 focus:outline-none"
              style={{ color: 'var(--brand-primary)' }}
            />
          </div>

          {/* Center: tool buttons */}
          <div className="flex items-center gap-1 rounded-full p-1" style={{ background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }}>
            {[
              { id: 'tools',  icon: Pencil,    title: lang === 'fr' ? 'Outils' : 'أدوات',     active: showToolsMenu,         action: () => { closeAllPanels(); setShowToolsMenu(v => !v); } },
              { id: 'colors', icon: Palette,   title: lang === 'fr' ? 'Couleurs' : 'الألوان',  active: showCustomizationMenu, action: () => { closeAllPanels(); setShowCustomizationMenu(v => !v); } },
              { id: 'shapes', icon: Star,      title: lang === 'fr' ? 'Formes' : 'الأشكال',    active: showShapePicker,       action: () => { closeAllPanels(); setShowShapePicker(v => !v); } },
              { id: 'paper',  icon: Settings2, title: lang === 'fr' ? 'Papier' : 'الورق',      active: showPaperSettings,     action: () => { closeAllPanels(); setShowPaperSettings(v => !v); } },
            ].map(btn => (
              <motion.button
                key={btn.id}
                onClick={btn.action}
                title={btn.title}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-full transition-all duration-200"
                style={btn.active ? { background: 'var(--brand-primary)', color: '#fff', boxShadow: '0 2px 12px color-mix(in srgb, var(--brand-primary) 30%, transparent)' } : { color: 'var(--brand-primary)' }}
              >
                <btn.icon size={16} />
              </motion.button>
            ))}
          </div>

          {/* Right: undo/redo + save */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="flex rounded-full p-1" style={{ background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }}>
              <button onClick={undo} className="p-2.5 rounded-full transition-all hover:scale-110" style={{ color: 'var(--brand-primary)' }} title="Annuler"><Undo size={16} /></button>
              <button onClick={redo} className="p-2.5 rounded-full transition-all hover:scale-110" style={{ color: 'var(--brand-primary)' }} title="Refaire"><Redo size={16} /></button>
            </div>
            <button onClick={() => setShowConfirmClear(true)} className="p-2.5 rounded-full transition-all" style={{ color: 'rgba(239,68,68,0.6)' }} title="Effacer"><Trash2 size={16} /></button>
            <button onClick={exportPDF} className="p-2.5 rounded-full transition-all hidden sm:block" style={{ color: 'var(--brand-primary)' }} title="Exporter"><Download size={16} /></button>
            <motion.button
              onClick={savePage}
              disabled={isSaving}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-white shadow-md transition-all active:scale-95"
              style={{ background: isSaving ? '#22c55e' : 'var(--brand-primary)' }}
            >
              {isSaving ? <Check size={15} /> : <Save size={15} />}
              <span className="text-xs hidden sm:inline">{isSaving ? (lang === 'fr' ? 'Sauvegardé' : 'تم') : (lang === 'fr' ? 'Sauvegarder' : 'حفظ')}</span>
            </motion.button>
          </div>
        </div>

        {/* Panels (tools / colors / shapes / paper) */}
        <AnimatePresence>
          {(showToolsMenu || showCustomizationMenu || showShapePicker || showPaperSettings) && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl mx-auto pointer-events-auto"
            >
              {showToolsMenu && (
                <div className="backdrop-blur-3xl rounded-[2rem] shadow-2xl border p-5 space-y-4" style={{ background: 'var(--brand-surface)', borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--brand-secondary)', opacity: 0.6 }}>{lang === 'fr' ? 'Outil' : 'الأداة'}</p>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'pen',          icon: Pencil,      label: lang === 'fr' ? 'Stylo'      : 'قلم',     hint: '1' },
                      { id: 'fountain-pen', icon: Brush,       label: lang === 'fr' ? 'Plume'      : 'ريشة',    hint: '2' },
                      { id: 'highlighter',  icon: Highlighter, label: lang === 'fr' ? 'Surligneur' : 'تحديد',   hint: '3' },
                      { id: 'chalk',        icon: Edit2,       label: lang === 'fr' ? 'Craie'      : 'طباشير',  hint: '4' },
                      { id: 'ruler',        icon: Ruler,       label: lang === 'fr' ? 'Règle'      : 'مسطرة',   hint: '5' },
                      { id: 'eraser',       icon: Eraser,      label: lang === 'fr' ? 'Gomme'      : 'ممحاة',   hint: '6' },
                      { id: 'spray',        icon: Wind,        label: lang === 'fr' ? 'Aérosol'    : 'رذاذ',    hint: '7' },
                      { id: 'marker',       icon: Pen,         label: lang === 'fr' ? 'Marqueur'   : 'ماركر',   hint: '8' },
                      { id: 'neon',       icon: Zap,       label: lang === 'fr' ? 'Néon'       : 'نيون',        hint: '9' },
                      { id: 'pencil',     icon: Pencil,    label: lang === 'fr' ? 'Crayon'     : 'رصاص',        hint: '0' },
                      { id: 'watercolor', icon: Palette,   label: lang === 'fr' ? 'Aquarelle'  : 'ألوان مائية', hint: '-' },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => { setTool(t.id as any); setShowToolsMenu(false); }}
                        className="relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all font-bold text-[9px] uppercase tracking-wider"
                        style={tool === t.id ? { background: 'var(--brand-primary)', color: '#fff', boxShadow: '0 4px 14px color-mix(in srgb, var(--brand-primary) 30%, transparent)' } : { background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)', color: 'var(--brand-text-muted)' }}
                      >
                        {t.hint && <span className="absolute top-1.5 right-1.5 text-[7px] font-black opacity-30">{t.hint}</span>}
                        <t.icon size={20} />
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--brand-secondary)', opacity: 0.6 }}>{lang === 'fr' ? 'Taille' : 'الحجم'}</p>
                    <div className="flex flex-wrap gap-2">
                      {SIZE_PRESETS.map(p => (
                        <button
                          key={p.value}
                          onClick={() => { setWidth(p.value); setShowToolsMenu(false); }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all font-bold text-[10px]"
                          style={width === p.value ? { background: 'var(--brand-primary)', color: '#fff' } : { background: 'color-mix(in srgb, var(--brand-primary) 7%, transparent)', color: 'var(--brand-text-muted)' }}
                        >
                          <div className="rounded-full bg-current" style={{ width: `${Math.min(p.value, 16)}px`, height: `${Math.min(p.value, 16)}px` }} />
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="range" min="1" max="50" value={width} onChange={e => setWidth(parseInt(e.target.value))} className="flex-1 accent-primary" style={{ accentColor: 'var(--brand-primary)' }} />
                      <span className="text-xs font-mono w-10 text-right" style={{ color: 'var(--brand-text-muted)' }}>{width}px</span>
                    </div>
                  </div>
                </div>
              )}

              {showCustomizationMenu && (
                <div className="backdrop-blur-3xl rounded-[2rem] shadow-2xl border p-5 space-y-4" style={{ background: 'var(--brand-surface)', borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl border-2 shadow-inner" style={{ background: color, borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }} />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--brand-secondary)', opacity: 0.6 }}>{lang === 'fr' ? 'Couleur active' : 'اللون المحدد'}</p>
                      <p className="text-xs font-mono" style={{ color: 'var(--brand-text-muted)' }}>{color}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(COLOR_PALETTE) as (keyof typeof COLOR_PALETTE)[]).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setColorTab(cat)}
                        className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all"
                        style={colorTab === cat ? { background: 'var(--brand-primary)', color: '#fff' } : { background: 'color-mix(in srgb, var(--brand-primary) 7%, transparent)', color: 'var(--brand-text-muted)' }}
                      >
                        {cat === 'classiques' ? (lang === 'fr' ? 'Classiques' : 'كلاسيك')
                          : cat === 'pastels' ? (lang === 'fr' ? 'Pastels' : 'باستيل')
                          : cat === 'vives' ? (lang === 'fr' ? 'Vives' : 'زاهية')
                          : cat === 'sombres' ? (lang === 'fr' ? 'Sombres' : 'داكنة')
                          : (lang === 'fr' ? 'Spéciaux' : 'خاصة')}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                    {COLOR_PALETTE[colorTab].map(c => (
                      <button
                        key={c}
                        onClick={() => { setColor(c); setShowCustomizationMenu(false); }}
                        className="aspect-square rounded-xl border-2 transition-all hover:scale-110"
                        style={{
                          background: c.startsWith('gradient:')
                            ? { 'gradient:gold-red': 'linear-gradient(135deg,#D4AF37,#8B2635)', 'gradient:blue-cyan': 'linear-gradient(135deg,#1D3557,#A8DADC)', 'gradient:purple-pink': 'linear-gradient(135deg,#6D597A,#FF99C8)', 'gradient:green-teal': 'linear-gradient(135deg,#2D6A4F,#95D5B2)', 'gradient:sunset': 'linear-gradient(135deg,#F4A261,#E76F51)', 'gradient:ocean': 'linear-gradient(135deg,#03045E,#90E0EF)' }[c] || '#888'
                            : c.startsWith('pattern:') ? '#f5f5f5' : c,
                          borderColor: color === c ? 'var(--brand-primary)' : 'transparent',
                          boxShadow: color === c ? '0 0 0 3px color-mix(in srgb, var(--brand-primary) 25%, transparent)' : 'none',
                        }}
                      >
                        {c.startsWith('pattern:') && (
                          <span className="text-[8px] font-bold" style={{ color: '#888' }}>
                            {c === 'pattern:dots' ? '•••' : c === 'pattern:stripes' ? '///' : '+++'}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] flex-shrink-0" style={{ color: 'var(--brand-secondary)', opacity: 0.6 }}>HEX</label>
                    <input
                      type="color"
                      value={color.startsWith('#') ? color : '#8B2635'}
                      onChange={e => setColor(e.target.value)}
                      className="w-10 h-8 rounded-lg cursor-pointer border-none"
                    />
                    <input
                      type="text"
                      value={color.startsWith('#') ? color : ''}
                      onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) setColor(e.target.value); }}
                      className="flex-1 px-3 py-1.5 rounded-xl text-xs font-mono bg-transparent border focus:outline-none"
                      style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 15%, transparent)', color: 'var(--brand-text-muted)' }}
                      placeholder="#8B2635"
                    />
                  </div>
                </div>
              )}

              {showShapePicker && (
                <div className="backdrop-blur-3xl rounded-[2rem] shadow-2xl border p-5 space-y-4" style={{ background: 'var(--brand-surface)', borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
                  <div className="flex flex-wrap gap-1.5">
                    {SHAPE_CATEGORIES.map((cat, i) => (
                      <button
                        key={i}
                        onClick={() => setShapeCategory(i)}
                        className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all"
                        style={shapeCategory === i ? { background: 'var(--brand-primary)', color: '#fff' } : { background: 'color-mix(in srgb, var(--brand-primary) 7%, transparent)', color: 'var(--brand-text-muted)' }}
                      >
                        {cat.label[lang as 'fr' | 'ar']}
                      </button>
                    ))}
                  </div>

                  {/* Size slider */}
                  <div className="flex items-center gap-3 px-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] flex-shrink-0" style={{ color: 'var(--brand-secondary)', opacity: 0.6 }}>
                      {lang === 'fr' ? 'Taille' : 'الحجم'}
                    </p>
                    <input type="range" min="20" max="200" value={shapeSize}
                      onChange={e => setShapeSize(parseInt(e.target.value))}
                      className="flex-1" style={{ accentColor: 'var(--brand-primary)' }} />
                    <span className="text-xs font-mono w-12 text-right flex-shrink-0" style={{ color: 'var(--brand-text-muted)' }}>{shapeSize}px</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {SHAPE_CATEGORIES[shapeCategory].shapes.map(shape => (
                      <motion.button
                        key={shape.id}
                        onClick={() => { setActiveShapeTypeWithRef(shape.type); setShowShapePicker(false); }}
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.92 }}
                        className="aspect-square flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all hover:shadow-lg"
                        style={activeShapeType === shape.type
                          ? { background: 'var(--brand-primary)', borderColor: 'var(--brand-primary)', color: '#fff' }
                          : { background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)', color: 'var(--brand-primary)' }}
                      >
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor">
                          {shape.type === 'circle'    && <circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" strokeWidth="2" />}
                          {shape.type === 'square'    && <rect x="4" y="4" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" />}
                          {shape.type === 'rectangle' && <rect x="2" y="7" width="24" height="14" fill="none" stroke="currentColor" strokeWidth="2" />}
                          {shape.type === 'triangle'  && <polygon points="14,3 25,25 3,25" fill="none" stroke="currentColor" strokeWidth="2" />}
                          {shape.type === 'diamond'   && <polygon points="14,2 26,14 14,26 2,14" fill="none" stroke="currentColor" strokeWidth="2" />}
                          {shape.type === 'hexagon'   && <polygon points="14,2 24,8 24,20 14,26 4,20 4,8" fill="none" stroke="currentColor" strokeWidth="2" />}
                          {shape.type === 'pentagon'  && <polygon points="14,2 25,10 21,24 7,24 3,10" fill="none" stroke="currentColor" strokeWidth="2" />}
                          {shape.type === 'star'      && <polygon points="14,2 17,11 26,11 19,17 22,26 14,20 6,26 9,17 2,11 11,11" fill="currentColor" />}
                          {shape.type === 'heart'     && <path d="M14,24 C14,24 3,16 3,9 C3,5.5 5.5,3 9,3 C11,3 13,4.5 14,6 C15,4.5 17,3 19,3 C22.5,3 25,5.5 25,9 C25,16 14,24 14,24Z" fill="currentColor" />}
                          {shape.type === 'crescent'  && <path d="M14,2 A12,12 0 1,1 14,26 A8,8 0 1,0 14,2Z" fill="currentColor" />}
                          {shape.type === 'line'      && <line x1="3" y1="14" x2="25" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />}
                          {shape.type === 'arrow'     && <><line x1="3" y1="14" x2="23" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /><polyline points="17,8 24,14 17,20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" /></>}
                        </svg>
                        <span className="text-[7px] font-bold mt-1 leading-tight text-center">{shape.label[lang as 'fr' | 'ar']}</span>
                      </motion.button>
                    ))}
                  </div>
                  {activeShapeType && (
                    <div className="text-center text-xs font-bold animate-pulse" style={{ color: 'var(--brand-secondary)' }}>
                      {lang === 'fr' ? 'Cliquez sur la page pour placer la forme' : 'انقر على الصفحة لوضع الشكل'}
                    </div>
                  )}
                </div>
              )}

              {showPaperSettings && (
                <div className="backdrop-blur-3xl rounded-[2rem] shadow-2xl border p-5 space-y-4" style={{ background: 'var(--brand-surface)', borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--brand-secondary)', opacity: 0.6 }}>{lang === 'fr' ? 'Style de papier' : 'نوع الورق'}</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'blank',     label: lang === 'fr' ? 'Blanc'     : 'أبيض'  },
                        { id: 'lines',     label: lang === 'fr' ? 'Lignes'    : 'سطور'  },
                        { id: 'grid',      label: lang === 'fr' ? 'Grille'    : 'شبكة'  },
                        { id: 'dots',      label: lang === 'fr' ? 'Points'    : 'نقاط'  },
                        { id: 'arabesque', label: lang === 'fr' ? 'Arabesque' : 'عربسك' },
                      ].map(s => (
                        <button
                          key={s.id}
                          onClick={() => { setPaperStyle(s.id as any); setShowPaperSettings(false); }}
                          className="px-4 py-2 rounded-2xl font-bold text-[10px] uppercase tracking-wider transition-all border"
                          style={paperStyle === s.id ? { background: 'var(--brand-primary)', color: '#fff', borderColor: 'var(--brand-primary)' } : { background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)', color: 'var(--brand-text-muted)', borderColor: 'transparent' }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--brand-secondary)', opacity: 0.6 }}>{lang === 'fr' ? 'Couleur de papier' : 'لون الورق'}</p>
                    <div className="flex flex-wrap gap-2">
                      {PAPER_COLORS.map(pc => (
                        <button
                          key={pc.value}
                          onClick={() => { setPaperColor(pc.value); setShowPaperSettings(false); }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all"
                          style={{ background: pc.value, borderColor: paperColor === pc.value ? 'var(--brand-primary)' : 'rgba(139,38,53,0.15)', color: pc.value === '#0f172a' ? '#fff' : 'var(--brand-primary)', boxShadow: paperColor === pc.value ? '0 0 0 2px var(--brand-primary)' : 'none' }}
                        >
                          {pc.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      {/* ─── FIN TOOLBAR FIXÉE ──────────────────────────────────────────────── */}

      {/* ─── Scroll Navigator ─── */}
      <div className="fixed right-3 top-[88px] bottom-28 z-[70] flex flex-col items-center gap-2 pointer-events-none">
        {/* Clickable track */}
        <div
          className="flex-1 w-1 rounded-full relative pointer-events-auto cursor-pointer group/track"
          style={{ background: 'color-mix(in srgb, var(--brand-primary) 7%, transparent)' }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            handleManualScroll(Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)));
          }}
        >
          {/* Fill */}
          <div className="absolute top-0 left-0 right-0 rounded-full transition-all duration-100"
               style={{ height: `${scrollProgress * 100}%`, background: 'color-mix(in srgb, var(--brand-primary) 18%, transparent)' }} />
          {/* Thumb */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 w-3 h-8 rounded-full shadow-lg"
            style={{
              top: `${Math.max(0, Math.min(scrollProgress * 100, 100))}%`,
              translateY: '-50%',
              background: 'var(--brand-primary)',
              boxShadow: '0 2px 10px color-mix(in srgb, var(--brand-primary) 40%, transparent)',
              opacity: 0.85,
            }}
          />
        </div>
      </div>

      {/* ─── Scroll Progress Ring (back-to-top) ─── */}
      <AnimatePresence>
        {scrollProgress > 0.04 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.75 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-4 z-[70] w-12 h-12 rounded-full flex items-center justify-center pointer-events-auto shadow-xl"
            style={{ background: 'var(--brand-surface)', border: '1.5px solid color-mix(in srgb, var(--brand-primary) 12%, transparent)' }}
            title={lang === 'fr' ? 'Retour en haut' : 'أعلى الصفحة'}
          >
            <svg className="absolute inset-0 -rotate-90" width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke="color-mix(in srgb, var(--brand-primary) 8%, transparent)" strokeWidth="2.5" />
              <circle cx="24" cy="24" r="20" fill="none" stroke="var(--brand-primary)" strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - scrollProgress)}`}
                style={{ opacity: 0.75, transition: 'stroke-dashoffset 0.15s ease' }}
              />
            </svg>
            <span className="text-[9px] font-black select-none" style={{ color: 'var(--brand-primary)' }}>
              ↑
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── ZONE SCROLLABLE (canvas) ───────────────────────────────────────── */}
      {/* FIX 3 : pt-20 pour compenser la hauteur de la toolbar fixed (~72px + gap) */}
      <div
        ref={scrollContainerRef}
        className="flex-1 rounded-[2rem] shadow-2xl overflow-y-auto relative border group cursor-none custom-scrollbar pt-20"
        onScroll={e => { const s = e.currentTarget; setScrollProgress(s.scrollTop / (s.scrollHeight - s.clientHeight || 1)); }}
        style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', scrollBehavior: 'smooth' }}
      >
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed left-1/2 top-5 z-[60] -translate-x-1/2 rounded-3xl px-5 py-3 shadow-2xl text-sm font-bold"
            style={{ background: 'rgba(15, 23, 42, 0.94)', color: '#fff' }}
          >
            {toastMessage}
          </motion.div>
        )}

        {/* Binding */}
        <div
          className={cn('absolute top-0 w-10 z-20 pointer-events-none', lang === 'ar' ? 'right-0' : 'left-0')}
          style={{ height: `${pageHeight}px`, background: 'linear-gradient(to right, rgba(0,0,0,0.06), transparent)' }}
        >
          <div className="h-full flex flex-col justify-around py-8 px-2">
            {[...Array(Math.ceil(pageHeight / 120))].map((_, i) => (
              <div key={i} className="w-full h-2 rounded-full shadow-inner" style={{ background: 'rgba(0,0,0,0.05)' }} />
            ))}
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={1000}
          height={pageHeight}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full touch-none"
        />

        <div className="flex justify-center py-10" style={{ background: paperColor }}>
          <button onClick={() => setPageHeight(prev => prev + 2000)} className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold uppercase tracking-wider text-xs border transition-all hover:scale-105" style={{ color: 'var(--brand-primary)', borderColor: 'color-mix(in srgb, var(--brand-primary) 15%, transparent)', background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }}>
            <Plus size={15} />
            {lang === 'fr' ? "Ajouter de l'espace" : 'إضافة مساحة'}
          </button>
        </div>

        {/* Custom cursor */}
        <motion.div
          className="fixed pointer-events-none z-[60] -translate-x-1/2 -translate-y-1/2 hidden group-hover:flex items-center justify-center"
          style={{ left: cursorXSpring, top: cursorYSpring }}
        >
          <motion.div
            layout initial={false}
            animate={{
              width: activeShapeType ? 60 : (tool === 'highlighter' ? width * 6 : width + 16) * canvasScale,
              height: activeShapeType ? 60 : (tool === 'highlighter' ? width * 5 : width + 16) * canvasScale,
              borderRadius: tool === 'highlighter' ? '4px' : '50%',
              backgroundColor: activeShapeType ? 'transparent' : (tool === 'eraser' ? 'rgba(255,255,255,0.4)' : color),
              opacity: tool === 'highlighter' ? 0.35 : 0.85,
              border: activeShapeType ? '2px dashed var(--brand-secondary)' : '1px solid rgba(255,255,255,0.8)',
              scale: isDrawing ? 0.8 : 1,
            }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative flex items-center justify-center shadow-lg"
          >
            {activeShapeType ? (
              <div className="w-full h-full opacity-60 animate-pulse flex items-center justify-center">
                {activeShapeType === 'circle' && <div className="w-6 h-6 rounded-full border-2 border-current" style={{ color: 'var(--brand-secondary)' }} />}
                {activeShapeType === 'square' && <div className="w-6 h-6 border-2 border-current" style={{ color: 'var(--brand-secondary)' }} />}
                {activeShapeType === 'triangle' && <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-current" style={{ color: 'var(--brand-secondary)' }} />}
                {activeShapeType === 'line' && <div className="w-6 h-0.5 bg-current" style={{ backgroundColor: 'var(--brand-secondary)' }} />}
                {activeShapeType === 'arrow' && <div className="flex items-center" style={{ color: 'var(--brand-secondary)' }}><div className="w-4 h-0.5 bg-current"></div><div className="w-0 h-0 border-l-[4px] border-l-current border-t-[2px] border-t-transparent border-b-[2px] border-b-transparent"></div></div>}
              </div>
            ) : (
              <span className="text-white/50">
                {tool === 'pen' && <Pencil size={Math.max(10, 12 * canvasScale)} />}
                {tool === 'fountain-pen' && <Brush size={Math.max(10, 12 * canvasScale)} />}
                {tool === 'highlighter' && <Highlighter size={Math.max(10, 12 * canvasScale)} />}
                {tool === 'chalk' && <Edit2 size={Math.max(10, 12 * canvasScale)} />}
                {tool === 'eraser' && <Eraser size={Math.max(10, 12 * canvasScale)} />}
                {tool === 'ruler' && <Ruler size={Math.max(10, 12 * canvasScale)} />}
              </span>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Confirm clear */}
      <AnimatePresence>
        {showConfirmClear && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 backdrop-blur-md z-[200] flex items-center justify-center p-6" style={{ background: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white p-10 rounded-[2rem] shadow-2xl max-w-sm w-full text-center space-y-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto"><Wind size={32} className="text-red-500" /></div>
              <h3 className="text-2xl font-serif italic" style={{ color: 'var(--brand-primary)' }}>{lang === 'fr' ? 'Effacer la page ?' : 'مسح الصفحة؟'}</h3>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirmClear(false)} className="flex-1 py-3 rounded-2xl border font-bold text-xs uppercase" style={{ borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)', opacity: 0.4 }}>{lang === 'fr' ? 'Annuler' : 'إلغاء'}</button>
                <button onClick={() => { setUndoStack(prev => [...prev, { strokes: currentStrokes, shapes }]); setCurrentStrokes([]); setShapes([]); setShowConfirmClear(false); }} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold text-xs uppercase">{lang === 'fr' ? 'Effacer' : 'مسح'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useScroll, useMotionValueEvent } from 'framer-motion';
import { NotebookPen, Edit2, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Plus, Save, Check, Undo, Redo, Trash2, Eraser, Ruler, Download, X, Settings2, Pencil, Brush, Highlighter, Palette, Star, Wind } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { cn } from '../lib/utils';
import { Stroke, Shape, DiftarPage, UserData } from '../types';

// All shapes, organized by category
const SHAPE_CATEGORIES = [
  {
    label: { fr: 'Géométriques', ar: 'هندسية' },
    shapes: [
      { id: 'circle',   type: 'circle' as const,   label: { fr: 'Cercle', ar: 'دائرة' } },
      { id: 'square',   type: 'square' as const,   label: { fr: 'Carré', ar: 'مربع' } },
      { id: 'triangle', type: 'triangle' as const, label: { fr: 'Triangle', ar: 'مثلث' } },
    ],
  },
  {
    label: { fr: 'Lignes', ar: 'خطوط' },
    shapes: [
      { id: 'line',  type: 'line' as const,  label: { fr: 'Ligne', ar: 'خط' } },
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
  const [tool, setTool]                     = useState<'pen' | 'highlighter' | 'fountain-pen' | 'chalk' | 'eraser' | 'ruler'>('pen');
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
  const [paperStyle, setPaperStyle]         = useState<'lines'|'blank'|'grid'|'dots'|'arabesque'>('lines');
  const [paperColor, setPaperColor]         = useState('#fdfcf8');
  const [pageHeight, setPageHeight]         = useState(5000);
  const [canvasScale, setCanvasScale]       = useState(1);
  const isDrawingRef    = useRef(false);
  const activeStrokeRef = useRef<Stroke | null>(null);
  const stickerCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [activeShapeType, setActiveShapeType] = useState<'circle' | 'square' | 'triangle' | 'line' | 'arrow' | null>(null);
  const activeShapeTypeRef = useRef<'circle' | 'square' | 'triangle' | 'line' | 'arrow' | null>(null);
  const setActiveShapeTypeWithRef = useCallback((val: 'circle' | 'square' | 'triangle' | 'line' | 'arrow' | null) => {
    activeShapeTypeRef.current = val;
    setActiveShapeType(val);
  }, []);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [showConfirmClear, setShowConfirmClear]   = useState(false);
  const [isDrawing, setIsDrawing]           = useState(false);
  const [toastMessage, setToastMessage]     = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);

  const activePage = userData.diftarPages.find(p => p.id === activePageId);

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
    // For dark paper, use gold; for light papers use the brand primary red
    if (pc === '#0f172a') return '#D4AF37';
    return '#8B2635';
  };

  const getColoredStickerSvg = (svg: string, pc: string) => {
    const brandColor = getBrandColorForPaper(pc);
    // Inject explicit dimensions and replace currentColor with brand color
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
      // decorative side patterns
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

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = paperColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPaperLines(ctx, canvas.width, canvas.height);

    if (!offscreenRef.current) {
        offscreenRef.current = document.createElement('canvas');
    }
    const off = offscreenRef.current;
    if (off.width !== canvas.width || off.height !== canvas.height) {
        off.width = canvas.width;
        off.height = canvas.height;
    }
    const octx = off.getContext('2d');
    if (!octx) return;
    octx.clearRect(0, 0, off.width, off.height);

    const renderStroke = (stroke, targetCtx = octx) => {
      if (stroke.points.length < 2) return;
      targetCtx.save();
      targetCtx.beginPath();
      targetCtx.strokeStyle = getStrokeStyle(targetCtx, stroke);
      targetCtx.lineJoin = 'round';

      if (stroke.type === 'highlighter') {
        targetCtx.globalCompositeOperation = 'multiply';
        targetCtx.globalAlpha = 0.4;
        targetCtx.lineCap = 'square';
        targetCtx.lineWidth = stroke.width * 2.5;
      } else if (stroke.type === 'fountain-pen') {
        targetCtx.globalCompositeOperation = 'source-over';
        targetCtx.lineCap = 'butt';
        targetCtx.lineWidth = stroke.width * 1.2;
        targetCtx.setTransform(1, 0, 0.4, 1, 0, 0);
      } else if (stroke.type === 'chalk') {
        targetCtx.globalCompositeOperation = 'source-over';
        targetCtx.globalAlpha = 0.75;
        targetCtx.lineCap = 'round';
        targetCtx.lineWidth = stroke.width * 2;
        targetCtx.setLineDash([2, 3]);
        targetCtx.shadowBlur = 4;
        targetCtx.shadowColor = stroke.color;
      } else if (stroke.type === 'eraser') {
        targetCtx.globalCompositeOperation = 'destination-out';
        targetCtx.strokeStyle = 'rgba(0,0,0,1)';
        targetCtx.lineCap = 'round';
        targetCtx.lineWidth = stroke.width * 4;
      } else if (stroke.type === 'ruler') {
        targetCtx.lineCap = 'butt';
        targetCtx.lineWidth = stroke.width;
      } else {
        targetCtx.globalCompositeOperation = 'source-over';
        targetCtx.lineCap = 'round';
        targetCtx.lineWidth = stroke.width;
      }

      targetCtx.moveTo(stroke.points[0].x, stroke.points[0].y);
      if (stroke.type === 'ruler') {
        const last = stroke.points[stroke.points.length - 1];
        targetCtx.lineTo(last.x, last.y);
      } else {
        for (let i = 1; i < stroke.points.length - 1; i++) {
          const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
          const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
          targetCtx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, xc, yc);
        }
        const last = stroke.points[stroke.points.length - 1];
        targetCtx.lineTo(last.x, last.y);
      }
      targetCtx.stroke();
      targetCtx.restore();
    };

    currentStrokes.forEach(s => renderStroke(s, octx));
    if (activeStrokeRef.current) renderStroke(activeStrokeRef.current, octx);

    shapes.forEach((shape) => {
      octx.save();
      octx.strokeStyle = shape.color;
      octx.fillStyle = shape.color;
      octx.lineWidth = 2;
      octx.translate(shape.x, shape.y);
      if (shape.rotation) octx.rotate((shape.rotation * Math.PI) / 180);
      
      switch (shape.type) {
        case 'circle':
          octx.beginPath(); octx.arc(0, 0, shape.width / 2, 0, Math.PI * 2); octx.fill(); break;
        case 'square':
          octx.fillRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height); break;
        case 'triangle':
          octx.beginPath(); octx.moveTo(0, -shape.height / 2); octx.lineTo(-shape.width / 2, shape.height / 2); octx.lineTo(shape.width / 2, shape.height / 2); octx.closePath(); octx.fill(); break;
        case 'line':
          octx.beginPath(); octx.moveTo(-shape.width / 2, 0); octx.lineTo(shape.width / 2, 0); octx.stroke(); break;
        case 'arrow':
          octx.beginPath(); octx.moveTo(-shape.width / 2, 0); octx.lineTo(shape.width / 2 - 10, 0); octx.moveTo(shape.width / 2 - 10, 0); octx.lineTo(shape.width / 2 - 15, -5); octx.moveTo(shape.width / 2 - 10, 0); octx.lineTo(shape.width / 2 - 15, 5); octx.stroke(); break;
      }
      octx.restore();
    });

    ctx.drawImage(off, 0, 0);
  };

  useEffect(() => { redrawCanvas(); }, [currentStrokes, shapes, lang, pageHeight, paperStyle, paperColor]);

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
      const newShape: Shape = {
        id: Date.now().toString(),
        type: activeShapeTypeRef.current,
        x, y,
        width: 50,
        height: 50,
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

  const createPage = () => {
    const newPage: DiftarPage = {
      id: Math.random().toString(36).substr(2, 9),
      title: lang === 'fr' ? 'Nouvelle Page' : 'صفحة جديدة',
      type: 'custom', strokes: [], shapes: [], height: 5000, paperStyle: 'lines', lastSaved: Date.now(),
    };
    setUserData((prev: UserData) => ({ ...prev, diftarPages: [newPage, ...prev.diftarPages] }));
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

  const { scrollY } = useScroll({ container: scrollContainerRef });

  // ──────────────────────────────────
  // PAGE LIST VIEW (Gallery)
  // ──────────────────────────────────
  if (!activePageId) {
    return (
      <div className="flex-1 flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-serif italic" style={{ color: 'var(--brand-primary)' }}>{lang === 'fr' ? 'Mon Diftar' : 'دفتري'}</h2>
            <p className="text-sm mt-1 font-medium" style={{ color: 'var(--brand-secondary)', opacity: 0.6 }}>{lang === 'fr' ? 'Vos notes et réflexions' : 'ملاحظاتك وتأملاتك'}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
            onClick={createPage}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white shadow-lg transition-all"
            style={{ background: 'var(--brand-primary)', boxShadow: '0 8px 24px color-mix(in srgb, var(--brand-primary) 35%, transparent)' }}
          >
            <Plus size={20} />
            <span className="hidden sm:inline">{lang === 'fr' ? 'Nouvelle Page' : 'صفحة جديدة'}</span>
          </motion.button>
        </div>

        {userData.diftarPages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 opacity-40 py-24">
            <NotebookPen size={64} style={{ color: 'var(--brand-primary)' }} />
            <p className="text-lg font-medium" style={{ color: 'var(--brand-text-muted)' }}>{lang === 'fr' ? 'Aucune page pour l\'instant' : 'لا توجد صفحات بعد'}</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {userData.diftarPages.map((page) => (
            <motion.div
              key={page.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -8 }}
              className="group flex flex-col gap-0"
            >
              {/* Notebook cover */}
              <div
                className="relative aspect-[3/4] cursor-pointer rounded-r-2xl shadow-lg border-l-[10px] overflow-hidden transition-all group-hover:shadow-2xl"
                style={{ background: '#ffffff', borderLeftColor: 'var(--brand-primary)' }}
                onClick={() => setActivePageId(page.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none" />
                {/* Spiral holes */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-around py-4 px-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: 'var(--brand-primary)', background: 'var(--brand-page)', opacity: 0.6 }} />
                  ))}
                </div>
                <div className="p-5 h-full flex flex-col justify-between ml-3">
                  <div className="space-y-3">
                    {editingPageId === page.id ? (
                      <div onClick={e => e.stopPropagation()}>
                        <input
                          autoFocus
                          className="w-full bg-transparent border-b-2 px-1 py-0.5 text-base font-serif italic focus:outline-none"
                          style={{ borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)' }}
                          value={page.title}
                          onChange={e => renamePage(page.id, e.target.value)}
                          onBlur={() => setEditingPageId(null)}
                          onKeyDown={e => e.key === 'Enter' && setEditingPageId(null)}
                        />
                      </div>
                    ) : (
                      <h3 className="text-lg font-serif italic leading-tight transition-colors" style={{ color: 'var(--brand-primary)' }}>{page.title}</h3>
                    )}
                    <div className="w-8 h-0.5 rounded-full" style={{ background: 'var(--brand-secondary)', opacity: 0.4 }} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--brand-primary)', opacity: 0.35 }}>
                      {new Date(page.lastSaved).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'ar-SA')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons — ALWAYS VISIBLE (tablet + desktop) */}
              <div className="flex gap-1 mt-2">
                <button
                  onClick={() => setActivePageId(page.id)}
                  className="flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                  style={{ background: 'var(--brand-primary)', color: '#fff' }}
                >
                  {lang === 'fr' ? 'Ouvrir' : 'فتح'}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setEditingPageId(editingPageId === page.id ? null : page.id); }}
                  className="px-3 py-2 rounded-xl text-[10px] transition-all"
                  style={{ background: 'color-mix(in srgb, var(--brand-secondary) 12%, transparent)', color: 'var(--brand-primary)' }}
                  title={lang === 'fr' ? 'Renommer' : 'تسمية'}
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setShowConfirmDelete(page.id); }}
                  className="px-3 py-2 rounded-xl text-[10px] transition-all"
                  style={{ background: 'rgba(239,68,68,0.08)', color: 'rgba(239,68,68,0.7)' }}
                  title={lang === 'fr' ? 'Supprimer' : 'حذف'}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Confirm delete modal */}
        <AnimatePresence>
          {showConfirmDelete && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 backdrop-blur-md z-[200] flex items-center justify-center p-6" style={{ background: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white p-10 rounded-[2rem] shadow-2xl max-w-sm w-full text-center space-y-6">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto"><Trash2 size={32} className="text-red-500" /></div>
                <h3 className="text-2xl font-serif italic" style={{ color: 'var(--brand-primary)' }}>{lang === 'fr' ? 'Supprimer la page ?' : 'حذف الصفحة؟'}</h3>
                <div className="flex gap-3">
                  <button onClick={() => setShowConfirmDelete(null)} className="flex-1 py-3 rounded-2xl border font-bold text-xs uppercase tracking-widest" style={{ borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)', opacity: 0.4 }}>{lang === 'fr' ? 'Annuler' : 'إلغاء'}</button>
                  <button onClick={() => { setUserData((prev: UserData) => ({ ...prev, diftarPages: prev.diftarPages.filter(p => p.id !== showConfirmDelete) })); setShowConfirmDelete(null); }} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold text-xs uppercase tracking-widest">{lang === 'fr' ? 'Supprimer' : 'حذف'}</button>
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
    <div className="flex-1 flex flex-col gap-3 relative h-full overflow-hidden">
          <motion.div
            className="absolute top-2 left-2 right-2 z-[100] flex flex-col gap-2 pointer-events-none"
          >
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
                { id: 'tools',    icon: Pencil,    title: lang === 'fr' ? 'Outils' : 'أدوات',       active: showToolsMenu,          action: () => { closeAllPanels(); setShowToolsMenu(v => !v); } },
                { id: 'colors',   icon: Palette,   title: lang === 'fr' ? 'Couleurs' : 'الألوان',    active: showCustomizationMenu,  action: () => { closeAllPanels(); setShowCustomizationMenu(v => !v); } },
                { id: 'shapes',   icon: Star,      title: lang === 'fr' ? 'Formes' : 'الأشكال',      active: showShapePicker,        action: () => { closeAllPanels(); setShowShapePicker(v => !v); } },
                { id: 'paper',    icon: Settings2, title: lang === 'fr' ? 'Papier' : 'الورق',        active: showPaperSettings,      action: () => { closeAllPanels(); setShowPaperSettings(v => !v); } },
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

          <AnimatePresence>
            {(showToolsMenu || showCustomizationMenu || showShapePicker || showPaperSettings) && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-2xl mx-auto"
              >
                {showToolsMenu && (
                  <div className="backdrop-blur-3xl rounded-[2rem] shadow-2xl border p-5 space-y-4" style={{ background: 'var(--brand-surface)', borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--brand-secondary)', opacity: 0.6 }}>{lang === 'fr' ? 'Outil' : 'الأداة'}</p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {[
                        { id: 'pen',          icon: Pencil,      label: lang === 'fr' ? 'Stylo'      : 'قلم'          },
                        { id: 'fountain-pen', icon: Brush,       label: lang === 'fr' ? 'Plume'      : 'ريشة'         },
                        { id: 'highlighter',  icon: Highlighter, label: lang === 'fr' ? 'Surligneur' : 'تحديد'        },
                        { id: 'chalk',        icon: Edit2,       label: lang === 'fr' ? 'Craie'      : 'طباشير'       },
                        { id: 'ruler',        icon: Ruler,       label: lang === 'fr' ? 'Règle'      : 'مسطرة'        },
                        { id: 'eraser',       icon: Eraser,      label: lang === 'fr' ? 'Gomme'      : 'ممحاة'        },
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => { setTool(t.id as any); setShowToolsMenu(false); }}
                          className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all font-bold text-[9px] uppercase tracking-wider"
                          style={tool === t.id ? { background: 'var(--brand-primary)', color: '#fff', boxShadow: '0 4px 14px color-mix(in srgb, var(--brand-primary) 30%, transparent)' } : { background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)', color: 'var(--brand-text-muted)' }}
                        >
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
                            onClick={() => setWidth(p.value)}
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
                          onClick={() => setColor(c)}
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
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {SHAPE_CATEGORIES[shapeCategory].shapes.map(shape => (
                        <motion.button
                          key={shape.id}
                          onClick={() => { setActiveShapeTypeWithRef(shape.type); setShowShapePicker(false); }}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          className="aspect-square flex flex-col items-center justify-center p-3 rounded-2xl border transition-all hover:shadow-lg"
                          style={{ background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)', borderColor: 'transparent', color: 'var(--brand-primary)' }}
                        >
                          <div className="w-8 h-8 flex items-center justify-center">
                            {shape.type === 'circle' && <div className="w-6 h-6 rounded-full border-2 border-current" />}
                            {shape.type === 'square' && <div className="w-6 h-6 border-2 border-current" />}
                            {shape.type === 'triangle' && <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-current" />}
                            {shape.type === 'line' && <div className="w-6 h-0.5 bg-current" />}
                            {shape.type === 'arrow' && <div className="flex items-center"><div className="w-4 h-0.5 bg-current"></div><div className="w-0 h-0 border-l-[4px] border-l-current border-t-[2px] border-t-transparent border-b-[2px] border-b-transparent"></div></div>}
                          </div>
                          <span className="text-[8px] font-bold mt-1">{shape.label[lang as 'fr' | 'ar']}</span>
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
                          { id: 'blank',      label: lang === 'fr' ? 'Blanc'       : 'أبيض'   },
                          { id: 'lines',      label: lang === 'fr' ? 'Lignes'      : 'سطور'   },
                          { id: 'grid',       label: lang === 'fr' ? 'Grille'      : 'شبكة'   },
                          { id: 'dots',       label: lang === 'fr' ? 'Points'      : 'نقاط'   },
                          { id: 'arabesque',  label: lang === 'fr' ? 'Arabesque'   : 'عربسك'  },
                        ].map(s => (
                          <button
                            key={s.id}
                            onClick={() => setPaperStyle(s.id as any)}
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
                            onClick={() => setPaperColor(pc.value)}
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

        </motion.div>
      <div
        ref={scrollContainerRef}
        className="flex-1 rounded-[2rem] shadow-2xl overflow-y-auto relative border group cursor-none custom-scrollbar pt-28"
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

      {/* Canvas area */}
        {/* Scroll buttons */}
        <div className="fixed right-4 md:right-20 bottom-36 md:bottom-8 z-50 flex flex-col gap-2">
          <button onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })} className="p-3 rounded-full shadow-lg border transition-all hover:scale-105" style={{ background: 'var(--brand-surface)', color: 'var(--brand-primary)', borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}><ChevronUp size={18} /></button>
          <button onClick={() => scrollContainerRef.current?.scrollTo({ top: pageHeight, behavior: 'smooth' })} className="p-3 rounded-full shadow-lg border transition-all hover:scale-105" style={{ background: 'var(--brand-surface)', color: 'var(--brand-primary)', borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}><ChevronDown size={18} /></button>
        </div>

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
          onTouchStart={e => { e.preventDefault(); startDrawing(e); }}
          onTouchMove={e => { e.preventDefault(); draw(e); }}
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
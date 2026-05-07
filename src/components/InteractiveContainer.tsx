import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Edit2, Plus, Trash2, Check, X, Move } from 'lucide-react';

interface Point {
  id: number;
  x: number;
  y: number;
  label: string;
  desc: string;
  color?: string;
  size?: number;
  shape?: 'circle' | 'square' | 'diamond';
}

interface InteractiveContainerProps {
  config?: { points: Point[] };
  onUpdateConfig?: (config: { points: Point[] }) => void;
  isAdmin?: boolean;
}

const DEFAULT_POINTS: Point[] = [
  { id: 1, x: 61, y: 43, label: 'Приточные жалюзи', desc: 'Автоматические воздушные клапаны с электроприводом для забора воздуха на охлаждение.' },
  { id: 2, x: 48, y: 18, label: 'Выхлопная система', desc: 'Глушитель в сборе с термоизоляцией и гибким переходником (компенсатором).' },
  { id: 3, x: 58, y: 52, label: 'Дизель-генератор', desc: 'ДВС и генератор на общей раме с виброопорами внутри надежного блок-контейнера.' },
  { id: 4, x: 82, y: 42, label: 'Выбросные жалюзи', desc: 'Клапан выброса горячего воздуха от радиатора с защитной решеткой.' },
  { id: 5, x: 35, y: 72, label: 'Топливная система', desc: 'Расходный бак увеличенного объема с датчиками уровня и системой перекачки.' },
  { id: 6, x: 18, y: 68, label: 'Шкаф управления', desc: 'Микропроцессорная панель управления (контроллер) для автоматизации пуска и защиты.' },
];

export const InteractiveContainer: React.FC<InteractiveContainerProps> = ({ config, onUpdateConfig, isAdmin }) => {
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [points, setPoints] = useState<Point[]>(config?.points || DEFAULT_POINTS);
  const [editingPointId, setEditingPointId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with config if it changes from outside
  useEffect(() => {
    if (config?.points) {
      setPoints(config.points);
    }
  }, [config]);

  const handleToggleEdit = () => {
    if (isEditing) {
      // Save changes when turning off edit mode
      onUpdateConfig?.({ points });
    }
    setIsEditing(!isEditing);
    setEditingPointId(null);
  };

  const handleDragEnd = (id: number, info: any) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const point = points.find(p => p.id === id);
    if (!point) return;

    if (rect.width === 0 || rect.height === 0) return;

    const newX = ((info.point.x - rect.left) / rect.width) * 100;
    const newY = ((info.point.y - rect.top) / rect.height) * 100;

    if (isNaN(newX) || isNaN(newY)) return;

    setPoints(prev => prev.map(p => 
      p.id === id ? { 
        ...p, 
        x: Math.max(0, Math.min(100, newX)), 
        y: Math.max(0, Math.min(100, newY)) 
      } : p
    ));
  };

  const handleDrag = (id: number, info: any) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const newX = ((info.point.x - rect.left) / rect.width) * 100;
    const newY = ((info.point.y - rect.top) / rect.height) * 100;

    if (isNaN(newX) || isNaN(newY)) return;

    setPoints(prev => prev.map(p => 
      p.id === id ? { 
        ...p, 
        x: Math.max(0, Math.min(100, newX)), 
        y: Math.max(0, Math.min(100, newY)) 
      } : p
    ));
  };

  const handleAddPoint = (e: React.MouseEvent) => {
    if (!isEditing || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newId = points.length > 0 ? Math.max(...points.map(p => p.id)) + 1 : 1;
    const newPoint: Point = {
      id: newId,
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
      label: 'Новая точка',
      desc: 'Описание',
      color: '#ef4444',
      size: 16,
      shape: 'circle'
    };

    setPoints(prev => [...prev, newPoint]);
    setEditingPointId(newId);
  };

  const handleUpdatePoint = (id: number, updates: Partial<Point>) => {
    setPoints(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleDeletePoint = (id: number) => {
    setPoints(prev => prev.filter(p => p.id !== id));
    setEditingPointId(null);
  };

  return (
    <div className="flex flex-col items-center py-8 px-10 page-break-avoid bg-white rounded-3xl border border-brand-blue/10 shadow-sm mb-12 relative group/container">
       {/* PDF / Print version (Static Image) */}
       <div className="hidden print:block w-full">
         <h3 className="text-[12px] font-black text-brand-blue uppercase mb-6 tracking-widest text-center italic">Устройство блок-контейнера «Север»</h3>
         <img src="/container_labels.png" className="w-[180mm] mx-auto h-auto rounded-xl" alt="Контейнер в разрезе (схема)" />
       </div>

       {/* Web / Interactive version */}
       <div className="print:hidden w-full flex flex-col items-center">
         <div className="flex items-center gap-3 mb-6">
            <h3 className="text-[14px] font-black text-brand-blue uppercase tracking-widest">Интерактивная схема контейнера</h3>
            {isAdmin && (
              <button 
                onClick={handleToggleEdit}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all shadow-sm border",
                  isEditing 
                    ? "bg-green-500 text-white border-green-600" 
                    : "bg-white text-brand-blue border-brand-blue/20 hover:bg-brand-blue/5"
                )}
              >
                {isEditing ? (
                  <>
                    <Check className="w-3 h-3" />
                    Готово
                  </>
                ) : (
                  <>
                    <Edit2 className="w-3 h-3" />
                    Редактировать
                  </>
                )}
              </button>
            )}
         </div>

         <div 
           ref={containerRef}
           onClick={(e) => {
             if (isEditing && e.target === e.currentTarget) handleAddPoint(e);
           }}
           className={cn(
             "relative w-full aspect-[16/9] bg-white rounded-2xl overflow-hidden shadow-2xl border border-doc-slate-100 flex items-center justify-center p-4",
             isEditing && "cursor-crosshair ring-2 ring-brand-blue/20"
           )}
         >
            <img src="/container.png" className="w-full h-full object-contain pointer-events-none" alt="Схема" />
            
            <div className="absolute inset-0 pointer-events-none">
              {points.map((p) => (
                <motion.div 
                  key={p.id}
                  drag={isEditing}
                  dragMomentum={false}
                  dragElastic={0}
                  onDrag={(e, info) => handleDrag(p.id, info)}
                  onDragEnd={(e, info) => {
                    handleDragEnd(p.id, info);
                    setActivePoint(null);
                  }}
                  // Always use absolute positioning for points to avoid jumps
                  // The translate from motion.div will be 0 because we sync to state
                  animate={{ x: 0, y: 0 }}
                  transition={{ duration: 0 }}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto",
                    isEditing ? "cursor-move" : "cursor-pointer",
                    (activePoint === p.id || (isEditing && editingPointId === p.id)) ? "z-[100]" : "z-10"
                  )}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  onMouseEnter={() => !isEditing && setActivePoint(p.id)}
                  onMouseLeave={() => !isEditing && setActivePoint(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isEditing) setEditingPointId(p.id === editingPointId ? null : p.id);
                  }}
                >
                  <div className="relative group/dot">
                    {/* Point Indicator */}
                    <div 
                      className={cn(
                        "shadow-lg transition-all border-2 border-white",
                        (p.shape || 'circle') === 'circle' ? "rounded-full" : 
                        (p.shape === 'diamond') ? "rotate-45" : "rounded-sm",
                        activePoint === p.id || editingPointId === p.id ? "scale-125 z-20" : "scale-100"
                      )} 
                      style={{
                        backgroundColor: (activePoint === p.id || editingPointId === p.id) ? '#00296B' : (p.color || '#ef4444'),
                        width: `${p.size || 16}px`,
                        height: `${p.size || 16}px`,
                        boxShadow: `0 4px 12px ${(activePoint === p.id || editingPointId === p.id) ? 'rgba(0,41,107,0.4)' : (p.color ? `${p.color}40` : 'rgba(239,68,68,0.4)')}`
                      }}
                    />

                    {/* Tooltip for View Mode */}
                    <AnimatePresence>
                      {!isEditing && activePoint === p.id && (
                        <motion.div 
                          initial={{ opacity: 0, y: p.y < 40 ? -10 : 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: p.y < 40 ? -10 : 10, scale: 0.9 }}
                          className={cn(
                            "absolute w-56 p-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-brand-blue/10 z-50 pointer-events-none",
                            p.y < 40 ? "top-full mt-4" : "bottom-full mb-4",
                            p.x < 20 ? "left-0 translate-x-0" : p.x > 80 ? "right-0 translate-x-0" : "left-1/2 -translate-x-1/2"
                          )}
                        >
                          <div className={cn(
                            "absolute w-4 h-4 bg-white/95 rotate-45 border-brand-blue/10",
                            p.y < 40 ? "bottom-full border-t border-l -mb-2" : "top-full border-r border-b -mt-2",
                            p.x < 20 ? "left-2 translate-x-0" : p.x > 80 ? "right-2 translate-x-0" : "left-1/2 -translate-x-1/2"
                          )} />
                          <p className="text-[11px] font-black text-brand-blue uppercase mb-1.5 leading-tight tracking-tight border-b border-brand-blue/10 pb-1">{p.label}</p>
                          <p className="text-[10px] text-doc-slate-600 font-bold leading-snug">{p.desc}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Editor Form for Edit Mode - COMPACT VERSION */}
                    <AnimatePresence>
                      {isEditing && editingPointId === p.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.16 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.16 }}
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            "absolute w-56 p-3 bg-white rounded-xl shadow-2xl border border-brand-blue/20 z-[60]",
                            p.y < 40 ? "top-full mt-6" : "bottom-full mb-6",
                            p.x < 25 ? "left-0 translate-x-0" : p.x > 75 ? "right-0 translate-x-0" : "left-1/2 -translate-x-1/2"
                          )}
                        >
                          <div className={cn(
                            "absolute w-3 h-3 bg-white rotate-45 border-brand-blue/20",
                            p.y < 40 ? "bottom-full border-t border-l -mb-1.5" : "top-full border-r border-b -mt-1.5",
                            p.x < 25 ? "left-2 translate-x-0" : p.x > 75 ? "right-2 translate-x-0" : "left-1/2 -translate-x-1/2"
                          )} />
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center gap-2">
                              <input 
                                type="text"
                                autoFocus
                                value={p.label}
                                onChange={(e) => handleUpdatePoint(p.id, { label: e.target.value })}
                                className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-black uppercase text-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue/30"
                                placeholder="Заголовок"
                              />
                              <button 
                                onClick={() => handleDeletePoint(p.id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 shrink-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            <textarea 
                              value={p.desc}
                              onChange={(e) => handleUpdatePoint(p.id, { desc: e.target.value })}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold min-h-[40px] focus:outline-none focus:ring-1 focus:ring-brand-blue/30 resize-none"
                              placeholder="Описание..."
                            />

                            {/* Customization controls */}
                            <div className="space-y-2 pt-1 border-t border-slate-100">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-slate-400 uppercase">Стиль</span>
                                <div className="flex gap-1.5">
                                  {(['circle', 'square', 'diamond'] as const).map(shape => (
                                    <button
                                      key={shape}
                                      onClick={() => handleUpdatePoint(p.id, { shape })}
                                      className={cn(
                                        "w-4 h-4 border border-slate-200 transition-all",
                                        shape === 'circle' ? "rounded-full" : shape === 'diamond' ? "rotate-45" : "rounded-sm",
                                        (p.shape || 'circle') === shape ? "bg-brand-blue border-brand-blue scale-110" : "bg-white hover:bg-slate-50"
                                      )}
                                    />
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-slate-400 uppercase">Цвет</span>
                                <div className="flex gap-1">
                                  {['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#f97316', '#a855f7'].map(color => (
                                    <button
                                      key={color}
                                      onClick={() => handleUpdatePoint(p.id, { color })}
                                      className={cn(
                                        "w-4 h-4 rounded-full border-2 transition-all",
                                        (p.color || '#ef4444') === color ? "border-slate-300 scale-110 shadow-sm" : "border-transparent"
                                      )}
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-slate-400 uppercase">Размер</span>
                                <input 
                                  type="range"
                                  min="10"
                                  max="32"
                                  value={p.size || 16}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val)) handleUpdatePoint(p.id, { size: val });
                                  }}
                                  className="w-24 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                                />
                              </div>
                            </div>

                            <button 
                              onClick={() => setEditingPointId(null)}
                              className="w-full bg-brand-blue text-white py-1.5 rounded-lg text-[9px] font-black uppercase shadow-lg shadow-brand-blue/20 hover:opacity-90 transition-opacity"
                            >
                              Ок
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Status indicators */}
            <div className="absolute bottom-6 left-8 right-8 flex justify-between items-center pointer-events-none">
              {!isEditing && (
                <div className="flex items-center gap-2 bg-brand-blue/5 px-4 py-2 rounded-full border border-brand-blue/10 backdrop-blur-sm">
                   <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                   <span className="text-[9px] font-black text-brand-blue uppercase tracking-widest">Наведите на точки для деталей</span>
                </div>
              )}
              {isEditing && (
                <>
                  <div className="flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20 backdrop-blur-sm">
                     <Plus className="w-3 h-3 text-green-600" />
                     <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Нажмите в любое место, чтобы добавить точку</span>
                  </div>
                  <div className="flex items-center gap-2 bg-brand-blue/10 px-4 py-2 rounded-full border border-brand-blue/20 backdrop-blur-sm">
                     <Move className="w-3 h-3 text-brand-blue" />
                     <span className="text-[9px] font-black text-brand-blue uppercase tracking-widest">Перетаскивайте точки за рукоятки</span>
                  </div>
                </>
              )}
            </div>
         </div>
       </div>
    </div>
  );
};


import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Trash2, Edit2, Check, X, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTransactions } from '../../context/TransactionContext';
import { format, parseISO, isSameDay } from 'date-fns';
import { cn, getLocalTodayString, getTagStyle, getSelectedTagClass } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { AddTransactionModal } from '../transactions/AddTransactionModal';
import { CustomDatePicker } from '../../components/CustomDatePicker';

interface SwipeableTransactionItemProps {
  key?: React.Key;
  t: any;
  badge: { bg: string; text: string; label: string };
  getTypeName: (type: string) => string;
  onEdit: (t: any) => void;
  onDelete: (id: string) => void;
}

function SwipeableTransactionItem({ t, badge, getTypeName, onEdit, onDelete }: SwipeableTransactionItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const customTags = useFinanceStore((state) => state.customTags);

  return (
    <div className="relative overflow-hidden border-b border-gray-50 dark:border-gray-800 bg-white dark:bg-[#141D23] select-none">
       {/* Underlying sliding background drawer */}
       <div className="absolute right-0 top-0 bottom-0 flex justify-end items-center z-0 w-full bg-gray-50 dark:bg-[#141D23]">
          {/* Edit Button */}
          <button
             type="button"
             onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onEdit(t);
             }}
             className="h-full w-[80px] bg-[#d8e2ff] text-[#005bc0] flex flex-col items-center justify-center transition-colors cursor-pointer hover:bg-[#c6d7ff]"
          >
             <Edit2 className="w-[18px] h-[18px] mb-1" />
             <span className="text-[10px] font-black uppercase tracking-wider">Editar</span>
          </button>
          
          {/* Delete Button */}
          <button
             type="button"
             onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onDelete(t.id);
             }}
             className="h-full w-[80px] bg-[#ffdad9] text-[#b6152e] flex flex-col items-center justify-center transition-colors cursor-pointer hover:bg-[#ffb3b1]"
          >
             <Trash2 className="w-[18px] h-[18px] mb-1" />
             <span className="text-[10px] font-black uppercase tracking-wider">Excluir</span>
          </button>
       </div>

       {/* Interactive Foreground main slider */}
       <motion.div
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: -160, right: 0 }}
          dragElastic={{ left: 0.1, right: 0.05 }}
          animate={{ x: isOpen ? -160 : 0 }}
          onDragEnd={(event, info) => {
             if (info.offset.x < -30 || info.velocity.x < -100) {
                setIsOpen(true);
             } else if (info.offset.x > 30 || info.velocity.x > 100) {
                setIsOpen(false);
             } else {
                // Toggle on small click or drag gesture
                if (Math.abs(info.offset.x) < 5) {
                   setIsOpen(!isOpen);
                }
             }
          }}
          className="relative bg-white dark:bg-[#141D23] flex justify-between items-center py-4 px-5 z-10 cursor-grab active:cursor-grabbing transition-colors"
       >
          <div className="flex items-start gap-4">
             <div className={cn("w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-extrabold mt-0.5 border flex-shrink-0", badge.bg, badge.text)}>
                {badge.label}
             </div>
             <div>
                <p className="text-[17px] text-gray-950 dark:text-gray-100 font-semibold tracking-tight leading-tight mb-1">{t.description}</p>
                {t.tags && t.tags.length > 0 && (
                   <div className="flex flex-wrap gap-1 mb-1 mt-0.5">
                      {t.tags.map((tg: string, idx: number) => {
                         const tagStyle = getTagStyle(tg, customTags);
                         return (
                            <span key={idx} className={cn(
                               "text-[10px] font-extrabold px-1.5 py-0.5 rounded border flex items-center gap-1 transition-colors",
                               tagStyle.bgClass,
                               tagStyle.textClass,
                               tagStyle.borderClass
                            )}>
                               <span>{tagStyle.icon}</span>
                               <span>{tg}</span>
                            </span>
                         );
                      })}
                   </div>
                )}
                <p className="text-[14px] text-gray-400 dark:text-gray-500 font-medium">{format(parseISO(t.date), 'dd/MM')}</p>
             </div>
          </div>
          
          <div className="text-right flex items-center gap-1">
             <div className="text-right pointer-events-none select-none">
                <p className="text-[17px] font-semibold text-gray-900 dark:text-gray-200 tracking-tight mb-1">
                   R$ {t.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
                <p className={cn("text-[14px] font-bold capitalize", badge.text)}>
                   {getTypeName(t.type)}
                </p>
             </div>
             
             {/* Hint indicator */}
             {!isOpen && (
                <div className="text-gray-200 text-xs font-black pl-1 pb-1 animate-pulse select-none">
                   ‹
                </div>
             )}
          </div>
       </motion.div>
    </div>
  );
}

export function DayTransactions() {
  const navigate = useNavigate();
  const { day } = useParams();
  const { transactions, selectedDate, setSelectedDate, deleteTransaction, updateTransaction } = useTransactions();
  const [filterType, setFilterType] = useState<string>('TODOS');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const customTags = useFinanceStore((state) => state.customTags);
  const addCustomTag = useFinanceStore((state) => state.addCustomTag);

  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // States for the edit modal
  const [editingTx, setEditingTx] = useState<any | null>(null);
  const [showEditRecurrenceConfirm, setShowEditRecurrenceConfirm] = useState(false);
  const [pendingUpdateData, setPendingUpdateData] = useState<any | null>(null);
  const [editAmount, setEditAmount] = useState<string>('0'); // stored as cents string
  const [editDesc, setEditDesc] = useState<string>('');
  const [editType, setEditType] = useState<string>('SAIDA');
  const [editDate, setEditDate] = useState<string>('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const editFormScrollRef = useRef<HTMLDivElement>(null);

  // Use the year and month coordinates from context
  const targetDate = useMemo(() => {
    return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), parseInt(day || '1'));
  }, [selectedDate, day]);

  // Format safely to internal YYYY-MM-DD string representation for dateSync preset
  const dateFormattedToLocalString = useMemo(() => {
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dStr = String(targetDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${dStr}`;
  }, [targetDate]);

  const handlePrevDay = () => {
    const prevDate = new Date(targetDate);
    prevDate.setDate(prevDate.getDate() - 1);
    if (prevDate.getMonth() !== targetDate.getMonth() || prevDate.getFullYear() !== targetDate.getFullYear()) {
      setSelectedDate(prevDate);
    }
    navigate(`/dia/${prevDate.getDate()}`);
  };

  const handleNextDay = () => {
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);
    if (nextDate.getMonth() !== targetDate.getMonth() || nextDate.getFullYear() !== targetDate.getFullYear()) {
      setSelectedDate(nextDate);
    }
    navigate(`/dia/${nextDate.getDate()}`);
  };

  const dayTransactions = useMemo(() => {
    return transactions.filter(t => {
      const isSameDate = isSameDay(parseISO(t.date), targetDate);
      if (!isSameDate) return false;
      if (filterType === 'TODOS') return true;
      return t.type === filterType;
    });
  }, [transactions, targetDate, filterType]);

  const getBadgeStyles = (type: string) => {
    if (type === 'ENTRADA') return { bg: 'bg-[#dcfce7] border-[#bbf7d0]', text: 'text-[#006e25]', label: 'E' };
    if (type === 'SAIDA') return { bg: 'bg-[#ffdad9] border-[#fecaca]', text: 'text-[#b6152e]', label: 'S' };
    if (type === 'CARTAO') return { bg: 'bg-[#d8e2ff] border-[#bfdbfe]', text: 'text-[#005bc0]', label: 'C' };
    if (type === 'ECONOMIA') return { bg: 'bg-[#e6eff8] border-[#cfe2fe]', text: 'text-[#00295d]', label: 'E' };
    return { bg: 'bg-[#FAD1DB] border-[#fbcfe8]', text: 'text-[#C4245A]', label: 'D' };
  };

  const getTypeName = (type: string) => {
    if (type === 'ENTRADA') return 'Entrada';
    if (type === 'SAIDA') return 'Saída';
    if (type === 'CARTAO') return 'Cartão';
    if (type === 'ECONOMIA') return 'Economia';
    return 'Diário';
  };

  const filterOptions = [
    { value: 'TODOS', label: 'Todas' },
    { value: 'DIARIO', label: 'Diários' },
    { value: 'SAIDA', label: 'Saídas' },
    { value: 'ENTRADA', label: 'Entradas' },
    { value: 'CARTAO', label: 'Cartões' },
    { value: 'ECONOMIA', label: 'Economia' },
  ];

  // Set initial editing fields when editingTx is defined
  useEffect(() => {
     if (editingTx) {
        if (editFormScrollRef.current) {
           editFormScrollRef.current.scrollTop = 0;
        }
        // Convert the float amount to cents string representation
        const centsStr = Math.round(editingTx.amount * 100).toString();
        setEditAmount(centsStr);
        setEditDesc(editingTx.description);
        setEditType(editingTx.type);
        setEditDate(editingTx.date.split('T')[0]);
        setEditTags(editingTx.tags || []);
        setShowTagInput(false);
        setNewTagText('');
     }
  }, [editingTx]);

  const displayAmount = (parseInt(editAmount || '0') / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
return (
    <div className="flex flex-col min-h-full bg-white dark:bg-[#141D23] pb-24 text-gray-900 dark:text-gray-100 transition-colors">
       {/* Header */}
       <div className="flex items-center justify-between px-5 pt-safe-header pb-4 bg-white dark:bg-[#141D23] sticky top-0 z-20 transition-colors">
          <button onClick={() => navigate('/')} className="p-1 -ml-1 text-gray-800 dark:text-gray-200"><ArrowLeft className="w-5 h-5" /></button>
          
           <div className="flex items-center gap-4">
              <button 
                 onClick={handlePrevDay} 
                 className="p-1.5 rounded-full hover:bg-gray-150 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors cursor-pointer"
                 title="Dia anterior"
              >
                 <ChevronLeft className="w-5 h-5 text-gray-800 dark:text-gray-200" strokeWidth={2.5} />
              </button>
              
              <h1 className="text-[20px] font-semibold text-gray-900 dark:text-gray-100 tracking-tight select-none">
                 {day}/{String(selectedDate.getMonth() + 1).padStart(2, '0')}
              </h1>
              
              <button 
                 onClick={handleNextDay} 
                 className="p-1.5 rounded-full hover:bg-gray-150 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors cursor-pointer"
                 title="Próximo dia"
              >
                 <ChevronRight className="w-5 h-5 text-gray-800 dark:text-gray-200" strokeWidth={2.5} />
              </button>
           </div>

          <button 
             type="button"
             onClick={() => setIsAddModalOpen(true)} 
             className="p-1 -mr-1 text-gray-800 dark:text-gray-200 hover:opacity-80 transition-opacity flex items-center justify-center cursor-pointer"
             title="Novo lançamento rápido"
          >
             <Plus className="w-5 h-5" strokeWidth={2.5} />
          </button>
       </div>

       {/* Horizontal Scroll Filter Pills */}
       <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {filterOptions.map((opt) => (
             <button
                key={opt.value}
                onClick={() => setFilterType(opt.value)}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-full border whitespace-nowrap transition-all",
                  filterType === opt.value
                    ? "bg-gray-950 border-gray-950 dark:bg-gray-100 dark:border-gray-100 text-white dark:text-gray-950"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-[#1C262E] dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
                )}
             >
                {opt.label}
             </button>
          ))}
       </div>

       {/* List of Transactions */}
       <div className="flex flex-col">
          {dayTransactions.map((t) => {
             const badge = getBadgeStyles(t.type);
             return (
                <SwipeableTransactionItem
                   key={t.id}
                   t={t}
                   badge={badge}
                   getTypeName={getTypeName}
                   onEdit={(tx) => setEditingTx(tx)}
                   onDelete={(id) => setDeletingId(id)}
                />
             );
          })}
          {dayTransactions.length === 0 && (
            <div className="p-8 text-center text-gray-400 font-medium text-sm">
               Nenhuma transação {filterType !== 'TODOS' ? getTypeName(filterType).toLowerCase() + ' ' : ''}neste dia.
            </div>
          )}
       </div>

       {/* Deletion confirmation dialog overlay (previously adopted pink clean dialog) */}
       <AnimatePresence>
          {deletingId && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
                <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 0.4 }}
                   exit={{ opacity: 0 }}
                   onClick={() => setDeletingId(null)}
                   className="fixed inset-0 bg-[#141D23]"
                />
                
                <motion.div
                   initial={{ scale: 0.9, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   exit={{ scale: 0.9, opacity: 0 }}
                   className="relative bg-white rounded-3xl p-6 w-full max-w-sm z-50 shadow-2xl text-center space-y-4"
                >
                   <div className="w-12 h-12 rounded-full bg-pink-100 text-[#C4245A] flex items-center justify-center mx-auto">
                      <Trash2 className="w-6 h-6 animate-pulse" />
                   </div>
                    {(() => {
                       const tx = transactions.find(t => t.id === deletingId);
                       const isRootRecurrence = tx?.recurrenceId && tx?.isRecurrenceRoot;
                       return (
                          <div className="space-y-1">
                             <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                                {isRootRecurrence ? 'Excluir Repetições?' : 'Excluir Lançamento?'}
                             </h3>
                             <p className="text-xs text-gray-500 font-medium px-2 leading-relaxed">
                                {isRootRecurrence 
                                   ? 'Esse lançamento é a raiz de uma repetição. Essa ação é irreversível e irá excluir este lançamento e todas as suas repetições futuras imediatamente.' 
                                   : 'Essa ação é irreversível e irá atualizar o saldo da sua conta imediatamente.'}
                             </p>
                          </div>
                       );
                    })()}
                   <div className="flex items-center gap-2.5 pt-2">
                      <button
                         type="button"
                         onClick={() => setDeletingId(null)}
                         className="flex-1 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-[#555] text-xs font-extrabold py-3 rounded-xl transition-all cursor-pointer"
                      >
                         Cancelar
                      </button>
                      <button
                         type="button"
                         onClick={() => {
                            deleteTransaction(deletingId);
                            setDeletingId(null);
                         }}
                         className="flex-1 bg-[#FAD1DB] text-[#C4245A] hover:bg-[#fae1e6] border border-[#fbcfe8] text-xs font-extrabold py-3 rounded-xl transition-all cursor-pointer"
                      >
                         Excluir
                      </button>
                   </div>
                </motion.div>
             </div>
          )}
       </AnimatePresence>

        {/* Edit bottom sheet modal popup */}
        <AnimatePresence>
           {editingTx && (
              <>
                 <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setEditingTx(null)}
                    className="fixed inset-0 bg-[#141D23]/40 backdrop-blur-[4px] z-50"
                 />
                 
                 <motion.div
                     initial={isMobile ? { y: '100%', x: 0 } : { scale: 0.95, opacity: 0, x: '-50%', y: '-50%' }}
                     animate={isMobile ? { y: 0, x: 0 } : { scale: 1, opacity: 1, x: '-50%', y: '-50%' }}
                     exit={isMobile ? { y: '100%', x: 0 } : { scale: 0.95, opacity: 0, x: '-50%', y: '-50%' }}
                     transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                     style={isMobile ? {} : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', position: 'fixed' }}
                     className={cn(
                        "fixed z-50 bg-[#F6FAFF] dark:bg-[#1C262E] flex flex-col shadow-2xl transition-colors overflow-hidden",
                        isMobile 
                           ? "inset-x-0 bottom-0 rounded-t-2xl max-w-md mx-auto max-h-[93vh]" 
                           : "w-full max-w-md max-h-[90vh] rounded-2xl border border-transparent dark:border-gray-800"
                     )}
                  >
                     {/* iOS Mini Drag Handle */}
                     <div className={cn("w-8 h-1 bg-[#BDCAB9] dark:bg-gray-700 rounded-sm mx-auto mt-3 mb-2 flex-shrink-0", !isMobile && "hidden")} />

                    {/* Header Title & Close */}
                    <div className="flex justify-between items-center px-6 pt-1 pb-3 flex-shrink-0">
                       <h2 className="text-[20px] font-bold text-gray-900 dark:text-gray-100 tracking-tight">Editar Lançamento</h2>
                       <button 
                          onClick={() => setEditingTx(null)} 
                          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 dark:text-gray-500"
                       >
                          <X className="w-5 h-5" />
                       </button>
                    </div>

                    {/* Value Display Area matching AddTransactionModal */}
                    <div className="px-6 py-8 flex flex-col items-center justify-center bg-[#F6FAFF] dark:bg-[#1C262E] border-b border-gray-100 dark:border-gray-800 flex-shrink-0 transition-colors">
                       <span className="text-gray-500 dark:text-gray-400 text-xs font-bold tracking-wider uppercase mb-2">
                          VALOR DA {editType === 'SAIDA' ? 'SAÍDA' : editType === 'ENTRADA' ? 'ENTRADA' : editType === 'DIARIO' ? 'DIÁRIO' : editType === 'CARTAO' ? 'FATURA CARTÃO' : 'ECONOMIA'}
                       </span>
                       <div className="flex items-baseline text-gray-950 dark:text-gray-100 font-sans relative">
                           <span className="text-xl font-bold mr-1 text-gray-600 dark:text-gray-400">R$</span>
                           <input
                              ref={editInputRef}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={displayAmount}
                              onChange={(e) => {
                                 const cleanVal = e.target.value.replace(/\D/g, '');
                                 if (!cleanVal) {
                                    setEditAmount('0');
                                    return;
                                 }
                                 if (cleanVal.length <= 10) {
                                    setEditAmount(cleanVal.replace(/^0+/, '') || '0');
                                 }
                              }}
                              className="text-[40px] font-bold tracking-tight leading-none bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 m-0 w-48 text-gray-950 dark:text-gray-100 text-center select-all"
                           />
                        </div>
                    </div>

                    {/* Form Fields Area (Scrollable Layer) */}
                    <div ref={editFormScrollRef} className="flex-grow bg-white dark:bg-[#141D23] px-6 pt-5 pb-4 space-y-5 overflow-y-auto no-scrollbar transition-colors">
                       
                       {/* Type Toggle/Indicator */}
                       <div 
                          onClick={() => {
                             const types = ['SAIDA', 'ENTRADA', 'DIARIO', 'CARTAO', 'ECONOMIA'];
                             const nextIdx = (types.indexOf(editType) + 1) % types.length;
                             setEditType(types[nextIdx]);
                          }}
                          className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800/60 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 cursor-pointer rounded-lg px-2 transition-colors -mx-2"
                       >
                          <div className={cn(
                             "w-10 h-10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0",
                             editType === 'SAIDA' ? 'bg-[#ffdad9] text-[#b6152e]' : 
                             editType === 'ENTRADA' ? 'bg-[#dcfce7] text-[#006e25]' :
                             editType === 'DIARIO' ? 'bg-[#FAD1DB] text-[#C4245A]' :
                             editType === 'CARTAO' ? 'bg-[#d8e2ff] text-[#005bc0]' : 'bg-[#e6eff8] text-[#00295d]'
                          )}>
                             {editType === 'SAIDA' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="rotate-180"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>}
                             {editType === 'ENTRADA' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>}
                             {editType === 'DIARIO' && <span className="font-extrabold text-[12px] italic">D</span>}
                             {editType === 'CARTAO' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>}
                             {editType === 'ECONOMIA' && <span className="font-extrabold text-[12px]">E</span>}
                          </div>
                          <div className="flex-grow">
                             <p className="text-sm text-gray-400 dark:text-gray-500 font-medium leading-none mb-1">Categoria</p>
                             <p className="font-bold text-[16px] text-gray-900 dark:text-gray-100 leading-tight">
                                {editType === 'SAIDA' ? 'Saída' : editType === 'ENTRADA' ? 'Entrada' : editType === 'DIARIO' ? 'Diário' : editType === 'CARTAO' ? 'Cartão de Crédito' : 'Economia'}
                             </p>
                          </div>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400 dark:text-gray-500"><path d="m6 9 6 6 6-6"/></svg>
                       </div>

                       {/* Description Input */}
                       <div className="flex items-center gap-4 py-3 border-b border-[#F0F0F0] dark:border-gray-800/60">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 dark:text-gray-500 flex-shrink-0"><line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/></svg>
                          <div className="flex-1">
                             <input 
                                type="text" 
                                placeholder="Descrição" 
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                className="w-full bg-transparent border-none p-0 text-[16px] font-semibold text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0" 
                             />
                          </div>
                       </div>

                       {/* Date Selector */}
                       <div className="flex items-center gap-4 py-3 border-b border-[#F0F0F0] dark:border-gray-800/60 relative">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 dark:text-gray-500 flex-shrink-0"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                          <div className="flex-grow">
                             <CustomDatePicker 
                                 value={editDate}
                                 onChange={(dateStr) => setEditDate(dateStr)}
                              />
                          </div>
                          {editDate === getLocalTodayString() && (
                             <span className="text-xs text-gray-400 dark:text-gray-500 font-bold bg-gray-50 dark:bg-gray-800/60 px-2.5 py-1 rounded-sm">HOJE</span>
                          )}
                       </div>

                       {/* Tags Section */}
                       <div className="py-2 border-b border-[#F0F0F0] dark:border-gray-800/60 space-y-2">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 dark:text-gray-500 flex-shrink-0"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
                                <span className="text-[16px] font-semibold text-gray-950 dark:text-gray-100">Tags</span>
                             </div>
                             <button 
                                type="button"
                                onClick={() => setShowTagInput(!showTagInput)} 
                                className="p-1 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 text-[#FF5722]"
                             >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                             </button>
                          </div>
                          
                          {/* Available & Selected Tags Row */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                             {customTags.map((tag) => {
                               const isSelected = editTags.includes(tag.name);
                               return (
                                 <button
                                   key={tag.name}
                                   type="button"
                                   onClick={() => {
                                     if (isSelected) {
                                       setEditTags(editTags.filter(t => t !== tag.name));
                                     } else {
                                       setEditTags([...editTags, tag.name]);
                                     }
                                   }}
                                   className={cn(
                                     "text-xs font-bold px-2.5 py-1 rounded-full transition-all border flex items-center gap-1",
                                     isSelected 
                                       ? getSelectedTagClass(tag.color) 
                                       : "bg-[#F8FAFC] dark:bg-[#1C262E] border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700"
                                   )}
                                 >
                                   <span>{tag.icon || '🏷️'}</span>
                                   <span>{tag.name}</span>
                                 </button>
                               );
                             })}
                             {editTags.map((tag) => {
                               if (customTags.some((ct) => ct.name === tag)) return null;
                               return (
                                 <button
                                   key={tag}
                                   type="button"
                                   onClick={() => setEditTags(editTags.filter(t => t !== tag))}
                                   className={cn(
                                      "text-xs font-bold px-2.5 py-1 rounded-full transition-all border",
                                      getSelectedTagClass('bg-orange-100')
                                    )}
                                 >
                                   {tag} ×
                                 </button>
                               );
                             })}
                          </div>

                          {/* Sub Tag input container */}
                          {showTagInput && (
                             <div className="flex gap-2 items-center bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/80 rounded-lg p-1.5">
                                <input
                                   type="text"
                                   placeholder="Nova tag..."
                                   value={newTagText}
                                   onChange={(e) => setNewTagText(e.target.value)}
                                   onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                         e.preventDefault();
                                         const val = newTagText.trim();
                                         if (val) {
                                            if (!editTags.includes(val)) {
                                               setEditTags([...editTags, val]);
                                            }
                                            addCustomTag({
                                               name: val,
                                               color: 'bg-orange-100',
                                               icon: '🏷️'
                                            });
                                            setNewTagText('');
                                            setShowTagInput(false);
                                         }
                                      }
                                   }}
                                   className="w-full bg-transparent border-none text-[16px] font-semibold text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0 py-1 px-2"
                                />
                                <button
                                   type="button"
                                   onClick={() => {
                                      const val = newTagText.trim();
                                      if (val) {
                                         if (!editTags.includes(val)) {
                                            setEditTags([...editTags, val]);
                                         }
                                         addCustomTag({
                                            name: val,
                                            color: 'bg-orange-100',
                                            icon: '🏷️'
                                         });
                                         setNewTagText('');
                                         setShowTagInput(false);
                                      }
                                   }}
                                   className="text-white bg-[#8B5CF6] hover:bg-[#7c4fe0] text-xs font-bold px-3 py-1.5 rounded-md transition-colors"
                                >
                                   Ok
                                </button>
                             </div>
                          )}
                       </div>

                       {/* Confirmation Action Buttons styled perfectly */}
                       <div className="pt-4 pb-2 flex gap-3">
                          <button 
                            type="button"
                            onClick={() => setEditingTx(null)}
                            className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-[16px] transition-all cursor-pointer border border-transparent dark:border-gray-750"
                          >
                            Cancelar
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                                const finalAmt = parseInt(editAmount || '0') / 100;
                                if (isNaN(finalAmt) || finalAmt <= 0) return;
                                
                                const updatedData = {
                                   description: editDesc.trim() || (editType === 'SAIDA' ? 'Saída' : editType === 'ENTRADA' ? 'Entrada' : editType === 'DIARIO' ? 'Diário' : editType === 'CARTAO' ? 'Cartão de Crédito' : 'Economia'),
                                   amount: finalAmt,
                                   type: editType as any,
                                   date: new Date(editDate + 'T12:00:00').toISOString(),
                                   tags: editTags
                                };

                                if (editingTx.recurrenceId && editingTx.isRecurrenceRoot) {
                                   setPendingUpdateData(updatedData);
                                   setShowEditRecurrenceConfirm(true);
                                } else {
                                   updateTransaction(editingTx.id, updatedData);
                                   setEditingTx(null);
                                }
                             }}
                            className={cn(
                              "flex-[2] py-4 rounded-xl font-extrabold text-[16px] shadow-sm transition-all active:scale-[0.98] outline-none cursor-pointer text-center",
                              editType === 'SAIDA' ? 'bg-[#b6152e] hover:bg-[#92001f] dark:bg-[#e02641] dark:hover:bg-[#a6132a] text-white' :
                              editType === 'ENTRADA' ? 'bg-[#006e25] hover:bg-[#00531a] dark:bg-[#00a838] dark:hover:bg-[#007b29] text-white' :
                              editType === 'DIARIO' ? 'bg-[#9c27b0] hover:bg-[#7b1fa2] dark:bg-[#c740dd] dark:hover:bg-[#a52ab9] text-white' :
                              editType === 'CARTAO' ? 'bg-[#005bc0] hover:bg-[#004493] dark:bg-[#1a7bed] dark:hover:bg-[#0a66d0] text-white' : 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white'
                            )}
                          >
                            Salvar {editType === 'SAIDA' ? 'saída' : editType === 'ENTRADA' ? 'entrada' : editType === 'DIARIO' ? 'diário' : editType === 'CARTAO' ? 'cartão' : 'economia'}
                          </button>
                       </div>
                    </div>
                 </motion.div>
              </>
           )}
        </AnimatePresence>

         {/* Edit recurrence confirmation dialog overlay */}
         <AnimatePresence>
            {showEditRecurrenceConfirm && (
               <div className="fixed inset-0 z-[60] flex items-center justify-center p-5">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 0.4 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setShowEditRecurrenceConfirm(false)}
                     className="fixed inset-0 bg-[#141D23]"
                  />
                  
                  <motion.div
                     initial={{ scale: 0.9, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     exit={{ scale: 0.9, opacity: 0 }}
                     className="relative bg-white dark:bg-[#1C262E] rounded-3xl p-6 w-full max-w-sm z-50 shadow-2xl text-center space-y-4 border border-gray-150 dark:border-gray-800"
                  >
                     <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/30 text-[#FF5722] flex items-center justify-center mx-auto">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-pulse"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                     </div>
                     <div className="space-y-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">Atualizar Repetições?</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium px-2 leading-relaxed">
                           Este lançamento possui repetições mensais configuradas. Deseja aplicar as alterações a todos os lançamentos futuros desta série?
                        </p>
                     </div>
                     <div className="flex flex-col gap-2 pt-2">
                        <button
                           type="button"
                           onClick={() => {
                              if (pendingUpdateData && editingTx) {
                                 updateTransaction(editingTx.id, pendingUpdateData, true);
                                 setPendingUpdateData(null);
                                 setShowEditRecurrenceConfirm(false);
                                 setEditingTx(null);
                              }
                           }}
                           className="w-full bg-[#FF5722] hover:bg-[#eb4b18] text-white text-xs font-bold py-3.5 rounded-xl transition-all cursor-pointer shadow-sm text-center uppercase tracking-wide"
                        >
                           Aplicar a todas as repetições
                        </button>
                        <button
                           type="button"
                           onClick={() => {
                              if (pendingUpdateData && editingTx) {
                                 updateTransaction(editingTx.id, pendingUpdateData, false);
                                 setPendingUpdateData(null);
                                 setShowEditRecurrenceConfirm(false);
                                 setEditingTx(null);
                              }
                           }}
                           className="w-full bg-gray-150 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold py-3 rounded-xl transition-all cursor-pointer text-center"
                        >
                           Apenas este lançamento
                        </button>
                        <button
                           type="button"
                           onClick={() => {
                              setShowEditRecurrenceConfirm(false);
                           }}
                           className="w-full bg-transparent text-gray-400 hover:text-gray-650 dark:text-gray-500 dark:hover:text-gray-400 text-[11px] font-bold py-1.5 transition-all cursor-pointer text-center uppercase tracking-wide"
                        >
                           Voltar ao formulário
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* Contextual Quick Entry AddTransactionModal with presets */}
         <AddTransactionModal 
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            initialCategory="DIARIO"
            initialDate={dateFormattedToLocalString}
         />
     </div>
   );
}
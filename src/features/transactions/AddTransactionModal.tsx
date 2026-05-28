import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Delete } from 'lucide-react';
import { cn, getLocalTodayString } from '../../lib/utils';
import { CATEGORY_COLORS, TransactionType } from '../../types';
import { useTransactions } from '../../context/TransactionContext';
import { addMonths } from 'date-fns';
import { useFinanceStore } from '../../store/useFinanceStore';
import { CustomDatePicker } from '../../components/CustomDatePicker';

export function AddTransactionModal({ 
  isOpen, 
  onClose,
  initialType = 'SAIDA',
  initialCategory,
  initialDate
}: { 
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
  initialCategory?: TransactionType;
  initialDate?: string;
}) {
  const [amount, setAmount] = useState('0'); // stored as cents
  const [type, setType] = useState<TransactionType>('SAIDA');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(getLocalTodayString());
  const [isRecurring, setIsRecurring] = useState(false);
  const [repeatMonths, setRepeatMonths] = useState(2);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagText, setNewTagText] = useState('');

  const customTags = useFinanceStore((state) => state.customTags);
  const addCustomTag = useFinanceStore((state) => state.addCustomTag);
  
  const { addTransaction } = useTransactions();

  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setType(initialCategory || initialType);
      setAmount('0');
      setDescription('');
      setSelectedDate(initialDate || getLocalTodayString());
      setIsRecurring(false);
      setRepeatMonths(2);
      setSelectedTags([]);
      setShowTagInput(false);
      setNewTagText('');
    }
  }, [isOpen, initialType, initialCategory, initialDate]);

  // Helper to format amount
  const displayAmount = (parseInt(amount || '0') / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleNumpadClick = (val: string) => {
    if (val === 'backspace') {
      setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else {
      setAmount(prev => {
        if (prev === '0') return val;
        if (prev.length < 10) return prev + val; // max 10 digits
        return prev;
      });
    }
  };

  const handleAdd = () => {
    const numAmount = parseInt(amount || '0') / 100;
    if (numAmount <= 0) return;

    let totalMonths = 1;
    if (type !== 'DIARIO' && type !== 'CARTAO' && isRecurring) {
      totalMonths = Math.max(1, repeatMonths);
    }

    const baseDate = new Date(selectedDate + 'T12:00:00');

    for (let i = 0; i < totalMonths; i++) {
      const instanceDate = addMonths(baseDate, i);
      addTransaction({
         type,
         amount: numAmount,
         description: description || type,
         date: instanceDate.toISOString(),
         tags: selectedTags
      });
    }
    
    onClose();
  };

  const color = CATEGORY_COLORS[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#141D23]/40 backdrop-blur-[4px] z-50 transition-opacity" 
            onClick={onClose} 
          />
          <motion.div 
            initial={isMobile ? { y: '100%', x: 0 } : { scale: 0.95, opacity: 0, x: '-50%', y: '-50%' }} 
            animate={isMobile ? { y: 0, x: 0 } : { scale: 1, opacity: 1, x: '-50%', y: '-50%' }} 
            exit={isMobile ? { y: '100%', x: 0 } : { scale: 0.95, opacity: 0, x: '-50%', y: '-50%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            style={isMobile ? {} : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', position: 'fixed' }}
            className={cn(
              "fixed z-50 bg-[#F6FAFF] dark:bg-[#1C262E] flex flex-col shadow-2xl transition-all overflow-hidden",
              isMobile 
                ? "inset-x-0 bottom-0 rounded-t-[2rem] max-w-md mx-auto h-[93vh]" 
                : "w-full max-w-[440px] max-h-[90vh] rounded-[2rem] border border-transparent dark:border-gray-800"
            )}
          >
            {/* iOS Mini Drag Handle */}
            <div className={cn("w-8 h-1 bg-[#BDCAB9] dark:bg-gray-700 rounded-full mx-auto my-3 flex-shrink-0", !isMobile && "hidden")} />

            {/* Header Title & Close */}
            <div className="flex justify-between items-center px-6 pt-1 pb-3 flex-shrink-0" style={{ marginTop: '15px' }}>
              <h2 className="text-[20px] font-bold text-gray-900 dark:text-gray-100 tracking-tight">Adicionar</h2>
              <button 
                onClick={onClose} 
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 dark:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Value Display Area matching 'Value Display Area' from mockup */}
            <div className="px-6 py-8 flex flex-col items-center justify-center bg-[#F6FAFF] dark:bg-[#1C262E] border-b border-gray-100 dark:border-gray-800 flex-shrink-0 transition-colors">
              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold tracking-wider uppercase mb-2">
                VALOR DA {type === 'SAIDA' ? 'SAÍDA' : type === 'ENTRADA' ? 'ENTRADA' : type === 'DIARIO' ? 'DIÁRIO' : type === 'CARTAO' ? 'FATURA CARTÃO' : 'ECONOMIA'}
              </span>
              <div className="flex items-baseline text-gray-950 dark:text-gray-100 font-sans">
                <span className="text-xl font-bold mr-1 text-gray-600 dark:text-gray-400">R$</span>
                <span className="text-[40px] font-bold tracking-tight leading-none">
                  {displayAmount}
                </span>
                {/* Blinking cursor effect */}
                <span className="inline-block w-[2px] h-[32px] bg-[#FF5722] animate-pulse ml-1 align-middle" />
              </div>
            </div>

            {/* Form Fields Area (Scrollable Layer) */}
            <div className="flex-grow bg-white dark:bg-[#141D23] px-6 pt-5 pb-4 space-y-5 overflow-y-auto no-scrollbar transition-colors">
              
              {/* Type Toggle/Indicator */}
              <div 
                onClick={() => {
                  // Cycle types for premium interaction style
                  const types: TransactionType[] = ['SAIDA', 'ENTRADA', 'DIARIO', 'CARTAO', 'ECONOMIA'];
                  const nextIdx = (types.indexOf(type) + 1) % types.length;
                  setType(types[nextIdx]);
                }}
                className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800/60 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 cursor-pointer rounded-lg px-2 transition-colors -mx-2"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0",
                  type === 'SAIDA' ? 'bg-[#ffdad9] text-[#b6152e] dark:bg-[#7a0016] dark:text-[#ffdad9]' : 
                  type === 'ENTRADA' ? 'bg-[#dcfce7] text-[#006e25] dark:bg-[#004d18] dark:text-[#dcfce7]' :
                  type === 'DIARIO' ? 'bg-[#FAD1DB] text-[#C4245A] dark:bg-[#86123a] dark:text-[#FAD1DB]' :
                  type === 'CARTAO' ? 'bg-[#d8e2ff] text-[#005bc0] dark:bg-[#003e87] dark:text-[#d8e2ff]' : 'bg-[#e6eff8] text-[#00295d] dark:bg-[#001d45] dark:text-[#e6eff8]'
                )}>
                  {type === 'SAIDA' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="rotate-180"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>}
                  {type === 'ENTRADA' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>}
                  {type === 'DIARIO' && <span className="font-extrabold text-[12px] italic">D</span>}
                  {type === 'CARTAO' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>}
                  {type === 'ECONOMIA' && <span className="font-extrabold text-[12px]">E</span>}
                </div>
                <div className="flex-grow">
                  <p className="text-sm text-gray-400 dark:text-gray-500 font-medium leading-none mb-1">Categoria</p>
                  <p className="font-bold text-[16px] text-gray-900 dark:text-gray-100 leading-tight">
                    {type === 'SAIDA' ? 'Saída' : type === 'ENTRADA' ? 'Entrada' : type === 'DIARIO' ? 'Diário' : type === 'CARTAO' ? 'Cartão de Crédito' : 'Economia'}
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-transparent border-none p-0 text-[16px] font-semibold text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0" 
                  />
                </div>
              </div>

              {/* Date Selector representing native feel */}
              <div className="flex items-center gap-4 py-3 border-b border-[#F0F0F0] dark:border-gray-800/60 relative">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 dark:text-gray-500 flex-shrink-0"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                <div className="flex-grow">
                  <CustomDatePicker 
                    value={selectedDate}
                    onChange={(dateStr) => setSelectedDate(dateStr)}
                  />
                </div>
                {selectedDate === getLocalTodayString() && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-bold bg-gray-50 dark:bg-gray-800/60 px-2.5 py-1 rounded-sm">HOJE</span>
                )}
              </div>

              {/* Recurrence Selection - Hidden for DIARIO and CARTAO */}
              {type !== 'DIARIO' && type !== 'CARTAO' && (
                <div className="border-b border-[#F0F0F0] dark:border-gray-800/60 py-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 dark:text-gray-500 flex-shrink-0"><path d="M17 2.11a1 1 0 0 0-1.28.16l-3.32 3.32a1 1 0 0 0 0 1.41l3.32 3.32a1 1 0 0 0 1.28.16"/><path d="M3 12a9 9 0 0 1 15-6.7L18 6"/><path d="M7 21.89a1 1 0 0 0 1.28-.16l3.32-3.32a1 1 0 0 0 0-1.41l-3.32-3.32a1 1 0 0 0-1.28-.16"/><path d="M21 12a9 9 0 0 1-15 6.7L6 18"/></svg>
                      <span className="text-[16px] font-semibold text-gray-950 dark:text-gray-100">Repetir mensalmente</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRecurring(!isRecurring);
                        if (!isRecurring) {
                          setRepeatMonths(2);
                        } else {
                          setRepeatMonths(1);
                        }
                      }}
                      className={cn(
                        "w-11 h-6 rounded-full p-1 transition-colors duration-200 outline-none",
                        isRecurring ? "bg-[#FF5722]" : "bg-gray-200 dark:bg-gray-700"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                        isRecurring ? "translate-x-5" : "translate-x-0"
                      )} />
                    </button>
                  </div>
                  
                  {isRecurring && (
                    <div className="pl-9 flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Repetir por:</span>
                      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-gray-50 dark:bg-gray-800/50 min-w-[125px]">
                        <input 
                          type="number"
                          min="2"
                          max="120"
                          value={repeatMonths}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setRepeatMonths(isNaN(val) ? 2 : val);
                          }}
                          className="w-12 text-center font-bold text-gray-900 dark:text-gray-100 border-none bg-transparent p-0 focus:outline-none focus:ring-0 mr-1 text-sm"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-extrabold">meses</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                    const isSelected = selectedTags.includes(tag.name);
                    return (
                      <button
                        key={tag.name}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTags(selectedTags.filter(t => t !== tag.name));
                          } else {
                            setSelectedTags([...selectedTags, tag.name]);
                          }
                        }}
                        className={cn(
                          "text-xs font-bold px-2.5 py-1 rounded-full transition-all border flex items-center gap-1",
                          isSelected 
                            ? "bg-[#FF5722] border-[#FF5722] text-white" 
                            : "bg-[#F8FAFC] dark:bg-[#1C262E] border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                        )}
                      >
                        <span>{tag.icon || '🏷️'}</span>
                        <span>{tag.name}</span>
                      </button>
                    );
                  })}
                  {selectedTags.map((tag) => {
                    if (customTags.some((ct) => ct.name === tag)) return null;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                        className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FF5722] border-[#FF5722] text-white transition-all border"
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
                            if (!selectedTags.includes(val)) {
                              setSelectedTags([...selectedTags, val]);
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
                      className="w-full bg-transparent border-none text-xs font-semibold text-gray-800 dark:text-gray-200 focus:ring-0 py-1 px-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = newTagText.trim();
                        if (val) {
                          if (!selectedTags.includes(val)) {
                            setSelectedTags([...selectedTags, val]);
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
                      className="text-white bg-[#FF5722] hover:bg-[#eb4b18] text-xs font-bold px-3 py-1.5 rounded-md transition-colors"
                    >
                      Ok
                    </button>
                  </div>
                )}
              </div>

              {/* Confirmation Action Button styled perfectly */}
              <div className="pt-4 pb-2">
                <button 
                  onClick={handleAdd}
                  className={cn(
                    "w-full py-4 rounded-xl font-extrabold text-[18px] shadow-sm transition-all active:scale-[0.98] outline-none",
                    type === 'SAIDA' ? 'bg-[#b6152e] hover:bg-[#92001f] dark:bg-[#e02641] dark:hover:bg-[#a6132a] text-white' :
                    type === 'ENTRADA' ? 'bg-[#006e25] hover:bg-[#00531a] dark:bg-[#00a838] dark:hover:bg-[#007b29] text-white' :
                    type === 'DIARIO' ? 'bg-[#9c27b0] hover:bg-[#7b1fa2] dark:bg-[#c740dd] dark:hover:bg-[#a52ab9] text-white' :
                    type === 'CARTAO' ? 'bg-[#005bc0] hover:bg-[#004493] dark:bg-[#1a7bed] dark:hover:bg-[#0a66d0] text-white' : 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white'
                  )}
                >
                  Adicionar {type === 'SAIDA' ? 'saída' : type === 'ENTRADA' ? 'entrada' : type === 'DIARIO' ? 'diário' : type === 'CARTAO' ? 'cartão' : 'economia'}
                </button>
              </div>
            </div>

            {/* Custom Numeric Keypad Layer */}
            <div className="bg-[#F8FAFC] dark:bg-[#1C262E] border-t border-gray-100 dark:border-gray-800 p-4 pb-6 flex-shrink-0 transition-colors">
              <div className="grid grid-cols-3 gap-1.5 max-w-sm mx-auto">
                {['1','2','3','4','5','6','7','8','9','','0','backspace'].map((key, i) => {
                  if (key === '') {
                    return <div key={`empty-${i}`} className="h-12 w-full" />
                  }
                  
                  return (
                    <button 
                      key={key}
                      onClick={() => handleNumpadClick(key)}
                      className="flex flex-col items-center justify-center bg-white dark:bg-[#141D23] hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 h-12 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all text-gray-900 dark:text-gray-100"
                    >
                      {key === 'backspace' ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-700 dark:text-gray-300"><path d="m11 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                      ) : (
                        <>
                          <span className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-none">{key}</span>
                          {['2','3','4','5','6','7','8','9'].includes(key) && (
                            <span className="text-[8px] uppercase tracking-wider text-gray-400 dark:text-gray-600 font-extrabold mt-0.5">
                              {key === '2' ? 'abc' : key === '3' ? 'def' : key === '4' ? 'ghi' : key === '5' ? 'jkl' : key === '6' ? 'mno' : key === '7' ? 'pqrs' : key === '8' ? 'tuv' : 'wxyz'}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


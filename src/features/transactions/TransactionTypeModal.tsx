import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { TransactionType } from '../../types';
import { cn } from '../../lib/utils';

export function TransactionTypeModal({ 
  isOpen, 
  onClose,
  onSelect
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSelect: (type: TransactionType) => void;
}) {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const types = [
    { 
      type: 'ENTRADA', 
      label: 'Entrada', 
      desc: 'Salário, comissão, vales', 
      color: 'bg-[#006e25] text-white', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg> 
    },
    { 
      type: 'SAIDA', 
      label: 'Saída', 
      desc: 'Gastos fixos, boletos, aluguel', 
      color: 'bg-[#b6152e] text-white', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white"><path d="M17 7 7 17"/><path d="M17 17H7V7"/></svg> 
    },
    { 
      type: 'DIARIO', 
      label: 'Diário', 
      desc: 'Gastos variáveis, compras', 
      color: 'bg-[#9c27b0] text-white', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> 
    },
    { 
      type: 'CARTAO', 
      label: 'Gasto com cartão', 
      desc: 'Gastos ou total da fatura', 
      color: 'bg-[#005bc0] text-white', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg> 
    },
    { 
      type: 'ECONOMIA', 
      label: 'Economia', 
      desc: 'Reserva de emergência, investimentos', 
      color: 'bg-[#006e25]/80 text-white', 
      icon: <span className="font-extrabold text-[13px] text-white">E</span> 
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#141D23]/40 backdrop-blur-[4px] z-50" 
            onClick={onClose} 
          />
          <motion.div 
            initial={isMobile ? { y: '100%', x: 0 } : { scale: 0.95, opacity: 0, x: '-50%', y: '-50%' }} 
            animate={isMobile ? { y: 0, x: 0 } : { scale: 1, opacity: 1, x: '-50%', y: '-50%' }} 
            exit={isMobile ? { y: '100%', x: 0 } : { scale: 0.95, opacity: 0, x: '-50%', y: '-50%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            style={isMobile ? {} : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', position: 'fixed' }}
            className={cn(
              "fixed z-50 bg-[#F6FAFF] dark:bg-[#1C262E] shadow-2xl overflow-hidden p-6 transition-colors",
              isMobile 
                ? "inset-x-0 bottom-0 rounded-t-2xl max-w-md mx-auto" 
                : "w-full max-w-md rounded-2xl border border-transparent dark:border-gray-800"
            )}
          >
            {/* iOS style drag handle */}
            <div className="w-8 h-1 bg-[#BDCAB9] dark:bg-gray-700 rounded-sm mx-auto mb-2 sm:hidden" />

            <div className="flex justify-between items-center mb-6" style={{ marginTop: '15px' }}>
              <h2 className="text-[20px] font-bold text-gray-900 dark:text-gray-100 tracking-tight">Adicionar</h2>
              <button 
                onClick={onClose} 
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 dark:text-gray-500"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
              </button>
            </div>

            {/* Entry Options List */}
            <nav className="space-y-4">
              {types.map((t) => (
                <button 
                  key={t.type} 
                  onClick={() => onSelect(t.type as TransactionType)} 
                  className="w-full text-left group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-[#141D23] hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform ${t.color}`}>
                    {t.icon}
                  </div>
                  <div>
                    <p className="font-bold text-[16px] text-gray-900 dark:text-gray-100 leading-tight mb-1">{t.label}</p>
                    <p className="text-[13px] text-gray-400 dark:text-gray-500 font-medium leading-none">{t.desc}</p>
                  </div>
                </button>
              ))}
            </nav>

            <div className="mt-8 mb-2">
              <p className="text-center text-[11px] font-extrabold tracking-wider uppercase text-gray-400 dark:text-gray-500">
                Selecione uma categoria para prosseguir
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

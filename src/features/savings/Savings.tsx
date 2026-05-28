import React, { useMemo, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronDown, ArrowDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useTransactions } from '../../context/TransactionContext';
import { calculateSavingsMetrics } from '../../lib/financeLogic';
import { motion, AnimatePresence } from 'motion/react';

export function Savings() {
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear); // Starts automatically with the current year
  const [showExplainer, setShowExplainer] = useState(false);

  // Total no ano calculation based on transactions of specified year
  const yearMetrics = useMemo(() => {
    let _economia = 0;
    let _entradas = 0;
    
    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d.getFullYear() === year) {
        if (t.type === 'ECONOMIA') _economia += t.amount;
        if (t.type === 'ENTRADA') _entradas += t.amount;
      }
    });

    const percent = _entradas > 0 ? (_economia / _entradas) * 100 : 0;
    return { economia: _economia, entradas: _entradas, percent };
  }, [transactions, year]);

  // Per month calculation
  const monthsData = useMemo(() => {
    const data = [];
    const ptMonths = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    for (let m = 0; m < 12; m++) {
       const date = new Date(year, m, 1);
       const metrics = calculateSavingsMetrics(transactions, date);
       data.push({
         name: ptMonths[m],
         ...metrics
       });
    }
    return data;
  }, [transactions, year]);

  return (
    <div className="flex flex-col min-h-full bg-white dark:bg-[#141D23] pb-24 text-gray-900 dark:text-gray-100 transition-colors">
      
      {/* Header aligned perfectly with clean layout */}
      <div className="flex items-center gap-3.5 px-5 pt-safe-header pb-4 bg-white dark:bg-[#141D23] sticky top-0 z-10 transition-colors">
        <button 
          onClick={() => navigate(-1)} 
          className="p-1 -ml-1 text-[#46536A] dark:text-[#A5B4FC] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-[22px] h-[22px]" strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-extrabold text-[#111827] dark:text-white tracking-tight">
          Economizado
        </h1>
      </div>

      <div className="px-5 pt-3 space-y-6">
        
        {/* Year Selector matching exactly the thin gray bordered pill in the image */}
        <div className="flex items-center justify-between bg-[#F8FAFC] dark:bg-gray-800/60 px-4 py-2.5 rounded-2xl border border-gray-200/80 dark:border-gray-800/85 shadow-sm transition-colors">
          <button 
            type="button" 
            onClick={() => setYear(y => y - 1)}
            className="p-1 hover:bg-gray-200/50 dark:hover:bg-gray-700/60 rounded-lg text-gray-400 dark:text-gray-500 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <span className="font-extrabold text-gray-900 dark:text-white text-base tracking-wide">
            {year}
          </span>
          <button 
            type="button" 
            onClick={() => setYear(y => y + 1)}
            className="p-1 hover:bg-gray-200/50 dark:hover:bg-gray-700/60 rounded-lg text-gray-400 dark:text-gray-500 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Accordion dropdown without container card - flat styling matching the image */}
        <div className="border-b border-gray-100 dark:border-gray-800/60 pb-3">
          <button 
            type="button"
            onClick={() => setShowExplainer(!showExplainer)}
            className="w-full flex items-center justify-between text-left py-1 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none cursor-pointer"
          >
            <span className="text-[13px] font-bold tracking-tight text-gray-600 dark:text-gray-300">Como funciona o economizado?</span>
            <ChevronDown 
              className={cn(
                "w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200", 
                showExplainer ? "transform rotate-180" : ""
              )} 
            />
          </button>
          
          <AnimatePresence initial={false}>
            {showExplainer && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="text-xs text-gray-400 dark:text-gray-500 pt-2 pb-1 leading-relaxed">
                  O percentual economizado representa a fatia de suas receitas (entradas) que foram salvas como economias. Ele indica o quanto do seu faturamento em reais você guardou em vez de gastar no período selecionado.<br /><br />
                  Fórmula de Cálculo: <strong>(Economias / Entradas) × 100</strong>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Yearly Summary (Directly laid out without Card container for a professional, flat look) */}
        <div className="pt-2 space-y-4">
          <div>
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
              Total no ano
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-950 dark:text-white leading-none mt-1">
              {Math.round(yearMetrics.percent)}%
            </h2>
          </div>

          {/* Symmetrical Flex Progress Bar */}
          <div className="flex items-center gap-2.5 w-full py-1">
            {/* Left green outline sticker */}
            <div className="w-5 h-5 rounded-full border border-[#82C341] bg-[#82C341]/5 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-extrabold text-[#70aa33] dark:text-[#82C341]">E</span>
            </div>
            
            {/* Main Progress Slide */}
            <div className="h-[9px] flex-1 bg-gray-100/80 dark:bg-gray-800 rounded-full border border-gray-200/50 dark:border-gray-700/60 relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-[#82C341] rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(yearMetrics.percent, 100)}%` }}
              />
            </div>

            {/* Right green outline sticker */}
            <div className="w-5 h-5 rounded-full border border-[#82C341] bg-[#82C341]/5 flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-3 h-3 text-[#70aa33] dark:text-[#82C341]" strokeWidth={3.5} />
            </div>
          </div>

          {/* Symmetrical Value Tags Row */}
          <div className="flex justify-between items-center pt-0.5 pb-6 border-b border-gray-100 dark:border-gray-800/60">
            <div>
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500 block">Economias</span>
              <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                {yearMetrics.economia.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500 block">Entradas</span>
              <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                {yearMetrics.entradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        </div>

        {/* Section Title: Total por Mês */}
        <div className="space-y-4">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
            Total por mês
          </span>

          <div className="space-y-6">
            {monthsData.map((m, idx) => {
              const currentMonthIndex = new Date().getMonth();
              // Show month if transactions exist or is past/current month
              const shouldShow = m.totalEntradas > 0 || m.totalEconomizado > 0 || idx <= currentMonthIndex;
              if (!shouldShow) return null;

              return (
                <div key={m.name} className="space-y-3 pt-1">
                  
                  {/* Month header info */}
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-bold text-gray-950 dark:text-white tracking-tight">
                      {m.name}
                    </span>
                    <span className="text-sm font-bold text-gray-950 dark:text-white">
                      {Math.round(m.percentage)}%
                    </span>
                  </div>

                  {/* Monthly symmetrical Progress Bar */}
                  <div className="flex items-center gap-2.5 w-full">
                    {/* Left green outline marker */}
                    <div className="w-5 h-5 rounded-full border border-[#82C341] bg-[#82C341]/5 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-extrabold text-[#70aa33] dark:text-[#82C341]">E</span>
                    </div>

                    {/* Progress slider track */}
                    <div className="h-[9px] flex-1 bg-gray-100/80 dark:bg-gray-800 rounded-full border border-gray-200/50 dark:border-gray-700/60 relative overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-[#82C341] rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(m.percentage, 100)}%` }}
                      />
                    </div>

                    {/* Right green outline marker */}
                    <div className="w-5 h-5 rounded-full border border-[#82C341] bg-[#82C341]/5 flex items-center justify-center shrink-0">
                      <ArrowDownLeft className="w-3 h-3 text-[#70aa33] dark:text-[#82C341]" strokeWidth={3.5} />
                    </div>
                  </div>

                  {/* Monthly values tag metrics */}
                  <div className="flex justify-between items-center pt-0.5">
                    <div>
                      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 block">Economias</span>
                      <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                        {m.totalEconomizado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 block">Entradas</span>
                      <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                        {m.totalEntradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

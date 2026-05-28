import React, { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrencyShort, getHorizonCellColor } from '../../lib/financeLogic';
import { generateBalanceHorizon } from '../../lib/financeCalculations';
import { format, getDate, addMonths, startOfMonth, startOfDay, getYear, getMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Horizon() {
  const navigate = useNavigate();
  const { transactions, currentBalance } = useTransactions();

  const today = startOfDay(new Date());

  // Projeta para os próximos 365 dias (1 ano completo) para permitir ver todos os meses do ano
  const projections = useMemo(() => {
    return generateBalanceHorizon(transactions, currentBalance, today, 365);
  }, [transactions, currentBalance, today]);

  // Identificar os 12 meses do ano para exibir
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => startOfMonth(addMonths(today, i)));
  }, [today]);

  const daysInMaxMonth = 31;
  const rows = Array.from({ length: daysInMaxMonth }, (_, i) => i + 1);

  // Auxiliares para buscar a projeção dado o mês e o dia
  const getProjectionFor = (monthDate: Date, day: number) => {
    const targetDateStr = `${getYear(monthDate)}-${String(getMonth(monthDate) + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return projections.find(p => {
       const pStr = `${getYear(p.data)}-${String(getMonth(p.data) + 1).padStart(2, '0')}-${String(getDate(p.data)).padStart(2, '0')}`;
       return pStr === targetDateStr;
    });
  };

  const currentDay = getDate(today);

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-[#141D23] relative transition-colors text-gray-900 dark:text-gray-100">
       {/* Header */}
       <div className="flex items-center justify-between px-5 pt-12 pb-4 bg-white dark:bg-[#141D23] sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800/80 font-sans transition-colors">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-800 dark:text-gray-200">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-[20px] font-bold text-gray-900 dark:text-gray-100 tracking-tight">Horizonte de saldos</h1>
          <div className="w-8" /> {/* Centering spacer */}
       </div>

       {/* Heatmap Columns Side-by-Side scrolling both vertically and horizontally */}
       <div className="flex-1 w-full overflow-auto no-scrollbar scroll-smooth snap-x snap-mandatory">
          <div className="flex w-full min-h-full">
             {months.map((m, idx) => (
                <section 
                   key={idx} 
                   className={cn(
                     "flex flex-col w-1/3 md:w-[150px] lg:flex-1 flex-shrink-0 select-none border-r border-[#F1F5F9] dark:border-gray-800/80 last:border-r-0 snap-start transition-colors"
                   )}
                >
                   {/* Sticky Months Headers inside columns for synchronized scroll */}
                   <div 
                     className={cn(
                       "py-3 text-center font-bold text-xs sm:text-sm leading-tight transition-colors font-sans border-b border-gray-200 dark:border-gray-800/80 sticky top-0 z-10 select-none", 
                       idx === 0 
                         ? "bg-[#1A1A1A] dark:bg-[#0A0A0A] text-white" 
                         : "bg-white dark:bg-[#141D23] text-gray-900 dark:text-gray-100"
                     )}
                   >
                     {format(m, 'MMM/yy', { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase())}
                   </div>

                   {/* Days list under each month column */}
                   <div className="flex flex-col">
                      {rows.map((day) => {
                        const proj = getProjectionFor(m, day);
                        const isToday = idx === 0 && day === currentDay;

                        let cellBg = "bg-white dark:bg-[#141D23]";
                        // Se isFuro (saldo_projetado < 0), a UI pintará a célula de vermelho
                        if (proj) {
                          if (proj.isFuro) {
                            cellBg = "bg-red-100 dark:bg-red-950/40 text-red-650 dark:text-red-400 border-t border-b border-red-200 dark:border-red-900/50";
                          } else {
                            cellBg = getHorizonCellColor(proj.saldo_projetado);
                          }
                        }

                        return (
                          <div 
                            key={day} 
                            className="flex items-center h-[44px] border-b border-[#F1F5F9] dark:border-gray-800/80 text-sm font-sans transition-colors"
                          >
                            {/* Day portion */}
                            <div className={cn(
                              "w-[35px] h-full flex items-center justify-center font-semibold text-gray-500 dark:text-gray-400 text-[13px] border-r border-[#F1F5F9]/70 dark:border-gray-800/80 font-sans flex-shrink-0 transition-colors",
                              isToday ? "bg-[#1A1A1A] dark:bg-[#0A0A0A] text-white rounded-none" : "bg-white dark:bg-[#141D23]"
                            )}>
                              {day}
                            </div>

                            {/* Value projected */}
                            <div className={cn(
                              "flex-grow h-full flex items-center justify-center font-bold text-[12px] sm:text-[13px] tracking-tight px-1 text-center transition-colors",
                              proj ? cellBg : "bg-gray-50/50 dark:bg-[#1C262E]/50 text-transparent select-none"
                            )}>
                              {proj ? formatCurrencyShort(proj.saldo_projetado) : "-"}
                            </div>
                          </div>
                        );
                      })}
                   </div>
                </section>
             ))}
          </div>
       </div>
    </div>
  );
}

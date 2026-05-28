import React, { useMemo } from 'react';
import { Check, AlertCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { MainHeader } from '../../components/layout/MainHeader';
import { useTransactions } from '../../context/TransactionContext';
import { getHorizonCellColor } from '../../lib/financeLogic';
import { 
  generateBalanceHorizon, 
  generateDailyControl, 
  DAILY_LIMIT 
} from '../../lib/financeCalculations';
import { startOfMonth, isSameDay, startOfDay, parseISO } from 'date-fns';

export function Daily() {
  const navigate = useNavigate();
  const { transactions, currentBalance, selectedDate } = useTransactions();

  const realToday = startOfDay(new Date());

  // Projeção do Horizonte de Saldos (Heatmap de Meses) aplicada para o mês selecionado (32 dias para cobrir todo o mês com folga)
  const projections = useMemo(() => {
    return generateBalanceHorizon(transactions, currentBalance, startOfMonth(selectedDate), 32);
  }, [transactions, currentBalance, selectedDate]);

  // Algoritmo do Controle Diário (Horizonte de Diários)
  const dailyControl = useMemo(() => {
    return generateDailyControl(transactions, selectedDate, DAILY_LIMIT);
  }, [transactions, selectedDate]);

  const daysData = useMemo(() => {
    return dailyControl.map(d => {
      const isToday = isSameDay(d.date, realToday);
      const projection = projections.find(p => isSameDay(p.data, d.date));
      
      const dayTransactions = transactions.filter(t => isSameDay(parseISO(t.date), d.date));
      const totalEntradas = dayTransactions
        .filter(t => t.type === 'ENTRADA')
        .reduce((acc, t) => acc + t.amount, 0);
      const totalSaidas = dayTransactions
        .filter(t => t.type !== 'ENTRADA')
        .reduce((acc, t) => acc + t.amount, 0);
      const netResult = totalEntradas - totalSaidas;
      const hasTransactions = dayTransactions.length > 0;

      return {
        day: d.day,
        date: d.date,
        isToday,
        totalEntradas,
        totalSaidas,
        netResult,
        hasTransactions,
        saldo: projection ? projection.saldo_projetado : null
      };
    });
  }, [dailyControl, realToday, projections, transactions]);

  return (
    <div className="flex flex-col min-h-full bg-white dark:bg-[#141D23] pb-0 relative overflow-visible lg:overflow-hidden lg:rounded-[25px] lg:border lg:border-gray-100 lg:dark:border-gray-800/60 lg:shadow-md text-gray-900 dark:text-gray-100 transition-colors">
       <MainHeader />

       {/* Header Row */}
       <div className="grid grid-cols-[48px_1fr_130px] border-b border-gray-100 dark:border-gray-800/60 py-4 sticky top-[80px] bg-white dark:bg-[#141D23] w-full z-10 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-colors">
          <div className="flex items-center justify-center">
             <span className="text-[14px] font-semibold text-gray-500 dark:text-gray-400">Dia</span>
          </div>
          
          <div className="flex items-center pl-2">
             <button 
                onClick={() => navigate(`/dia/${realToday.getDate()}`)}
                className="flex items-center gap-1.5 bg-white dark:bg-[#1C262E] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#25323D] active:bg-gray-100 rounded-full py-1 px-3.5 transition-colors cursor-pointer shadow-sm text-gray-800 dark:text-gray-200"
             >
                <div className="w-[18px] h-[18px] rounded-full bg-[#E91E63] text-white flex items-center justify-center text-[11px] font-black italic select-none">D</div>
                <span className="text-[14px] font-bold tracking-tight">Diário</span>
             </button>
          </div>
          
          <div className="flex items-center justify-end pr-5">
             <span className="text-[14px] font-semibold text-gray-400 dark:text-gray-500">Saldos</span>
          </div>
       </div>

       {/* List Rows */}
       <div className="flex flex-col w-full bg-white dark:bg-[#141D23] transition-colors pb-32">
          {daysData.map((d) => (
              <div 
                 key={d.day} 
                 onClick={() => navigate(`/dia/${d.day}`)}
                 className="grid grid-cols-[48px_1fr_130px] border-b border-gray-50 dark:border-gray-800/40 items-stretch bg-white dark:bg-[#141D23] relative cursor-pointer active:opacity-70 transition-colors"
              >
                {/* Dia */}
                <div className={cn(
                   "relative flex items-center justify-center text-[15px] transition-colors font-medium border-r border-gray-50 dark:border-gray-800/40",
                   d.isToday ? "bg-[#1A1A1A] text-white dark:bg-white dark:text-gray-950" : "text-gray-900 dark:text-gray-100"
                )}>
                  {d.day}
                </div>
                
                {/* Diários Col */}
                <div className="flex items-center justify-between px-3 py-3 border-r border-gray-50 dark:border-gray-800/40">
                   <div className="flex items-center gap-3">
                      {d.netResult === 0 ? (
                         <div className="w-[22px] h-[22px] rounded-full bg-[#E91E63]/25 text-white/80 dark:bg-[#E91E63]/20 dark:text-[#E91E63] flex items-center justify-center text-[11px] font-black italic select-none">
                            D
                         </div>
                      ) : d.netResult > 0 ? (
                         <div className="w-[22px] h-[22px] rounded-full bg-[#006e25] text-white flex items-center justify-center select-none flex-shrink-0">
                            <ArrowUpRight className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                         </div>
                      ) : (
                         <div className="w-[22px] h-[22px] rounded-full bg-[#b6152e] text-white flex items-center justify-center select-none flex-shrink-0">
                            <ArrowDownLeft className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                         </div>
                      )}
                      <span className={cn(
                         "text-[16px] font-bold tracking-tight select-none",
                         !d.hasTransactions 
                           ? "text-gray-300 dark:text-gray-600 font-semibold"
                           : "text-gray-900 dark:text-gray-100"
                      )}>
                        R$ {Math.abs(d.netResult).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </span>
                   </div>

                </div>
                
                {/* Saldos Col */}
                <div className={cn(
                  "flex items-center justify-end pr-4 text-[15px] font-bold tracking-tight border-b dark:border-gray-800/40 transition-colors",
                  d.saldo !== null ? getHorizonCellColor(d.saldo) : "bg-gray-50 dark:bg-[#1C262E] text-gray-400 dark:text-gray-500 border-t border-b border-gray-50 dark:border-gray-800/40"
                )}>
                  {d.saldo !== null ? `R$ ${d.saldo.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '-'}
                </div>
              </div>
          ))}
       </div>
    </div>
  );
}

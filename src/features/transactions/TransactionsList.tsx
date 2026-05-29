import React from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, ArrowDownUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn, getTagStyle } from '../../lib/utils';
import { CATEGORY_COLORS } from '../../types';
import { useTransactions } from '../../context/TransactionContext';
import { useFinanceStore } from '../../store/useFinanceStore';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronDown } from 'lucide-react';

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v).trim();
}

export function TransactionsList() {
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const customTags = useFinanceStore((state) => state.customTags);

  return (
    <div className="flex flex-col min-h-full bg-[#f6f9fc] dark:bg-[#141D23] pb-12 transition-colors text-gray-900 dark:text-gray-100">
       {/* Header */}
       <div className="flex items-center justify-between px-5 pt-safe-header pb-4 bg-[#f6f9fc] dark:bg-[#141D23] sticky top-0 z-20 transition-colors">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-[#46536A] dark:text-[#A5B4FC]"><ArrowLeft className="w-[22px] h-[22px]" strokeWidth={2} /></button>
          
          <div className="flex items-center gap-4">
             <ChevronLeft className="w-5 h-5 text-gray-500" strokeWidth={2} />
             <h1 className="text-[20px] font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Todas</h1>
             <ChevronRight className="w-5 h-5 text-gray-500" strokeWidth={2} />
          </div>

          <button className="p-1 -mr-1 text-[#46536A] dark:text-[#A5B4FC]"><Plus className="w-[24px] h-[24px]" strokeWidth={2.5} /></button>
       </div>

       {/* Dropdown bar */}
       <div className="px-5 pt-2 pb-6">
          <div className="flex items-center justify-between bg-white dark:bg-[#1C262E] px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-none cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
             <div className="flex items-center gap-2">
                <ArrowDownUp className="w-4 h-4 text-gray-400 dark:text-gray-500" strokeWidth={2.5} />
                <span className="text-[15px] font-semibold text-gray-700 dark:text-gray-300 tracking-tight">Filtrar</span>
             </div>
             <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" strokeWidth={2.5} />
          </div>
       </div>

       {/* List */}
       <div className="px-5 space-y-[1px]">
          {transactions.map((t) => {
             const color = CATEGORY_COLORS[t.type];
             // Set icon specifics
             let iconContent = null;
             if (t.type === 'ECONOMIA') iconContent = <span className="font-bold text-[10px]">E</span>;
             else if (t.type === 'ENTRADA') iconContent = <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className="lucide lucide-arrow-down-left"><path d="M17 7 7 17"/><path d="M17 17H7V7"/></svg>;
             else if (t.type === 'SAIDA') iconContent = <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className="lucide lucide-arrow-up-right"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>;
             else if (t.type === 'CARTAO') iconContent = <span className="font-bold text-[10px]">C</span>;
             else if (t.type === 'DIARIO') iconContent = <span className="font-bold text-[10px]">D</span>;

             const formattedDate = format(parseISO(t.date), 'dd/MM/yyyy');
             
             return (
               <div key={t.id} className="bg-[#f6f9fc] dark:bg-[#141D23] py-3 flex items-start justify-between border-b border-gray-200/50 dark:border-gray-800/80 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <div className="flex gap-3">
                     <div className="mt-0.5">
                        <div className={cn("w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-white", color.text.replace('text-', 'bg-').replace('600','500'))}>
                           {iconContent}
                        </div>
                     </div>
                     <div>
                        <p className="text-[16px] font-semibold text-gray-900 dark:text-gray-100 tracking-tight mb-0.5">{t.description}</p>
                        {t.tags && t.tags.length > 0 && (
                           <div className="flex flex-wrap gap-1 mb-1 mt-0.5">
                              {t.tags.map((tg, idx) => {
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
                        <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">{formattedDate}</p>
                     </div>
                  </div>
                  
                  <div className="text-right">
                     <p className="text-[16px] font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-0.5">R$ {formatCurrency(t.amount)}</p>
                     <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium capitalize">
                        {t.type.toLowerCase()}
                     </p>
                  </div>
               </div>
             )
          })}
       </div>
    </div>
  );
}

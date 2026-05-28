import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../../context/TransactionContext';
import { addMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function MainHeader() {
  const navigate = useNavigate();
  const { selectedDate, setSelectedDate } = useTransactions();

  const handlePrevMonth = () => {
    setSelectedDate(addMonths(selectedDate, -1));
  };

  const handleNextMonth = () => {
    setSelectedDate(addMonths(selectedDate, 1));
  };

  const monthText = format(selectedDate, "MMM/yy", { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase());
  const dayText = format(selectedDate, "d");

  return (
    <div 
      className="flex items-center justify-between px-5 pt-safe-header pb-4 bg-white dark:bg-[#141D23] sticky top-0 z-20 border-b border-gray-50 dark:border-gray-800/40 transition-colors"
      style={{ borderRadius: 0 }}
    >
      <div className="flex items-center gap-1 bg-white dark:bg-[#1C262E] border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl px-2 py-1.5 pt-1 flex-col select-none">
         <div className="w-4 h-1.5 border-t border-red-500 rounded-t-sm" />
         <span className="text-[13px] font-black text-gray-800 dark:text-gray-200 leading-none">{dayText}</span>
      </div>
      
      <div className="flex items-center gap-6 flex-1 justify-center">
         <button 
           onClick={handlePrevMonth}
           className="p-1 hover:bg-gray-100/80 dark:hover:bg-gray-800 active:bg-gray-200/50 rounded-full transition-colors"
           aria-label="Militar mês anterior"
         >
           <ChevronLeft className="w-5 h-5 text-gray-800 dark:text-gray-200" strokeWidth={2.5} />
         </button>
         <h1 className="text-[20px] font-bold text-gray-900 dark:text-gray-100 tracking-tight text-center min-w-[80px]">{monthText}</h1>
         <button 
           onClick={handleNextMonth}
           className="p-1 hover:bg-gray-100/80 dark:hover:bg-gray-800 active:bg-gray-200/50 rounded-full transition-colors"
           aria-label="Próximo mês"
         >
           <ChevronRight className="w-5 h-5 text-gray-800 dark:text-gray-200" strokeWidth={2.5} />
         </button>
      </div>
      
      <button 
        onClick={() => navigate('/horizonte')}
        className="w-[34px] h-[34px] bg-[#F3F6D4] dark:bg-[#F3F6D4]/95 opacity-90 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden"
      >
         <div className="grid grid-cols-2 grid-rows-2 gap-[2px] w-[20px] h-[20px]">
           <div className="rounded-[2px]" style={{ backgroundColor: '#F15A2B' }} />
           <div className="bg-[#A3E635] rounded-[2px]" />
           <div className="bg-[#A3E635] rounded-[2px]" />
           <div className="bg-[#FFE69C] rounded-[2px]" />
         </div>
      </button>
    </div>
  );
}

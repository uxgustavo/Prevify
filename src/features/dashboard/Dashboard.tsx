import React, { useMemo } from 'react';
import { cn } from '../../lib/utils';
import { MainHeader } from '../../components/layout/MainHeader';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../../context/TransactionContext';
import { calculateDashboardKPIs, DAILY_LIMIT } from '../../lib/financeCalculations';

export function Dashboard() {
  const navigate = useNavigate();
  const { transactions, selectedDate } = useTransactions();

  const kpis = useMemo(() => {
    return calculateDashboardKPIs(transactions, selectedDate);
  }, [transactions, selectedDate]);

  const MediaDiaria = kpis.diarioMedio;
  const mediaDiariaFormatada = Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(MediaDiaria);

  return (
    <div className="flex flex-col min-h-full bg-white dark:bg-[#141D23] pb-28 lg:pb-0 relative overflow-visible lg:overflow-hidden lg:rounded-[25px] lg:border lg:border-gray-100 lg:dark:border-gray-800/60 lg:shadow-md text-gray-900 dark:text-gray-100 transition-colors">
      <MainHeader />

      <div className="px-5 pt-6 space-y-8">
        
        {/* Cálculos do mês */}
        <div>
          <h2 className="text-[15px] font-semibold text-gray-400 dark:text-gray-500 mb-4 border-b border-gray-100 dark:border-gray-800/60 pb-3">Cálculos do mês</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:space-y-0 space-y-6">
            
            {/* Sobrou Dinheiro / Performance */}
            <div className="flex items-center justify-between lg:flex-col lg:items-stretch lg:bg-gray-50/50 lg:dark:bg-[#1C262E]/30 lg:border lg:border-gray-100 lg:dark:border-gray-800/60 lg:p-5 lg:rounded-2xl lg:shadow-xs lg:h-[135px] lg:justify-between">
              <div>
                 <p className="text-[16px] font-bold text-gray-900 dark:text-gray-100 mb-1">Sobrou Dinheiro</p>
                 <div className="flex items-center gap-1">
                   <div className="w-[18px] h-[18px] rounded-full bg-[#006e25] text-white flex items-center justify-center text-[10px] font-extrabold">
                     <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
                   </div>
                   <div className="w-[18px] h-[18px] rounded-full bg-[#b6152e] text-white flex items-center justify-center text-[10px] font-extrabold">
                     <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M17 7 7 17"/><path d="M17 17H7V7"/></svg>
                   </div>
                   <div className="w-[18px] h-[18px] rounded-full bg-[#9c27b0] text-white font-bold text-[10px] flex items-center justify-center">D</div>
                   <div className="w-[18px] h-[18px] rounded-full bg-[#006e25]/85 text-white font-extrabold text-[10px] flex items-center justify-center">E</div>
                   <div className="w-[18px] h-[18px] rounded-full bg-[#005bc0] text-white font-bold text-[10px] flex items-center justify-center">C</div>
                 </div>
              </div>
              <div className="text-right lg:text-left">
                 <p className={cn("text-[17px] font-bold", kpis.sobrouDinheiro >= 0 ? "text-emerald-650 dark:text-emerald-400" : "text-rose-650 dark:text-rose-450")}>
                   R$ {kpis.sobrouDinheiro.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                 </p>
                 <p className="text-[14px] text-gray-500 dark:text-gray-400 font-medium">
                   {kpis.sobrouDinheiro >= 0 ? "Projeção de sobra" : "Déficit projetado"}
                 </p>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-800/60 lg:hidden" />

            {/* Economizado */}
            <div 
               className="flex items-center justify-between cursor-pointer active:opacity-70 transition-opacity lg:flex-col lg:items-stretch lg:bg-gray-50/50 lg:dark:bg-[#1C262E]/30 lg:border lg:border-gray-100 lg:dark:border-gray-800/60 lg:p-5 lg:rounded-2xl lg:shadow-xs lg:h-[135px] lg:justify-between"
               onClick={() => navigate('/economizado')}
            >
              <div>
                 <p className="text-[16px] font-bold text-gray-900 dark:text-gray-100 mb-1">Economizado</p>
                 <div className="flex items-center gap-1.5 h-[18px] mt-1.5">
                    <div className="w-[18px] h-[18px] rounded-full bg-[#006e25]/85 text-white font-extrabold text-[10px] flex items-center justify-center flex-shrink-0">E</div>
                    <div className="w-[60px] h-[12px] rounded-full border-2 border-gray-200 dark:border-gray-700 p-[1px] relative overflow-hidden">
                       <div className="h-full bg-[#006e25] rounded-full absolute left-0" style={{ width: `${Math.min(kpis.economizadoPercent, 100)}%` }} />
                    </div>
                    <div className="w-[18px] h-[18px] rounded-full bg-[#006e25] text-white flex items-center justify-center flex-shrink-0">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
                    </div>
                 </div>
              </div>
              <div className="text-right lg:text-left">
                 <p className="text-[17px] font-semibold text-gray-900 dark:text-gray-100">{Math.round(kpis.economizadoPercent)}%</p>
                 <p className="text-[14px] text-gray-500 dark:text-gray-400 font-medium">
                   {kpis.economizadoPercent >= 20 ? "Dentro do ideal" : "Abaixo do ideal"}
                 </p>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-800/60 lg:hidden" />

            {/* Custo de vida */}
            <div className="flex items-center justify-between lg:flex-col lg:items-stretch lg:bg-gray-50/50 lg:dark:bg-[#1C262E]/30 lg:border lg:border-gray-100 lg:dark:border-gray-800/60 lg:p-5 lg:rounded-2xl lg:shadow-xs lg:h-[135px] lg:justify-between">
              <div>
                 <p className="text-[16px] font-bold text-gray-900 dark:text-gray-100 mb-1">Custo de vida</p>
                 <div className="flex items-center gap-1">
                    <div className="w-[18px] h-[18px] rounded-full bg-[#b6152e] text-white flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M17 7 7 17"/><path d="M17 17H7V7"/></svg>
                    </div>
                    <span className="text-gray-400 font-medium text-[10px]">+</span>
                    <div className="w-[18px] h-[18px] rounded-full bg-[#9c27b0] text-white font-bold text-[10px] flex items-center justify-center">D</div>
                    <span className="text-gray-400 font-medium text-[10px]">+</span>
                    <div className="w-[18px] h-[18px] rounded-full bg-[#005bc0] text-white font-bold text-[10px] flex items-center justify-center">C</div>
                 </div>
              </div>
              <div className="text-right lg:text-left">
                 <p className="text-[17px] font-bold text-gray-950 dark:text-gray-100">R$ {kpis.custoDeVida.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                 <span className={cn(
                   "text-[12px] font-bold px-2.5 py-0.5 rounded-full inline-block mt-1",
                   kpis.isDentroDaRenda ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-450"
                 )}>
                   {kpis.isDentroDaRenda ? "Dentro da renda" : "Sobrecarregado"}
                 </span>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-800/60 lg:hidden" />

            {/* Diário médio */}
            <div className="flex items-center justify-between lg:flex-col lg:items-stretch lg:bg-gray-50/50 lg:dark:bg-[#1C262E]/30 lg:border lg:border-gray-100 lg:dark:border-gray-800/60 lg:p-5 lg:rounded-2xl lg:shadow-xs lg:h-[135px] lg:justify-between">
              <div>
                 <p className="text-[16px] font-bold text-gray-900 dark:text-gray-100 mb-1">Diário médio</p>
                 <div className="flex items-center gap-1">
                    <div className="w-[18px] h-[18px] rounded-full bg-[#9c27b0] text-white font-bold text-[10px] flex items-center justify-center">D</div>
                  </div>
              </div>
              <div className="text-right lg:text-left">
                 <p className="text-[17px] font-bold text-gray-900 dark:text-gray-100">{mediaDiariaFormatada}</p>
                 <span className={cn(
                    "text-[12px] font-bold px-2.5 py-0.5 rounded-full inline-block mt-1",
                    MediaDiaria <= DAILY_LIMIT ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-450"
                 )}>
                   {MediaDiaria <= DAILY_LIMIT ? "No limite" : "Acima do limite"}
                 </span>
              </div>
            </div>

          </div>
        </div>

        {/* Movimentações do mês */}
        <div className="pt-2">
          <button 
            onClick={() => navigate('/transactions')}
            className="flex items-center justify-between w-full mb-4 border-b border-gray-100 dark:border-gray-800/60 pb-3"
          >
             <h2 className="text-[15px] font-semibold text-gray-400 dark:text-gray-500 text-left">Movimentações do mês</h2>
          </button>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-[20px] h-[20px] rounded-full bg-[#006e25] text-white flex items-center justify-center">
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
                   </div>
                   <span className="text-[16px] font-bold text-gray-900 dark:text-gray-100">Entradas</span>
                </div>
                <span className="text-[16px] font-semibold text-gray-950 dark:text-gray-100">R$ {kpis.totalEntradas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
            </div>

            <hr className="border-gray-100 dark:border-gray-800/60" />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-[20px] h-[20px] rounded-full bg-[#b6152e] text-white flex items-center justify-center">
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M17 7 7 17"/><path d="M17 17H7V7"/></svg>
                   </div>
                   <span className="text-[16px] font-bold text-gray-900 dark:text-gray-100">Saídas</span>
                </div>
                <span className="text-[16px] font-semibold text-gray-950 dark:text-gray-100">R$ {kpis.totalSaidas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

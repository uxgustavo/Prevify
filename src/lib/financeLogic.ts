import { addDays, isSameDay, startOfMonth, endOfMonth, isWithinInterval, startOfDay, parseISO, addMonths } from 'date-fns';
import { Transaction } from '../types';

export const DAILY_LIMIT = 50.0;

export function calculateDailyMetrics(transactions: Transaction[], date: Date) {
  const diarios = transactions.filter(
    (t) => t.type === 'DIARIO' && isSameDay(parseISO(t.date), date)
  );
  
  const totalDiario = diarios.reduce((acc, t) => acc + t.amount, 0);
  const isOk = totalDiario <= DAILY_LIMIT;

  return { total: totalDiario, isOk, limit: DAILY_LIMIT };
}

export function calculateSavingsMetrics(transactions: Transaction[], date: Date) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  const monthTransactions = transactions.filter(t => 
    isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd })
  );

  const totalEconomia = monthTransactions
    .filter(t => t.type === 'ECONOMIA')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalEntradas = monthTransactions
    .filter(t => t.type === 'ENTRADA')
    .reduce((acc, t) => acc + t.amount, 0);

  const percentage = totalEntradas > 0 ? (totalEconomia / totalEntradas) * 100 : 0;

  return { totalEconomizado: totalEconomia, totalEntradas, percentage };
}

export interface HorizonProjection {
  date: Date;
  saldoInicial: number;
  entradas: number;
  saidas: number;
  saldoFinal: number;
  isNegative: boolean;
}

export function calculateHorizonProjection(
  transactions: Transaction[],
  currentBalance: number,
  startDate: Date,
  daysToProject: number = 90
): HorizonProjection[] {
  const projections: HorizonProjection[] = [];
  
  let currentAccumulatedBalance = currentBalance;

  for (let i = 0; i < daysToProject; i++) {
    const projectionDate = startOfDay(addDays(startDate, i));
    
    const dailyTx = transactions.filter(t => isSameDay(parseISO(t.date), projectionDate));

    const entradas = dailyTx
      .filter(t => t.type === 'ENTRADA')
      .reduce((acc, t) => acc + t.amount, 0);

    const saidas = dailyTx
      .filter(t => t.type !== 'ENTRADA')
      .reduce((acc, t) => acc + t.amount, 0);

    const saldoInicial = currentAccumulatedBalance;
    const saldoFinal = saldoInicial + entradas - saidas;

    projections.push({
      date: projectionDate,
      saldoInicial,
      entradas,
      saidas,
      saldoFinal,
      isNegative: saldoFinal < 0,
    });

    currentAccumulatedBalance = saldoFinal;
  }

  return projections;
}

export function getHorizonCellColor(saldoFinal: number) {
  if (saldoFinal < -1000) return 'bg-[#F87171] dark:bg-red-900/60 text-gray-900 dark:text-red-100 border-t border-b border-red-300 dark:border-red-800/80';
  if (saldoFinal < -500) return 'bg-[#FCA5A5] dark:bg-red-900/40 text-gray-900 dark:text-red-100 border-red-200 dark:border-red-800/60 border-t border-b';
  if (saldoFinal < 0) return 'bg-[#FECACA] dark:bg-red-950/40 text-gray-900 dark:text-red-200 border-red-100 dark:border-red-900/50 border-t border-b';
  if (saldoFinal < 1000) return 'bg-[#FEF08A] dark:bg-yellow-900/30 text-gray-900 dark:text-yellow-100 border-t border-b border-yellow-200 dark:border-yellow-800/50';
  if (saldoFinal < 3000) return 'bg-[#BBF7D0] dark:bg-green-900/30 text-gray-900 dark:text-green-100 border-t border-b border-green-200 dark:border-green-800/50';
  if (saldoFinal < 8000) return 'bg-[#86EFAC] dark:bg-green-900/50 text-gray-900 dark:text-green-50 border-t border-b border-green-300 dark:border-green-700/60';
  return 'bg-[#4ADE80] dark:bg-green-800/60 text-gray-900 dark:text-white border-t border-b border-green-400 dark:border-green-600/70';
}

export function formatCurrencyShort(amount: number) {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (absAmount >= 1000) {
    const val = absAmount / 1000;
    // If it is integer, return without decimals
    if (val % 1 === 0) {
      return `${sign}${val.toFixed(0)}K`;
    }
    return `${sign}${val.toFixed(1).replace('.', ',')}K`;
  }
  return `${sign}${absAmount.toFixed(0)}`;
}

import { parseISONEUTRAL } from './utils';
import { 
  addDays, 
  isSameDay, 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval, 
  startOfDay, 
  endOfDay,
  getDate, 
  getDaysInMonth,
  eachDayOfInterval,
  isBefore,
  isThisMonth
} from 'date-fns';
import { Transaction } from '../types';

export const DAILY_LIMIT = 50.0;
export const INVOICE_DUE_DAY = 20;

export interface DashboardKPIs {
  totalEntradas: number;
  totalSaidas: number;
  totalDiarios: number;
  totalEconomizado: number;
  totalPrevistos: number;
  totalCartoes: number;
  economizadoPercent: number;
  custoDeVida: number;
  isDentroDaRenda: boolean;
  diarioMedio: number;
  sobrouDinheiro: number;
  performance: number;
}

export function getTransactionReferenceDate(t: Transaction): Date {
  if (t.type === 'CARTAO' && t.purchaseDate) {
    return parseISONEUTRAL(t.purchaseDate);
  }
  return parseISONEUTRAL(t.date);
}

/**
 * Calculador de KPIs de Dashboard do Mês Atual.
 * Baseado na metodologia dos 5 Pilares.
 */
export function calculateDashboardKPIs(transactions: Transaction[], selectedDate: Date): DashboardKPIs {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);

  let totalEntradas = 0;
  let totalSaidas = 0;
  let totalDiarios = 0;
  let totalEconomizado = 0;
  let totalCartoes = 0;
  let totalPrevistos = 0;

  transactions.forEach((t) => {
    const tRefDate = getTransactionReferenceDate(t);
    if (isWithinInterval(tRefDate, { start: monthStart, end: monthEnd })) {
      if (t.type === 'ENTRADA') {
        totalEntradas += t.amount;
      } else if (t.type === 'ECONOMIA') {
        totalEconomizado += t.amount;
      } else if (t.type === 'DIARIO') {
        totalDiarios += t.amount;
        totalSaidas += t.amount;
      } else if (t.type === 'CARTAO') {
        totalCartoes += t.amount;
        totalSaidas += t.amount;
      } else if (t.type === 'SAIDA') {
        totalPrevistos += t.amount;
        totalSaidas += t.amount;
      }
    }
  });

  // 1. Economizado (%): (Soma ECONOMIAS / Soma ENTRADAS) * 100
  const economizadoPercent = totalEntradas > 0 ? (totalEconomizado / totalEntradas) * 100 : 0;

  // 2. Custo de Vida: SAIDAS + DIARIOS + CARTAO (que é o totalSaidas aqui)
  const custoDeVida = totalPrevistos + totalDiarios + totalCartoes;

  // 3. Avaliar se é de fato menor ou igual à Entrada total pra "Dentro da renda"
  const isDentroDaRenda = custoDeVida <= totalEntradas;

  // 4. Diário Médio (R$): (Soma de todos os gastos DIÁRIOS do mês visualizado) / Divisor de Dias
  const today = new Date();
  const isCurrentMonth = selectedDate.getFullYear() === today.getFullYear() && 
                         selectedDate.getMonth() === today.getMonth();
  const isPastMonth = selectedDate.getFullYear() < today.getFullYear() || 
                      (selectedDate.getFullYear() === today.getFullYear() && selectedDate.getMonth() < today.getMonth());

  let elapsedDays = 1;
  if (isCurrentMonth) {
    elapsedDays = today.getDate();
  } else if (isPastMonth) {
    elapsedDays = getDaysInMonth(selectedDate);
  } else {
    elapsedDays = 1;
  }

  const diarioMedio = elapsedDays > 0 ? totalDiarios / elapsedDays : 0;

  // 5. Sobrou Dinheiro = Entradas - Saídas - Diários - Cartões - Economias
  // Note: totalSaidas = SAIDA (Previstos) + DIARIOS + CARTAO
  const sobrouDinheiro = totalEntradas - totalPrevistos - totalDiarios - totalCartoes - totalEconomizado;

  // Performance is basically totalEntradas - totalSaidas - totalEconomizado (sobrouDinheiro)
  const performance = sobrouDinheiro;

  return {
    totalEntradas,
    totalSaidas,
    totalDiarios,
    totalEconomizado,
    totalPrevistos,
    totalCartoes,
    economizadoPercent,
    custoDeVida,
    isDentroDaRenda,
    diarioMedio,
    sobrouDinheiro,
    performance,
  };
}

export interface BalanceHorizonItem {
  data: Date;
  saldo_projetado: number;
  isFuro: boolean;
  entradas: number;
  saidas: number;
  diarios: number;
  faturaCartao: number;
  economias: number;
}

/**
 * Algoritmo de Projeção do "Horizonte de Saldos" (Heatmap de Meses)
 * Cálculos preditivos para os próximos dias sem vazamento de dados.
 */
export function generateBalanceHorizon(
  transactions: Transaction[],
  currentBalance: number,
  startDate: Date = new Date(),
  daysToProject: number = 90
): BalanceHorizonItem[] {
  const monthStart = startOfMonth(startDate);

  // SALDO INICIAL RESTRITO: Somar APENAS transações estritamente ANTERIORES ao dia 1º deste mês.
  // Se uma transação ocorre no dia 2 do mês atual, ela NÃO PODE entrar aqui.
  const initialBalance = transactions
    .filter(t => isBefore(parseISONEUTRAL(t.date), monthStart))
    .reduce((acc, t) => {
      if (t.type === 'ENTRADA') return acc + t.amount;
      if (['SAIDA', 'DIARIO', 'ECONOMIA', 'CARTAO'].includes(t.type)) return acc - t.amount;
      return acc;
    }, 0);

  let runningBalance = initialBalance;
  const horizon: BalanceHorizonItem[] = [];

  // LOOP SEQUENCIAL DO MÊS / DIA A DIA
  for (let i = 0; i < daysToProject; i++) {
    const currentDate = addDays(monthStart, i);

    // Pegar as transações exatas DESTE dia
    const dayTransactions = transactions.filter(t => isSameDay(parseISONEUTRAL(t.date), currentDate));

    const dayInflow = dayTransactions
      .filter(t => t.type === 'ENTRADA')
      .reduce((sum, t) => sum + t.amount, 0);

    const dayOutflow = dayTransactions
      .filter(t => ['SAIDA', 'DIARIO', 'ECONOMIA', 'CARTAO'].includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0);

    // Atualiza o saldo progressivo
    runningBalance = runningBalance + dayInflow - dayOutflow;

    const isFuro = runningBalance < 0;

    horizon.push({
      data: currentDate,
      saldo_projetado: runningBalance,
      isFuro,
      entradas: dayInflow,
      saidas: dayTransactions.filter(t => t.type === 'SAIDA').reduce((sum, t) => sum + t.amount, 0),
      diarios: dayTransactions.filter(t => t.type === 'DIARIO').reduce((sum, t) => sum + t.amount, 0),
      faturaCartao: dayTransactions.filter(t => t.type === 'CARTAO').reduce((sum, t) => sum + t.amount, 0),
      economias: dayTransactions.filter(t => t.type === 'ECONOMIA').reduce((sum, t) => sum + t.amount, 0),
    });
  }

  return horizon;
}

export interface DayControlItem {
  day: number;
  date: Date;
  gasto: number;
  meta: number;
  onTarget: boolean;
}

/**
 * Algoritmo da Tela "Horizonte de Diários"
 */
export function generateDailyControl(
  transactions: Transaction[],
  selectedDate: Date,
  metaDiaria: number = DAILY_LIMIT
): DayControlItem[] {
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(selectedDate),
    end: endOfMonth(selectedDate)
  });

  return daysInMonth.map((date) => {
    const day = getDate(date);
    
    // Contabilizar type === 'DIARIO' para o dia selecionado
    const gasto = transactions
      .filter((t) => t.type === 'DIARIO' && isSameDay(parseISONEUTRAL(t.date), date))
      .reduce((acc, t) => acc + t.amount, 0);

    const onTarget = gasto <= metaDiaria;

    return {
      day,
      date,
      gasto,
      meta: metaDiaria,
      onTarget,
    };
  });
}

export type TransactionType = 'ENTRADA' | 'SAIDA' | 'DIARIO' | 'CARTAO' | 'ECONOMIA';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string; // ISO date string
  tags?: string[];
  purchaseDate?: string; // Original purchase date for Cartão temporary offset logic
  recurrenceId?: string;
  isRecurrenceRoot?: boolean;
}

export const CATEGORY_COLORS: Record<TransactionType, { text: string, bg: string, iconBg: string }> = {
  ENTRADA: { text: 'text-emerald-600', bg: 'bg-emerald-50', iconBg: 'bg-emerald-100 text-emerald-600' },
  SAIDA: { text: 'text-rose-600', bg: 'bg-rose-50', iconBg: 'bg-rose-100 text-rose-600' },
  DIARIO: { text: 'text-pink-600', bg: 'bg-pink-50', iconBg: 'bg-pink-100 text-pink-600' },
  CARTAO: { text: 'text-blue-600', bg: 'bg-blue-50', iconBg: 'bg-blue-100 text-blue-600' },
  ECONOMIA: { text: 'text-emerald-600', bg: 'bg-emerald-50', iconBg: 'bg-emerald-100 text-emerald-600' }, // Shared green with Entrada
};

import React, { createContext, useContext, ReactNode } from 'react';
import { Transaction } from '../types';
import { useFinanceStore } from '../store/useFinanceStore';
import { isSameDay, startOfMonth } from 'date-fns';
import { generateBalanceHorizon } from '../lib/financeCalculations';

interface TransactionContextData {
  transactions: Transaction[];
  currentBalance: number;
  todayBalance: number;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, updated: Partial<Transaction>) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const TransactionContext = createContext<TransactionContextData | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const transactions = useFinanceStore((state) => state.transactions);
  const currentBalance = useFinanceStore((state) => state.currentBalance);
  const selectedDate = useFinanceStore((state) => state.selectedDate);
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);
  const updateTransaction = useFinanceStore((state) => state.updateTransaction);
  const setSelectedDate = useFinanceStore((state) => state.setSelectedDate);

  const todayBalance = React.useMemo(() => {
    const today = new Date();
    const startOfThisMonth = startOfMonth(today);
    const projections = generateBalanceHorizon(transactions, currentBalance, startOfThisMonth, 32);
    const todayProj = projections.find(p => isSameDay(p.data, today));
    return todayProj ? todayProj.saldo_projetado : currentBalance;
  }, [transactions, currentBalance]);

  return (
    <TransactionContext.Provider value={{ 
      transactions, 
      currentBalance, 
      todayBalance,
      addTransaction, 
      deleteTransaction, 
      updateTransaction,
      selectedDate, 
      setSelectedDate 
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}

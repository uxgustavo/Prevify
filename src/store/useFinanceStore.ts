import { create } from 'zustand';
import { Transaction, TransactionType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { 
  isSupabaseConfigured, 
  registerUserInSupabase, 
  loadUserDataFromSupabase, 
  saveUserDataToSupabase,
  getUserFromSupabase
} from '../lib/supabase';

export interface CustomTag {
  name: string;
  color: string;
  icon: string;
}

interface FinanceState {
  transactions: Transaction[];
  currentBalance: number;
  selectedDate: Date;
  customTags: CustomTag[];
  darkMode: boolean;
  primaryColor: string; // 'orange' | 'emerald' | 'blue' | 'violet' | 'crimson'
  isLoggedIn: boolean;
  currentUser: { name: string; email: string };
  toggleDarkMode: () => void;
  setPrimaryColor: (color: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, updated: Partial<Transaction>) => void;
  setSelectedDate: (date: Date) => void;
  setCurrentBalance: (balance: number) => void;
  setTransactions: (txs: Transaction[]) => void;
  addCustomTag: (tag: CustomTag) => void;
  deleteCustomTag: (name: string) => void;
  loginUser: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  registerUser: (name: string, email: string, pass: string) => { success: boolean; message: string };
  changePassword: (oldPass: string, newPass: string) => { success: boolean; message: string };
  updateUserProfile: (name: string, email: string) => void;
  logoutUser: () => void;
}

const ensureInitialUsers = () => {
  if (typeof window !== 'undefined') {
    const usersStr = localStorage.getItem('appUsers');
    if (!usersStr) {
      localStorage.setItem('appUsers', JSON.stringify([
        { name: 'Gustavo', email: 'gustavo.hvss@gmail.com', password: '123' },
        { name: 'Gustavo H. V. S. S.', email: 'gustavo.hvss@gmail.com', password: '123' }
      ]));
    }
  }
};
ensureInitialUsers();

export const checkInitialAuth = (): boolean => {
  if (typeof window !== 'undefined') {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const sessionExpiryStr = localStorage.getItem('sessionExpiry');
    if (isLoggedIn && sessionExpiryStr) {
      const expiry = parseInt(sessionExpiryStr, 10);
      if (!isNaN(expiry) && Date.now() < expiry) {
        return true;
      }
    }
    // Clean up if expired or invalid
    if (isLoggedIn || sessionExpiryStr) {
      localStorage.setItem('isLoggedIn', 'false');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('sessionExpiry');
    }
  }
  return false;
};

const getInitialUser = () => {
  if (typeof window !== 'undefined') {
    const isLoggedIn = checkInitialAuth();
    const currentUserStr = localStorage.getItem('currentUser');
    if (isLoggedIn && currentUserStr) {
      try {
        return JSON.parse(currentUserStr);
      } catch (e) {
        // ignore
      }
    }
  }
  return { name: '', email: '' };
};

const getInitialTransactions = (email: string): Transaction[] => {
  if (typeof window !== 'undefined' && email) {
    const dataStr = localStorage.getItem(`transactions_${email.toLowerCase()}`);
    if (dataStr) {
      try {
        return JSON.parse(dataStr);
      } catch (e) {
        // ignore
      }
    }
  }
  return [];
};

const getInitialBalance = (email: string): number => {
  if (typeof window !== 'undefined' && email) {
    const balStr = localStorage.getItem(`currentBalance_${email.toLowerCase()}`);
    if (balStr !== null && balStr !== undefined) {
      const parsed = parseFloat(balStr);
      return isNaN(parsed) ? 0 : parsed;
    }
  }
  return 0;
};

const getInitialCustomTags = (email: string): CustomTag[] => {
  if (typeof window !== 'undefined' && email) {
    const tagsStr = localStorage.getItem(`customTags_${email.toLowerCase()}`);
    if (tagsStr) {
      try {
        return JSON.parse(tagsStr);
      } catch (e) {
        // ignore
      }
    }
  }
  return [];
};

const saveUserData = (email: string, transactions: Transaction[], balance: number, customTags: CustomTag[]) => {
  if (typeof window !== 'undefined' && email) {
    const keySuffix = email.toLowerCase();
    localStorage.setItem(`transactions_${keySuffix}`, JSON.stringify(transactions));
    localStorage.setItem(`currentBalance_${keySuffix}`, String(balance));
    localStorage.setItem(`customTags_${keySuffix}`, JSON.stringify(customTags));

    // Mark local data as dirty
    localStorage.setItem(`isDirty_${keySuffix}`, 'true');

    // Async background sync with Supabase
    saveUserDataToSupabase(email, transactions, balance, customTags).then((success) => {
      if (success) {
        // Only set dirty to false if no further local modifications occurred
        const currentTx = localStorage.getItem(`transactions_${keySuffix}`);
        const currentBal = localStorage.getItem(`currentBalance_${keySuffix}`);
        const currentTags = localStorage.getItem(`customTags_${keySuffix}`);
        
        if (
          currentTx === JSON.stringify(transactions) &&
          currentBal === String(balance) &&
          currentTags === JSON.stringify(customTags)
        ) {
          localStorage.setItem(`isDirty_${keySuffix}`, 'false');
        }
      }
    });
  }
};

const initialUser = getInitialUser();

export const useFinanceStore = create<FinanceState>((set) => ({
  transactions: initialUser.email ? getInitialTransactions(initialUser.email) : [],
  currentBalance: initialUser.email ? getInitialBalance(initialUser.email) : 0,
  selectedDate: new Date(),
  customTags: initialUser.email ? getInitialCustomTags(initialUser.email) : [],
  darkMode: typeof window !== 'undefined' ? localStorage.getItem('theme') === 'dark' : false,
  primaryColor: typeof window !== 'undefined' ? (localStorage.getItem('primaryColor') || 'violet') : 'violet',
  isLoggedIn: checkInitialAuth(),
  currentUser: initialUser,
  toggleDarkMode: () => set((state) => {
    const nextDark = !state.darkMode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', nextDark ? 'dark' : 'light');
      const root = window.document.documentElement;
      if (nextDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    return { darkMode: nextDark };
  }),
  setPrimaryColor: (color) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('primaryColor', color);
    }
    set({ primaryColor: color });
  },
  
  addTransaction: (tx) => set((state) => {
    const newTx: Transaction = {
      ...tx,
      id: uuidv4(),
    };
    
    // For CARTAO transactions, automatically offset date to the invoice due date
    if (newTx.type === 'CARTAO') {
      const datePart = newTx.date.split('T')[0];
      const [yearStr, monthStr, dayStr] = datePart.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      const day = parseInt(dayStr);

      let dueYear = year;
      let dueMonth = month;

      if (day <= 20) {
        dueMonth = month;
      } else {
        dueMonth = month + 1;
        if (dueMonth > 12) {
          dueMonth = 1;
          dueYear = year + 1;
        }
      }

      newTx.purchaseDate = newTx.date;
      newTx.date = `${dueYear}-${String(dueMonth).padStart(2, '0')}-20T12:00:00.000Z`;
    }
    
    // Motor de Regras dos 5 Pilares para atualizar o saldo em conta corrente na hora:
    let balanceDelta = 0;
    if (newTx.type === 'ENTRADA') {
      balanceDelta = newTx.amount;
    } else if (newTx.type === 'SAIDA') {
      balanceDelta = -newTx.amount;
    } else if (newTx.type === 'DIARIO') {
      balanceDelta = -newTx.amount;
    } else if (newTx.type === 'ECONOMIA') {
      balanceDelta = -newTx.amount; // Investimentos e Reservas saem do saldo em conta corrente
    } else if (newTx.type === 'CARTAO') {
      balanceDelta = 0; // CARTAO NÃO afeta o saldo na hora da compra! Reduz apenas na fatura consolidada.
    }

    // Also automatically add any newly encountered tag from the transaction to customTags
    const updatedCustomTags = [...state.customTags];
    if (newTx.tags) {
      newTx.tags.forEach(tName => {
        if (!updatedCustomTags.some(t => t.name.toLowerCase() === tName.toLowerCase())) {
          updatedCustomTags.push({
            name: tName,
            color: 'bg-orange-100', // Default light orange
            icon: '🏷️'
          });
        }
      });
    }

    const nextTransactions = [...state.transactions, newTx];
    const nextBalance = state.currentBalance + balanceDelta;

    saveUserData(state.currentUser.email, nextTransactions, nextBalance, updatedCustomTags);

    return {
      transactions: nextTransactions,
      currentBalance: nextBalance,
      customTags: updatedCustomTags
    };
  }),

  deleteTransaction: (id) => set((state) => {
    const transactionToDelete = state.transactions.find(t => t.id === id);
    if (!transactionToDelete) return { transactions: state.transactions };

    // Find all transactions that should be deleted
    let transactionsToDelete = [transactionToDelete];
    if (transactionToDelete.recurrenceId && transactionToDelete.isRecurrenceRoot) {
      transactionsToDelete = state.transactions.filter(
        (t) => t.recurrenceId === transactionToDelete.recurrenceId
      );
    }

    let balanceDelta = 0;
    transactionsToDelete.forEach((tx) => {
      if (tx.type === 'ENTRADA') {
        balanceDelta -= tx.amount;
      } else if (tx.type === 'SAIDA' || tx.type === 'DIARIO' || tx.type === 'ECONOMIA') {
        balanceDelta += tx.amount;
      }
      // Deletar CARTAO não afeta o saldo corrente imediatamente
    });

    const toDeleteIds = new Set(transactionsToDelete.map((t) => t.id));
    const nextTransactions = state.transactions.filter((t) => !toDeleteIds.has(t.id));
    const nextBalance = state.currentBalance + balanceDelta;

    saveUserData(state.currentUser.email, nextTransactions, nextBalance, state.customTags);

    return {
      transactions: nextTransactions,
      currentBalance: nextBalance,
    };
  }),

  updateTransaction: (id, updated) => set((state) => {
    const oldTx = state.transactions.find((t) => t.id === id);
    if (!oldTx) return { transactions: state.transactions };

    const newTx: Transaction = {
      ...oldTx,
      ...updated,
    } as Transaction;

    // For CARTAO transactions, automatically offset date to the invoice due date
    if (newTx.type === 'CARTAO') {
      const datePart = newTx.date.split('T')[0];
      const [yearStr, monthStr, dayStr] = datePart.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      const day = parseInt(dayStr);

      let dueYear = year;
      let dueMonth = month;

      if (day <= 20) {
        dueMonth = month;
      } else {
        dueMonth = month + 1;
        if (dueMonth > 12) {
          dueMonth = 1;
          dueYear = year + 1;
        }
      }

      newTx.purchaseDate = newTx.date;
      newTx.date = `${dueYear}-${String(dueMonth).padStart(2, '0')}-20T12:00:00.000Z`;
    } else {
      newTx.purchaseDate = undefined;
    }

    let tempBalance = state.currentBalance;
    // Rollback original transaction effect
    if (oldTx.type === 'ENTRADA') {
      tempBalance -= oldTx.amount;
    } else if (oldTx.type === 'SAIDA' || oldTx.type === 'DIARIO' || oldTx.type === 'ECONOMIA') {
      tempBalance += oldTx.amount;
    }

    // Apply updated transaction effect
    if (newTx.type === 'ENTRADA') {
      tempBalance += newTx.amount;
    } else if (newTx.type === 'SAIDA' || newTx.type === 'DIARIO' || newTx.type === 'ECONOMIA') {
      tempBalance -= newTx.amount;
    }

    // Sync any new tags directly to state custom list if editing added tags
    const updatedCustomTags = [...state.customTags];
    if (newTx.tags) {
      newTx.tags.forEach(tName => {
        if (!updatedCustomTags.some(t => t.name.toLowerCase() === tName.toLowerCase())) {
          updatedCustomTags.push({
            name: tName,
            color: 'bg-orange-100',
            icon: '🏷️'
          });
        }
      });
    }

    const nextTransactions = state.transactions.map((t) => t.id === id ? newTx : t);
    const nextBalance = tempBalance;

    saveUserData(state.currentUser.email, nextTransactions, nextBalance, updatedCustomTags);

    return {
      transactions: nextTransactions,
      currentBalance: nextBalance,
      customTags: updatedCustomTags,
    };
  }),

  setSelectedDate: (date) => set({ selectedDate: date }),
  setCurrentBalance: (balance) => set((state) => {
    saveUserData(state.currentUser.email, state.transactions, balance, state.customTags);
    return { currentBalance: balance };
  }),
  setTransactions: (txs) => set((state) => {
    saveUserData(state.currentUser.email, txs, state.currentBalance, state.customTags);
    return { transactions: txs };
  }),
  addCustomTag: (tag) => set((state) => {
    if (state.customTags.some(t => t.name.toLowerCase() === tag.name.toLowerCase())) {
      return {}; // Avoid duplicate
    }
    const nextTags = [...state.customTags, tag];
    saveUserData(state.currentUser.email, state.transactions, state.currentBalance, nextTags);
    return { customTags: nextTags };
  }),
  deleteCustomTag: (name) => set((state) => {
    const nextTags = state.customTags.filter(t => t.name !== name);
    saveUserData(state.currentUser.email, state.transactions, state.currentBalance, nextTags);
    return { customTags: nextTags };
  }),
  loginUser: async (email, pass) => {
    const cleanEmail = email.toLowerCase();
    
    // Check if we can find user in Supabase first (source of truth)
    let user: any = null;
    if (isSupabaseConfigured()) {
      try {
        const dbUser = await getUserFromSupabase(cleanEmail);
        if (dbUser) {
          user = { name: dbUser.name, email: dbUser.email, password: dbUser.password };
          
          // Sync/update local appUsers list
          const usersStr = localStorage.getItem('appUsers') || '[]';
          const localUsers = JSON.parse(usersStr);
          const localIdx = localUsers.findIndex((u: any) => u.email.toLowerCase() === cleanEmail);
          if (localIdx !== -1) {
            localUsers[localIdx] = user;
          } else {
            localUsers.push(user);
          }
          localStorage.setItem('appUsers', JSON.stringify(localUsers));
        }
      } catch (e) {
        console.warn('Could not verify user with Supabase (using local fallback):', e);
      }
    }
    
    // Fallback to local storage if offline or not found in Supabase
    if (!user) {
      const usersStr = localStorage.getItem('appUsers') || '[]';
      const localUsers = JSON.parse(usersStr);
      user = localUsers.find((u: any) => u.email.toLowerCase() === cleanEmail);
    }
    
    if (!user) {
      return { success: false, message: 'Usuário não encontrado.' };
    }
    if (user.password !== pass) {
      return { success: false, message: 'Senha incorreta.' };
    }
    
    const update = { name: user.name, email: user.email };
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('sessionExpiry', String(Date.now() + 2 * 60 * 60 * 1000)); // 2h expiry
    localStorage.setItem('currentUser', JSON.stringify(update));
    localStorage.setItem('profileName', user.name);
    localStorage.setItem('profileEmail', user.email);

    const loadedTx = getInitialTransactions(user.email);
    const loadedBal = getInitialBalance(user.email);
    const loadedTags = getInitialCustomTags(user.email);

    set({ 
      isLoggedIn: true, 
      currentUser: update,
      transactions: loadedTx,
      currentBalance: loadedBal,
      customTags: loadedTags
    });

    // Await synchronization to guarantee that database transactions are fetched/restored before transitioning
    await syncUnsyncedUsers().catch(() => {});
    await syncUserData(user.email).catch(() => {});

    return { success: true, message: 'Login realizado com sucesso!' };
  },
  registerUser: (name, email, pass) => {
    if (!name || !email || !pass) {
      return { success: false, message: 'Preencha todos os campos.' };
    }
    const usersStr = localStorage.getItem('appUsers') || '[]';
    const users = JSON.parse(usersStr);
    if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Este e-mail já está cadastrado.' };
    }
    const newUser = { name, email, password: pass };
    const updatedUsers = [...users, newUser];
    localStorage.setItem('appUsers', JSON.stringify(updatedUsers));
    
    // Track unsynced user registrations
    const unsyncedStr = localStorage.getItem('unsyncedUsers') || '[]';
    try {
      const unsyncedList = JSON.parse(unsyncedStr);
      if (Array.isArray(unsyncedList)) {
        unsyncedList.push(newUser);
        localStorage.setItem('unsyncedUsers', JSON.stringify(unsyncedList));
      }
    } catch (e) {
      localStorage.setItem('unsyncedUsers', JSON.stringify([newUser]));
    }
    
    // Transparent register to central database in background
    registerUserInSupabase(name, email, pass).then((success) => {
      if (success) {
        try {
          const unsyncedStr = localStorage.getItem('unsyncedUsers') || '[]';
          const unsyncedList = JSON.parse(unsyncedStr);
          if (Array.isArray(unsyncedList)) {
            const filtered = unsyncedList.filter((u: any) => u.email.toLowerCase() !== email.toLowerCase());
            if (filtered.length > 0) {
              localStorage.setItem('unsyncedUsers', JSON.stringify(filtered));
            } else {
              localStorage.removeItem('unsyncedUsers');
            }
          }
        } catch (e) {}
      }
    });
    
    const update = { name, email };
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('sessionExpiry', String(Date.now() + 2 * 60 * 60 * 1000)); // 2h expiry
    localStorage.setItem('currentUser', JSON.stringify(update));
    localStorage.setItem('profileName', name);
    localStorage.setItem('profileEmail', email);

    saveUserData(email, [], 0, []);

    set({ 
      isLoggedIn: true, 
      currentUser: update,
      transactions: [],
      currentBalance: 0,
      customTags: []
    });
    return { success: true, message: 'Conta criada com sucesso!' };
  },
  changePassword: (oldPass, newPass) => {
    if (!newPass || newPass.length < 3) {
      return { success: false, message: 'A nova senha deve ter pelo menos 3 caracteres.' };
    }
    const myEmail = useFinanceStore.getState().currentUser.email;
    const usersStr = localStorage.getItem('appUsers') || '[]';
    const users = JSON.parse(usersStr);
    const userIdx = users.findIndex((u: any) => u.email.toLowerCase() === myEmail.toLowerCase());
    
    if (userIdx === -1) {
      return { success: false, message: 'Usuário não localizado no banco.' };
    }
    if (users[userIdx].password !== oldPass) {
      return { success: false, message: 'A senha atual informada está incorreta.' };
    }
    
    users[userIdx].password = newPass;
    localStorage.setItem('appUsers', JSON.stringify(users));
    return { success: true, message: 'Senha atualizada com sucesso!' };
  },
  updateUserProfile: (name, email) => {
    const myEmail = useFinanceStore.getState().currentUser.email;
    const usersStr = localStorage.getItem('appUsers') || '[]';
    const users = JSON.parse(usersStr);
    const userIdx = users.findIndex((u: any) => u.email.toLowerCase() === myEmail.toLowerCase());
    
    if (userIdx !== -1) {
      users[userIdx].name = name;
      users[userIdx].email = email;
      localStorage.setItem('appUsers', JSON.stringify(users));
    }
    
    // Key Migration for user data if email changes
    if (myEmail.toLowerCase() !== email.toLowerCase()) {
      const oldSuffix = myEmail.toLowerCase();
      const newSuffix = email.toLowerCase();
      
      const oldTx = localStorage.getItem(`transactions_${oldSuffix}`);
      if (oldTx) {
        localStorage.setItem(`transactions_${newSuffix}`, oldTx);
        localStorage.removeItem(`transactions_${oldSuffix}`);
      }
      const oldBal = localStorage.getItem(`currentBalance_${oldSuffix}`);
      if (oldBal) {
        localStorage.setItem(`currentBalance_${newSuffix}`, oldBal);
        localStorage.removeItem(`currentBalance_${oldSuffix}`);
      }
      const oldTags = localStorage.getItem(`customTags_${oldSuffix}`);
      if (oldTags) {
        localStorage.setItem(`customTags_${newSuffix}`, oldTags);
        localStorage.removeItem(`customTags_${oldSuffix}`);
      }
    }

    const update = { name, email };
    localStorage.setItem('currentUser', JSON.stringify(update));
    localStorage.setItem('profileName', name);
    localStorage.setItem('profileEmail', email);
    set({ currentUser: update });
  },
  logoutUser: () => {
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('sessionExpiry');
    localStorage.removeItem('currentUser');
    set({ 
      isLoggedIn: false, 
      currentUser: { name: '', email: '' },
      transactions: [],
      currentBalance: 0,
      customTags: []
    });
  },
}));

// Sync functions implementation
export async function syncUnsyncedUsers(): Promise<boolean> {
  if (typeof window === 'undefined' || !isSupabaseConfigured()) return false;
  
  const unsyncedUsersStr = localStorage.getItem('unsyncedUsers');
  if (!unsyncedUsersStr) return true;
  
  try {
    const unsyncedUsers = JSON.parse(unsyncedUsersStr);
    if (!Array.isArray(unsyncedUsers) || unsyncedUsers.length === 0) return true;
    
    const remainingUsers: any[] = [];
    let allSuccessful = true;
    
    for (const u of unsyncedUsers) {
      const success = await registerUserInSupabase(u.name, u.email, u.password);
      if (!success) {
        remainingUsers.push(u);
        allSuccessful = false;
      }
    }
    
    if (remainingUsers.length > 0) {
      localStorage.setItem('unsyncedUsers', JSON.stringify(remainingUsers));
    } else {
      localStorage.removeItem('unsyncedUsers');
    }
    
    return allSuccessful;
  } catch (e) {
    console.error('Error during unsynced users migration:', e);
    return false;
  }
}

export async function syncUserData(email: string): Promise<boolean> {
  if (typeof window === 'undefined' || !email || !isSupabaseConfigured()) return false;
  
  const keySuffix = email.toLowerCase();
  const isDirty = localStorage.getItem(`isDirty_${keySuffix}`) === 'true';
  
  if (isDirty) {
    const localTxStr = localStorage.getItem(`transactions_${keySuffix}`);
    const localBalStr = localStorage.getItem(`currentBalance_${keySuffix}`);
    const localTagsStr = localStorage.getItem(`customTags_${keySuffix}`);
    
    let txs: Transaction[] = [];
    let bal = 0;
    let tags: CustomTag[] = [];
    
    try {
      if (localTxStr) txs = JSON.parse(localTxStr);
      if (localBalStr) bal = parseFloat(localBalStr);
      if (localTagsStr) tags = JSON.parse(localTagsStr);
    } catch (e) {
      // ignore
    }
    
    const success = await saveUserDataToSupabase(email, txs, bal, tags);
    if (success) {
      localStorage.setItem(`isDirty_${keySuffix}`, 'false');
      return true;
    }
    return false;
  } else {
    try {
      const dbData = await loadUserDataFromSupabase(email);
      if (dbData) {
        const syncedTx = dbData.transactions !== null ? dbData.transactions : [];
        const syncedBal = dbData.balance !== null ? dbData.balance : 0;
        const syncedTags = dbData.customTags !== null ? dbData.customTags : [];
        
        localStorage.setItem(`transactions_${keySuffix}`, JSON.stringify(syncedTx));
        localStorage.setItem(`currentBalance_${keySuffix}`, String(syncedBal));
        localStorage.setItem(`customTags_${keySuffix}`, JSON.stringify(syncedTags));
        
        const currentStore = useFinanceStore.getState();
        if (currentStore.currentUser.email.toLowerCase() === email.toLowerCase()) {
          useFinanceStore.setState({
            transactions: syncedTx,
            currentBalance: syncedBal,
            customTags: syncedTags
          });
        }
        return true;
      }
    } catch (e) {
      console.warn('Failed to load user data from Supabase:', e);
    }
    return false;
  }
}

// Initial background synchronization on startup
if (typeof window !== 'undefined' && checkInitialAuth() && initialUser && initialUser.email) {
  syncUnsyncedUsers().then(() => {
    if (initialUser.email) {
      syncUserData(initialUser.email).catch(e => {
        console.warn('Initial background database sync-up failed (offline fallback active):', e);
      });
    }
  }).catch(() => {});
}

// Online reconnection event listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncUnsyncedUsers().then(() => {
      const email = useFinanceStore.getState().currentUser.email;
      if (email) {
        syncUserData(email).catch(() => {});
      }
    }).catch(() => {});
  });
}

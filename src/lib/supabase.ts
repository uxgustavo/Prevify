import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables with fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log("Testando chaves:", { url: supabaseUrl, key: supabaseAnonKey });

let dbClient: SupabaseClient | null = null;

/**
 * Lazy initialization of Supabase client to prevent application startup crashes when
 * environment variables are not yet populated.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!dbClient) {
    if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY') {
      try {
        dbClient = createClient(supabaseUrl, supabaseAnonKey);
      } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
      }
    }
  }
  return dbClient;
}

/**
 * Checks if Supabase integration is fully configured and ready for database sync.
 */
export function isSupabaseConfigured(): boolean {
  return !!getSupabaseClient();
}

/**
 * Registers/Upserts user credentials in the central database.
 */
export async function registerUserInSupabase(name: string, email: string, pass: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  try {
    const cleanEmail = email.toLowerCase();
    const { error } = await supabase
      .from('app_users')
      .upsert({ email: cleanEmail, name, password: pass }, { onConflict: 'email' });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to sync user registration to Supabase:', error);
    return false;
  }
}

/**
 * Loads all data for a specific user from Supabase.
 */
export async function loadUserDataFromSupabase(email: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const cleanEmail = email.toLowerCase();
    
    // 1. Fetch balance
    const { data: balData } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_email', cleanEmail)
      .maybeSingle();
      
    // 2. Fetch transactions
    const { data: txsData } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_email', cleanEmail)
      .order('date', { ascending: false });
      
    // 3. Fetch custom tags
    const { data: tagsData } = await supabase
      .from('custom_tags')
      .select('*')
      .eq('user_email', cleanEmail);
      
    return {
      balance: balData ? parseFloat(balData.balance) : null,
      transactions: txsData ? txsData.map(t => ({
        id: t.id,
        type: t.type,
        description: t.description,
        amount: parseFloat(t.amount),
        date: t.date,
        purchaseDate: t.purchase_date || undefined,
        tags: t.tags || []
      })) : null,
      customTags: tagsData ? tagsData.map(tg => ({
        name: tg.name,
        color: tg.color,
        icon: tg.icon
      })) : null
    };
  } catch (error) {
    console.error('Failed to load user data from Supabase:', error);
    return null;
  }
}

/**
 * Saves/Synchronizes the full dataset for a specific user to Supabase.
 */
export async function saveUserDataToSupabase(
  email: string,
  transactions: any[],
  balance: number,
  customTags: any[]
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  try {
    const cleanEmail = email.toLowerCase();
    
    // 1. Save user balance
    const { error: balError } = await supabase
      .from('user_balances')
      .upsert({ user_email: cleanEmail, balance }, { onConflict: 'user_email' });
    if (balError) throw balError;
      
    // 2. Sync transactions: perform clear and insert to ensure synchronized collections
    const { error: delTxError } = await supabase
      .from('transactions')
      .delete()
      .eq('user_email', cleanEmail);
    if (delTxError) throw delTxError;
      
    if (transactions.length > 0) {
      const rows = transactions.map(t => ({
        id: t.id && t.id.length === 36 ? t.id : undefined, // Ensure valid UUID format or let db generate
        user_email: cleanEmail,
        type: t.type,
        description: t.description,
        amount: t.amount,
        date: t.date,
        purchase_date: t.purchaseDate || null,
        tags: t.tags || []
      }));
      const { error: insTxError } = await supabase.from('transactions').insert(rows);
      if (insTxError) throw insTxError;
    }
    
    // 3. Sync custom tags
    const { error: delTagError } = await supabase
      .from('custom_tags')
      .delete()
      .eq('user_email', cleanEmail);
    if (delTagError) throw delTagError;
      
    if (customTags.length > 0) {
      const tagRows = customTags.map(tg => ({
        user_email: cleanEmail,
        name: tg.name,
        color: tg.color,
        icon: tg.icon
      }));
      const { error: insTagError } = await supabase.from('custom_tags').insert(tagRows);
      if (insTagError) throw insTagError;
    }
    return true;
  } catch (error) {
    console.error('Failed to save user data to Supabase:', error);
    return false;
  }
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinanceStore } from '../../store/useFinanceStore';
import { 
  Sun, 
  Moon, 
  User, 
  Mail, 
  LogOut, 
  Check, 
  Sparkles, 
  DollarSign, 
  Info,
  Lock,
  Activity,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTransactions } from '../../context/TransactionContext';
import { motion, AnimatePresence } from 'motion/react';

export function Menu() {
  const navigate = useNavigate();
  const { 
    darkMode, 
    toggleDarkMode, 
    currentUser,
    updateUserProfile,
    changePassword,
    logoutUser
  } = useFinanceStore();
  
  const { todayBalance } = useTransactions();

  // Profile data state bound to Zustand store for real-time reactive sync
  const [editName, setEditName] = useState(currentUser.name);
  const [editEmail, setEditEmail] = useState(currentUser.email);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessFeed, setShowSuccessFeed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Password alteration states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Dynamic Initials generator
  const initials = currentUser.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('') || 'G';

  const handleSaveProfile = () => {
    if (!editName.trim() || !editEmail.trim()) {
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      updateUserProfile(editName, editEmail);
      setShowSuccessFeed(true);
      setTimeout(() => setShowSuccessFeed(false), 2500);
    }, 650);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError('Preencha os campos de senha.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('A nova senha e a confirmação não conferem.');
      return;
    }

    if (newPassword.length < 3) {
      setPassError('A nova senha deve ter pelo menos 3 caracteres.');
      return;
    }

    setIsChangingPass(true);
    setTimeout(() => {
      setIsChangingPass(false);
      const res = changePassword(currentPassword, newPassword);
      if (res.success) {
        setPassSuccess(res.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPassError(res.message);
      }
    }, 600);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logoutUser();
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-full bg-white dark:bg-[#141D23] pb-0 relative overflow-hidden lg:rounded-[25px] lg:border lg:border-gray-100 lg:dark:border-gray-800/60 lg:shadow-md text-gray-900 dark:text-gray-100 transition-colors">
      
      {/* Dynamic Header */}
      <div 
        className="px-5 pt-12 pb-5 border-b border-gray-100 dark:border-gray-800/60 bg-white dark:bg-[#141D23] sticky top-0 z-20 flex items-center justify-between"
        style={{ borderRadius: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>
          <p className="text-xs text-gray-400 mt-0.5">Perfil e preferências do sistema</p>
        </div>

        {/* Dynamic Dark Mode Shortcut */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-[#1C262E] hover:bg-gray-100 dark:hover:bg-[#25323D] text-gray-800 dark:text-gray-200 transition-all cursor-pointer shadow-sm active:scale-95"
          aria-label="Alternar Tema Escuro"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-amber-500 fill-amber-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600 fill-gray-600" />
          )}
        </button>
      </div>

      <div className="px-5 pt-6 space-y-6">
        
        {/* SECTION 1: USER PROFILE CARD (Updates in real-time) */}
        <div className="bg-gradient-to-br from-gray-50/60 to-gray-100/40 dark:from-[#1C262E] dark:to-[#172027] p-5 rounded-3xl border border-gray-100/80 dark:border-gray-800/80 flex items-center gap-4 relative overflow-hidden">
          {/* Subtle design accents */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#FF5722]/5 to-[#FF5722]/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="relative">
            {/* Initials Avatar */}
            <div className="w-14 h-14 rounded-full bg-[#FF5722] text-white font-extrabold text-lg flex items-center justify-center shadow-lg shadow-orange-500/10 transition-colors uppercase">
              {initials}
            </div>
            {/* Online/Verified tag */}
            <div className="absolute -bottom-1 -right-1 bg-[#FF5722] border-2 border-white dark:border-[#1C262E] w-5 h-5 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-base font-extrabold text-gray-800 dark:text-gray-100">
              Olá, {currentUser.name.trim().split(' ')[0] || 'Gustavo'}
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-550 flex items-center gap-1.5 mt-0.5 truncate max-w-[200px]">
              <Mail className="w-3.5 h-3.5 shrink-0 text-gray-300 dark:text-gray-600" />
              <span className="truncate">{currentUser.email}</span>
            </p>
          </div>
        </div>

        {/* SECTION 2: BALANCE WIDGET */}
        <div>
          <span className="text-[11px] font-bold tracking-wider text-gray-400 dark:text-gray-550 uppercase px-1">Saldo em Conta</span>
          <div className="mt-1.5 bg-gradient-to-br from-gray-50 to-gray-100/60 dark:from-[#1C262E] dark:to-[#172027] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-tight">Hoje</span>
              <h3 className="text-2xl font-extrabold mt-0.5 text-[#FF5722]">
                {todayBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </h3>
            </div>
            <div className="p-3 bg-white dark:bg-[#141D23] rounded-xl border border-gray-200/50 dark:border-gray-800/80">
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* SECTION 4: EDIT PROFILE (Centralized and structurally persistent) */}
        <div className="bg-gray-50/50 dark:bg-[#1C262E]/40 border border-gray-100 dark:border-gray-800/60 rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <h3 className="font-extrabold text-xs text-gray-400 uppercase tracking-wider">Meu Cadastro</h3>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase mb-1.5 block px-1">Nome de Exibição</label>
              <div className="relative">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nome de Exibição"
                  className="w-full bg-white dark:bg-[#141D23] border border-gray-200/60 dark:border-gray-800/85 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-semibold text-gray-850 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722] transition-all"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase mb-1.5 block px-1">E-mail de Login</label>
              <div className="relative">
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full bg-white dark:bg-[#141D23] border border-gray-200/60 dark:border-gray-800/85 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-semibold text-gray-850 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722] transition-all"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full bg-[#FF5722] hover:bg-[#eb4b18] text-white text-xs font-bold py-3 px-4 rounded-2xl transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider h-11"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : showSuccessFeed ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3px]" />
                    Cadastro Atualizado!
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Salvar Cadastro
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 5: ACCOUNT CREDENTIALS & ACCESS SECURITY (PASSWORD UPDATE) */}
        <div className="bg-gray-50/50 dark:bg-[#1C262E]/40 border border-gray-100 dark:border-gray-800/60 rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-400" />
            <h3 className="font-extrabold text-xs text-gray-400 uppercase tracking-wider">Credenciais de Acesso</h3>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-3.5">
            {passError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 text-rose-600 dark:text-rose-450 text-xs font-semibold rounded-2xl flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-2xl flex items-center gap-1.5">
                <Check className="w-4 h-4 shrink-0 stroke-[3px]" />
                <span>{passSuccess}</span>
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase mb-1.5 block px-1">Senha Atual</label>
              <div className="relative">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-[#141D23] border border-gray-200/60 dark:border-gray-800/85 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-semibold text-gray-855 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722] transition-all"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase mb-1.5 block px-1">Nova Senha</label>
              <div className="relative">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 3 caracteres"
                  className="w-full bg-white dark:bg-[#141D23] border border-gray-200/60 dark:border-gray-800/85 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-semibold text-gray-855 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722] transition-all"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase mb-1.5 block px-1">Confirmar Nova Senha</label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Mínimo 3 caracteres"
                  className="w-full bg-white dark:bg-[#141D23] border border-gray-200/60 dark:border-gray-800/85 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-semibold text-gray-855 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722] transition-all"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPass}
              className="w-full bg-[#FF5722] hover:bg-[#eb4b18] text-white text-xs font-bold py-3 px-4 rounded-2xl transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider h-11"
            >
              {isChangingPass ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  Atualizar Senha de Acesso
                </>
              )}
            </button>
          </form>
        </div>


        {/* SECTION 6: SIGN OUT ACTION */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/15 dark:hover:bg-rose-950/25 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-450 font-bold text-xs py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer uppercase tracking-wider"
          >
            <LogOut className="w-4 h-4" />
            Sair da Conta
          </button>
        </div>

        {/* Footer legal info */}
        <div className="text-center pt-8">
          <div className="inline-flex items-center gap-1.5 text-gray-400 dark:text-gray-550 text-xs">
            <Info className="w-3.5 h-3.5" />
            <span>Prevify - Inteligência em previsibilidade financeira</span>
          </div>
        </div>
      </div>

      {/* CONFIRM LOG OUT POPUP MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-[#141D23]/60 backdrop-blur-[2px]"
            />

            {/* Real Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative bg-white dark:bg-[#1C262E] rounded-3xl p-6 w-full max-w-sm z-50 shadow-2xl text-center space-y-4 border border-gray-100 dark:border-gray-850"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <LogOut className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Deseja realmente sair?</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Você poderá voltar a acessar seu perfil de forma segura a qualquer momento.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800/80 hover:bg-gray-150 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300 text-xs font-bold py-3 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-rose-250 dark:shadow-none"
                >
                  Sair
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

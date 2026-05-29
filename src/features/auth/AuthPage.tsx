import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Mail, Lock, User, Sparkles, Check, ArrowRight, Activity, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function AuthPage() {
  const { loginUser, registerUser, darkMode } = useFinanceStore();
  const [isLogin, setIsLogin] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!isLogin && !name) {
      setError('Por favor, preencha o seu nome completo.');
      return;
    }

    setLoading(true);

    // Simulate thin server-side delay for feedback
    setTimeout(async () => {
      if (isLogin) {
        try {
          const res = await loginUser(email, password);
          if (res.success) {
            setSuccess(res.message);
          } else {
            setError(res.message);
            setLoading(false);
          }
        } catch (e) {
          setError('Erro de autenticação no banco.');
          setLoading(false);
        }
      } else {
        const res = registerUser(name, email, password);
        if (res.success) {
          setSuccess(res.message);
        } else {
          setError(res.message);
          setLoading(false);
        }
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gray-50 dark:bg-[#141D23] px-5 py-10 relative overflow-hidden transition-colors">
      
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FF5722]/5 dark:bg-[#FF5722]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#8B5CF6]/5 dark:bg-[#8B5CF6]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-950 dark:text-white font-sans flex items-center justify-center gap-3">
            <img src="/logo-Prevify.png" alt="Prevify Logo" className="w-10 h-10 object-contain" />
            <span>Prevify</span>
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs mx-auto font-sans">
            Inteligência em previsibilidade financeira
          </p>
        </div>

        {/* Tab Selection */}
        <div className="bg-gray-150/60 dark:bg-[#1C262E] p-1.5 rounded-2xl border border-gray-200/40 dark:border-gray-800/60 flex relative">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError('');
              setSuccess('');
            }}
            className={cn(
              "flex-1 py-3 text-xs font-bold rounded-xl transition-all relative z-10 cursor-pointer text-center",
              isLogin ? "text-white" : "text-gray-400 dark:text-gray-500"
            )}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError('');
              setSuccess('');
            }}
            className={cn(
              "flex-1 py-3 text-xs font-bold rounded-xl transition-all relative z-10 cursor-pointer text-center",
              !isLogin ? "text-white" : "text-gray-400 dark:text-gray-500"
            )}
          >
            Criar Conta
          </button>

          {/* Animated Tab Background Indicator */}
          <motion.div
            layoutId="activeAuthTab"
            className="absolute top-1.5 bottom-1.5 bg-[#FF5722] rounded-xl shadow-md pointer-events-none"
            style={{
              width: "calc(50% - 6px)",
              left: isLogin ? "6px" : "calc(50%)"
            }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-[#1C262E] border border-gray-200/60 dark:border-gray-800/80 rounded-3xl p-6 shadow-2xl space-y-6">
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-2xl flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-2xl flex items-center gap-2"
              >
                <Check className="w-4 h-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* NAME FIELD FOR SIGNUP */}
            <AnimatePresence initial={false}>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase px-1">Nome e Sobrenome</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Nome"
                      className="w-full bg-gray-50 dark:bg-[#141D23] border border-gray-200/60 dark:border-gray-800/85 rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722] transition-all"
                    />
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* EMAIL FIELD */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase px-1">E-mail</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@email.com"
                  className="w-full bg-gray-50 dark:bg-[#141D23] border border-gray-200/60 dark:border-gray-800/85 rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722] transition-all"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* PASSWORD FIELD */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Senha</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => alert(`Sua senha pré-configurada é "123"`)}
                    className="text-[10px] font-bold text-[#FF5722] hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 dark:bg-[#141D23] border border-gray-200/60 dark:border-gray-800/85 rounded-2xl pl-10 pr-11 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722] transition-all"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-205 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF5722] hover:bg-[#eb4b18] text-white text-xs font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-orange-500/10 active:scale-98 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider mt-6 h-12"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Entrar' : 'Registrar & Entrar'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>



        </div>

      </div>
    </div>
  );
}

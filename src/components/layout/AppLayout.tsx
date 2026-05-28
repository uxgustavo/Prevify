import React, { useState, useRef, useEffect } from 'react';
import { BottomNav } from './BottomNav';
import { AddTransactionModal } from '../../features/transactions/AddTransactionModal';
import { TransactionTypeModal } from '../../features/transactions/TransactionTypeModal';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { TransactionType } from '../../types';
import { cn } from '../../lib/utils';
import { AlignJustify, Calculator, Tags, Settings, Plus } from 'lucide-react';

export function AppLayout() {
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<TransactionType>('SAIDA');

  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  const handleSelectType = (type: TransactionType) => {
    setSelectedType(type);
    setIsTypeModalOpen(false);
    setTimeout(() => setIsAddModalOpen(true), 250);
  };

  const navItems = [
    { icon: AlignJustify, label: 'Saldos', path: '/' },
    { icon: Calculator, label: 'Totais', path: '/totais' },
    { icon: Tags, label: 'Tags', path: '/tags' },
    { icon: Settings, label: 'Ajustes', path: '/menu' },
  ];

  return (
    <div className="flex h-screen w-full flex-col lg:flex-row bg-gray-50 dark:bg-[#141D23] overflow-hidden transition-colors">
      {/* Sidebar for tablet/desktop */}
      <aside className="hidden lg:flex flex-col w-64 h-full bg-white dark:bg-[#1C262E] border-r border-gray-100/70 dark:border-[#141D23]/50 p-6 flex-shrink-0 relative transition-colors">
        <div className="flex items-center justify-center mb-8 select-none">
          <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 font-sans">Prevify</span>
        </div>
        
        {/* Navigation links */}
        <nav className="flex-grow space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center w-full gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all cursor-pointer font-sans text-left",
                  isActive 
                    ? "bg-[#FF5722] text-white shadow-sm" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                )}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Add Transaction Button in Sidebar */}
        <div className="pt-4 mt-auto border-t border-gray-100 dark:border-gray-800/60 font-sans">
          <button
            onClick={() => setIsTypeModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#1A1A1A] dark:bg-white text-white dark:text-gray-950 font-bold text-sm tracking-wide rounded-xl shadow-md transition-all active:scale-[0.98] hover:opacity-90 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Transação
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div ref={scrollRef} className="flex-grow flex flex-col h-full overflow-y-auto no-scrollbar relative w-full">
        <main className="flex-1 w-full lg:max-w-6xl mx-auto py-0 lg:py-8 px-0 lg:px-6 min-h-full pb-0 lg:pb-8">
          <Outlet />
        </main>

        {/* Bottom Navigation (Mobile & Tablet) */}
        <div className="fixed bottom-0 w-full left-0 lg:hidden z-40">
          <BottomNav onAddClick={() => setIsTypeModalOpen(true)} />
        </div>
      </div>

      {/* Global Modals */}
      <TransactionTypeModal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        onSelect={handleSelectType}
      />

      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        initialType={selectedType}
      />
    </div>
  );
}

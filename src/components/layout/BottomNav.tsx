import React from 'react';
import { cn } from '../../lib/utils';
import { AlignJustify, Calculator, Tags, Settings, Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export function BottomNav({ onAddClick }: { onAddClick: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: AlignJustify, label: 'Saldos', path: '/' },
    { icon: Calculator, label: 'Totais', path: '/totais' },
    { isAdd: true },
    { icon: Tags, label: 'Tags', path: '/tags' },
    { icon: Settings, label: 'Ajustes', path: '/menu' },
  ];

  return (
    <div className="w-full bg-white dark:bg-[#141D23] border-t border-gray-100 dark:border-gray-800 pb-[var(--safe-area-bottom)] safe-p-b shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      <div className="flex h-[60px] items-center justify-around px-2 relative">
        {navItems.map((item, index) => {
          if (item.isAdd) {
            return (
              <div key="add" className="relative -top-3 flex flex-col items-center justify-center">
                <button 
                  onClick={onAddClick}
                  className="flex h-[52px] w-[52px] shadow-sm items-center justify-center rounded-full bg-[#1A1A1A] dark:bg-white dark:text-gray-950 text-white active:scale-95 transition-transform"
                >
                  <Plus className="h-7 w-7" />
                </button>
              </div>
            );
          }

          const Icon = item.icon!;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={index}
              onClick={() => navigate(item.path!)}
              className={cn(
                "flex flex-col items-center justify-center w-16 gap-1 border-t-2 pt-1.5 -mt-1.5",
                isActive ? "text-[#F15A2B] border-[#F15A2B]" : "text-gray-900 dark:text-gray-400 border-transparent"
              )}
            >
              <Icon className={cn("h-[22px] w-[22px]", isActive ? "stroke-[2.5px]" : "stroke-2")} />
              <span className={cn("text-[10px] font-bold tracking-wide", isActive ? "text-[#F15A2B]" : "text-gray-900 dark:text-gray-400")}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

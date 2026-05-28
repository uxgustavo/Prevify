import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, Edit2, RotateCcw, Trash2, Plus, X, Tag } from 'lucide-react';
import { MainHeader } from '../../components/layout/MainHeader';
import { useFinanceStore, CustomTag } from '../../store/useFinanceStore';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

export function Tags() {
  const transactions = useFinanceStore((state) => state.transactions);
  const customTags = useFinanceStore((state) => state.customTags);
  const addCustomTag = useFinanceStore((state) => state.addCustomTag);
  const deleteCustomTag = useFinanceStore((state) => state.deleteCustomTag);
  const selectedDate = useFinanceStore((state) => state.selectedDate);

  const [filterText, setFilterText] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New Tag Form state
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('bg-orange-100');
  const [newTagIcon, setNewTagIcon] = useState('🏷️');

  const presetColors = [
    { bg: 'bg-orange-100', text: 'Laranja' },
    { bg: 'bg-yellow-105', text: 'Amarelo' },
    { bg: 'bg-pink-100', text: 'Rosa' },
    { bg: 'bg-purple-100', text: 'Roxo' },
    { bg: 'bg-emerald-100', text: 'Verde' },
    { bg: 'bg-blue-100', text: 'Azul' },
    { bg: 'bg-rose-100', text: 'Vermelho' },
    { bg: 'bg-slate-100', text: 'Cinza' },
  ];

  const presetEmojis = ['🏷️', '📁', '✈️', '🍔', '🚗', '🛒', '💸', '🏠', '🎮', '💡', '🎓', '🏥', '🍿'];

  // Dynamically compound all tags from transactions and customTags to avoid missing any
  const allUniqueTags = useMemo(() => {
    // Collect all tag names in use
    const tagsInUse = new Set<string>();
    transactions.forEach(t => {
      if (t.tags) {
        t.tags.forEach(tg => {
          if (tg.trim()) {
            tagsInUse.add(tg.trim());
          }
        });
      }
    });

    // Start with custom tags list
    const computedList: CustomTag[] = [...customTags];

    // For any tag currently in use in transactions that is not in computedList, append it with default decoration
    tagsInUse.forEach(tagInUseName => {
      if (!computedList.some(ct => ct.name.toLowerCase() === tagInUseName.toLowerCase())) {
        computedList.push({
          name: tagInUseName,
          color: 'bg-orange-100',
          icon: '🏷️'
        });
      }
    });

    return computedList;
  }, [transactions, customTags]);

  // Compute total accumulated amount for each tag in the selected month
  const tagsWithAmounts = useMemo(() => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    return allUniqueTags.map(tag => {
      // Sum of transaction amounts that match this tag AND are in the selected month
      const amount = transactions
        .filter(t => {
          const isMatchingTag = t.tags && t.tags.some(tg => tg.toLowerCase() === tag.name.toLowerCase());
          if (!isMatchingTag) return false;
          const tDate = parseISO(t.date);
          return isWithinInterval(tDate, { start: monthStart, end: monthEnd });
        })
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        ...tag,
        amount
      };
    });
  }, [allUniqueTags, transactions, selectedDate]);

  // Handle Filtering
  const filteredTags = useMemo(() => {
    if (!filterText.trim()) return tagsWithAmounts;
    const lowerFilter = filterText.toLowerCase();
    return tagsWithAmounts.filter(tag => tag.name.toLowerCase().includes(lowerFilter));
  }, [tagsWithAmounts, filterText]);

  // Create Tag Action
  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newTagName.trim();
    if (!cleanName) return;

    addCustomTag({
      name: cleanName,
      color: newTagColor,
      icon: newTagIcon,
    });

    // Reset Form
    setNewTagName('');
    setNewTagColor('bg-orange-100');
    setNewTagIcon('🏷️');
    setIsAddingNew(false);
  };

  const handleResetFilters = () => {
    setFilterText('');
  };

  return (
    <div className="flex flex-col min-h-full bg-white dark:bg-[#141D23] pb-28 lg:pb-0 relative overflow-visible lg:overflow-hidden lg:rounded-[25px] lg:border lg:border-gray-100 lg:dark:border-gray-800/60 lg:shadow-md text-gray-900 dark:text-gray-100 transition-colors">
       <MainHeader />
       
       <div className="px-5 pt-4">
         
         {/* Title area with controls */}
         <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-semibold text-gray-400 dark:text-gray-500">Tags</h2>
            <div className="flex items-center gap-4 text-gray-600">
               <button 
                 onClick={() => setIsEditMode(!isEditMode)} 
                 className={`p-1 rounded-md transition-colors ${isEditMode ? 'text-red-500 bg-red-100 dark:bg-red-950/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                 title="Modo Edição / Exclusão"
               >
                  <Edit2 className="w-[18px] h-[18px]" strokeWidth={2} />
               </button>
               <button 
                 onClick={handleResetFilters} 
                 className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                 title="Limpar Filtro"
               >
                  <RotateCcw className="w-[20px] h-[20px]" strokeWidth={2} />
               </button>
            </div>
         </div>

         {/* Search Input Filter */}
         <div className="flex items-center gap-3 bg-gray-50/80 dark:bg-[#1C262E] rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-800 mb-4 transition-colors">
            <Search className="w-5 h-5 text-gray-400" strokeWidth={2} />
            <input 
              type="text" 
              placeholder="Filtrar tags" 
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-[15px] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 font-medium" 
            />
            {filterText && (
              <button onClick={() => setFilterText('')} className="p-0.5 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
         </div>

         {/* Add New Tag Expanding Button/Form */}
         <div className="mb-6">
           {!isAddingNew ? (
             <button
               onClick={() => setIsAddingNew(true)}
               className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-[#8B5CF6] dark:hover:border-[#8B5CF6] hover:text-[#8B5CF6] text-gray-500 dark:text-gray-400 rounded-xl transition-all font-bold text-sm"
             >
               <Plus className="w-4 h-4" />
               Nova Tag Personalizada
             </button>
           ) : (
             <form onSubmit={handleCreateTag} className="bg-gray-50 dark:bg-[#1C262E] border border-gray-100 dark:border-gray-800 rounded-xl p-4 space-y-4 transition-colors">
               <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                 <span className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
                   <Tag className="w-4 h-4 text-[#8B5CF6]" /> Nova Tag
                 </span>
                 <button 
                   type="button" 
                   onClick={() => setIsAddingNew(false)} 
                   className="text-gray-400 hover:text-gray-600"
                 >
                   <X className="w-4 h-4" />
                 </button>
               </div>

               {/* Tag Name Input */}
               <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Nome da Tag</label>
                 <input
                   type="text"
                   placeholder="Ex: Viagem, Acadêmico, Presentes"
                   value={newTagName}
                   onChange={(e) => setNewTagName(e.target.value)}
                   className="w-full bg-white dark:bg-[#141D23] border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#8B5CF6]"
                   autoFocus
                   required
                 />
               </div>

               {/* Icon/Emoji Selector */}
               <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1.5">Emoji</label>
                 <div className="flex flex-wrap gap-2">
                   {presetEmojis.map(emoji => (
                     <button
                       key={emoji}
                       type="button"
                       onClick={() => setNewTagIcon(emoji)}
                       className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-transform ${newTagIcon === emoji ? 'bg-white dark:bg-[#1C262E] border-2 border-[#8B5CF6] scale-110 shadow-sm text-gray-800 dark:text-gray-100' : 'bg-white dark:bg-[#141D23] border border-gray-100 dark:border-gray-800 hover:scale-105 text-gray-800 dark:text-gray-100'}`}
                     >
                       {emoji}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Color Selector */}
               <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1.5">Cor</label>
                 <div className="flex flex-wrap gap-2">
                   {presetColors.map(color => (
                     <button
                       key={color.bg}
                       type="button"
                       onClick={() => setNewTagColor(color.bg)}
                       className={`w-6 h-6 rounded-full border border-gray-200 dark:border-gray-800 transition-transform ${newTagColor === color.bg ? 'scale-125 border-[#8B5CF6] ring-2 ring-violet-200' : 'hover:scale-110'} ${color.bg}`}
                       title={color.text}
                     />
                   ))}
                 </div>
               </div>

               {/* Save Button */}
               <button
                 type="submit"
                 className="w-full bg-[#8B5CF6] hover:bg-[#7c4fe0] text-white text-sm font-bold py-2.5 rounded-lg transition-colors shadow-sm"
               >
                 Salvar Nova Tag
               </button>
             </form>
           )}
         </div>

         {/* Tags List Container */}
         <div id="root_tags_list" className="flex flex-col">
            {filteredTags.length === 0 ? (
               <div className="text-center py-12 bg-gray-50 dark:bg-[#1C262E]/30 rounded-2xl border border-gray-100/50 dark:border-gray-800/40">
                  <Tag className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-sm font-bold text-gray-400 dark:text-gray-500">Nenhuma tag cadastrada ou em uso</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Crie uma tag personalizada ou adicione tags ao lançar movimentações!</p>
               </div>
            ) : (
               filteredTags.map((tag, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800/40 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 rounded-lg px-2 transition-colors">
                     <div className="flex items-center gap-3">
                        <div className="w-[22px] h-[22px] relative flex items-center justify-center">
                           <div className={`absolute inset-0 ${tag.color || 'bg-orange-100'} rounded-sm opacity-100`} style={{ clipPath: 'polygon(0 0, 80% 0, 100% 20%, 100% 100%, 0 100%)' }} />
                           <span className="relative z-10 text-[10px] pb-0.5">{tag.icon || '🏷️'}</span>
                        </div>
                        <span className="font-bold text-[15px] text-gray-900 dark:text-gray-100">{tag.name}</span>
                     </div>
                     
                     <div className="flex items-center gap-3">
                        <span className="font-bold text-[15px] text-gray-950 dark:text-gray-100">
                           R$ {tag.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </span>
                        
                        {/* Little trash can while edit mode is on */}
                        {isEditMode && (
                           <button
                             onClick={() => deleteCustomTag(tag.name)}
                             className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-950/20 p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors"
                             title="Excluir Tag"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        )}
                     </div>
                  </div>
               ))
            )}
         </div>

       </div>
    </div>
  );
}

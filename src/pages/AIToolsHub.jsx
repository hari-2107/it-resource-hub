import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { RatingReviewComponent } from '../components/RatingReviewComponent';
import { 
  Sparkles, 
  ExternalLink, 
  Bookmark, 
  Plus, 
  Edit2, 
  Trash2, 
  Tag, 
  Check, 
  Star,
  Search,
  Clock
} from 'lucide-react';

export const AIToolsHub = ({ onOpenAdminForm }) => {
  const { aiTools, removeAITool, favorites, toggleFavoriteItem } = useData();
  const { currentUser, isAdmin } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Coding',
    'Writing',
    'Research',
    'Design',
    'Productivity',
    'Resume/Career'
  ];

  const filteredTools = aiTools.filter(tool => {
    if (selectedCategory === 'All') return true;
    return tool.category === selectedCategory;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated AI Study Assistants</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">AI Tools Hub for IT Students</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Hand-picked generative AI tools to accelerate coding, technical writing, research paper synthesis, and resume crafting.
          </p>
        </div>

        {/* Admin Add Tool Button */}
        {isAdmin && (
          <button
            onClick={() => onOpenAdminForm('aitool')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New AI Tool</span>
          </button>
        )}
      </div>

      {/* Category Chips Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* AI TOOLS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => {
          const isFav = favorites?.aiToolIds?.includes(tool.id);
          return (
            <div
              key={tool.id}
              className="glass-card rounded-3xl p-6 flex flex-col justify-between space-y-4 border border-slate-800 relative group"
            >
              <div className="space-y-4">
                
                {/* Logo, Pricing, & Actions */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 p-2.5 flex items-center justify-center border border-slate-800 shadow-md">
                      <img src={tool.logoUrl} alt={tool.name} className="w-7 h-7 object-contain" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">
                        {tool.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] text-brand-400 font-semibold">{tool.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      tool.pricing === 'Free' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      tool.pricing === 'Freemium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      {tool.pricing}
                    </span>

                    {currentUser && (
                      <button
                        onClick={() => toggleFavoriteItem('aitool', tool.id)}
                        className={`p-1.5 rounded-xl border transition-all ${
                          isFav
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                        title={isFav ? "Remove Bookmark" : "Save to Favorites"}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                      </button>
                    )}

                    {isAdmin && (
                      <div className="flex items-center space-x-1 pl-1 border-l border-slate-800">
                        <button
                          onClick={() => onOpenAdminForm('aitool', tool)}
                          className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-emerald-400 border border-slate-800"
                          title="Edit Tool"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeAITool(tool.id)}
                          className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800"
                          title="Delete Tool"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {tool.description}
                </p>

                {/* Tag Pills */}
                {tool.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(Array.isArray(tool.tags) ? tool.tags : tool.tags.split(',')).map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-400 border border-slate-800">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Date, Rating & Action Button */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-slate-500" />
                    Added: {tool.addedDate || '2026-07-20'}{tool.addedTime ? ` • ${tool.addedTime}` : ''}
                  </span>
                </div>

                {/* 1-5 Star Rating & Review Widget */}
                <RatingReviewComponent targetId={tool.id} targetType="aitool" />

                <a
                  href={tool.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white transition-all flex items-center justify-center space-x-2 shadow-lg shadow-brand-600/20"
                >
                  <span>Visit Official Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

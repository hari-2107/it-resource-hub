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
    'Resume/Career',
    'App Building',
    'Website Building'
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
              className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between space-y-4 border border-slate-800 relative group"
            >
              <div className="space-y-4">
                
                {/* AI Tool Photo Preview Banner */}
                <div className="h-32 w-full relative overflow-hidden bg-slate-900">
                  <img
                    src={tool.photoUrl || 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80'}
                    alt={tool.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Logo Badge & Category Overlay */}
                  <div className="absolute bottom-3 left-4 flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-950 p-2 flex items-center justify-center border border-slate-800 shadow-xl backdrop-blur-md">
                      <img
                        src={tool.logoUrl}
                        alt={tool.name}
                        className="w-7 h-7 object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                      <Sparkles className="w-5 h-5 text-amber-400 hidden" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white drop-shadow-md group-hover:text-brand-300 transition-colors">
                        {tool.name}
                      </h3>
                      <span className="text-[11px] text-amber-400 font-bold drop-shadow-sm">{tool.category}</span>
                    </div>
                  </div>

                  {/* Pricing & Bookmark Overlay */}
                  <div className="absolute top-3 right-3 flex items-center space-x-1.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md shadow-md ${
                      tool.pricing === 'Free' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' :
                      tool.pricing === 'Freemium' ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40' :
                      'bg-purple-950/80 text-purple-300 border border-purple-500/40'
                    }`}>
                      {tool.pricing}
                    </span>

                    {currentUser && (
                      <button
                        onClick={() => toggleFavoriteItem('aitool', tool.id)}
                        className={`p-1.5 rounded-xl border backdrop-blur-md shadow-md transition-all ${
                          isFav
                            ? 'bg-amber-500/30 text-amber-300 border-amber-500/50'
                            : 'bg-slate-950/80 text-slate-300 border-slate-700 hover:text-white'
                        }`}
                        title={isFav ? "Remove Bookmark" : "Save to Favorites"}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                      </button>
                    )}

                    {isAdmin && (
                      <div className="flex items-center space-x-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 backdrop-blur-md">
                        <button
                          onClick={() => onOpenAdminForm('aitool', tool)}
                          className="p-1 rounded-lg text-slate-300 hover:text-emerald-400"
                          title="Edit Tool"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeAITool(tool.id)}
                          className="p-1 rounded-lg text-slate-300 hover:text-rose-400"
                          title="Delete Tool"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-4">

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {tool.description}
                </p>

                {/* Best For Use-Case Blurb */}
                {tool.bestFor && (
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 font-semibold leading-relaxed flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Best for:</strong> {tool.bestFor}</span>
                  </div>
                )}

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
            </div>

            {/* Date, Rating & Action Button */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-slate-500" />
                    Added: {tool.addedDate || '2026-07-20'}{tool.addedTime ? ` • ${tool.addedTime}` : ''}
                  </span>
                  {tool.lastVerified && (
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center">
                      <Check className="w-3 h-3 mr-1 text-emerald-400" />
                      Verified: {tool.lastVerified}
                    </span>
                  )}
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

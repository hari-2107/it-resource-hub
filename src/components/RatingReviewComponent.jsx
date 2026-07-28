import React, { useState } from 'react';
import { Star, MessageSquare, ChevronDown, ChevronUp, Send, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export const RatingReviewComponent = ({ targetId, targetType = 'material' }) => {
  const { ratings, submitRating } = useData();
  const { currentUser } = useAuth();

  const [expanded, setExpanded] = useState(false);
  const [userStars, setUserStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  // Filter ratings for this item
  const itemRatings = (ratings || []).filter(r => r.targetId === targetId);
  const totalCount = itemRatings.length;
  const averageRating = totalCount > 0
    ? (itemRatings.reduce((sum, r) => sum + r.stars, 0) / totalCount).toFixed(1)
    : 0;

  // Check if current user already rated
  const userRating = itemRatings.find(r => r.userId === currentUser?.uid);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) return;
    submitRating(targetId, targetType, {
      stars: userStars,
      comment: commentText.trim()
    });
    setCommentText('');
    setSubmittedMessage(true);
    setTimeout(() => setSubmittedMessage(false), 3000);
  };

  return (
    <div className="space-y-3 text-xs">
      {/* Rating Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full text-amber-400 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{averageRating > 0 ? averageRating : 'New'}</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {totalCount > 0 ? `(${totalCount} ${totalCount === 1 ? 'rating' : 'ratings'})` : 'No ratings yet'}
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold flex items-center space-x-1"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{expanded ? 'Hide Reviews' : 'Rate & Reviews'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Panel */}
      {expanded && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 animate-fadeIn">
          
          {/* Rate Form */}
          {currentUser ? (
            <form onSubmit={handleSubmit} className="space-y-3 pb-3 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-200">
                  {userRating ? 'Update Your Rating:' : 'Leave a Rating:'}
                </span>
                {submittedMessage && (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Rating saved!
                  </span>
                )}
              </div>

              {/* Interactive Star Picker */}
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserStars(star)}
                    onMouseEnter={() => setHoverStars(star)}
                    onMouseLeave={() => setHoverStars(0)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        (hoverStars || userStars) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-[11px] font-bold text-amber-300 ml-2">
                  {hoverStars || userStars} / 5 Stars
                </span>
              </div>

              {/* Comment Box */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a review note (e.g. Excellent notes for exam prep!)..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-950 text-xs text-white rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center space-x-1 shadow-md shadow-brand-600/20"
                >
                  <Send className="w-3 h-3" />
                  <span>Submit</span>
                </button>
              </div>
            </form>
          ) : (
            <p className="text-[11px] text-slate-400 italic">Please log in to submit a rating.</p>
          )}

          {/* Student Reviews List */}
          <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-none">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Student Reviews</h4>
            {itemRatings.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">Be the first to review this resource!</p>
            ) : (
              itemRatings.map((rev) => (
                <div key={rev.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{rev.userName}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-amber-300">{rev.stars}</span>
                    </div>
                  </div>
                  {rev.comment && <p className="text-slate-300 text-[11px] leading-relaxed">{rev.comment}</p>}
                  <span className="text-[9px] text-slate-500 block text-right">{rev.ratedAt}</span>
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  );
};

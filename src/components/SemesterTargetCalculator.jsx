import React from 'react';
import { Target, AlertTriangle, Sparkles, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { calculateAllGradeTargets } from '../utils/targetCalculatorUtils';

export const SemesterTargetCalculator = ({ internalMark }) => {
  const isInternalAvailable = internalMark !== null && internalMark !== undefined && !isNaN(internalMark);
  const targets = calculateAllGradeTargets(isInternalAvailable ? internalMark : null);

  return (
    <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-slate-900/90 space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <span>🎯 Semester Exam Target Calculator</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Based on your current estimated internal mark, see how much you should aim for in the Semester End Examination to reach your target final grade.
          </p>
        </div>

        {/* Current Estimated Internal Mark Display */}
        <div className="px-4 py-2 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 flex items-center space-x-2">
          <span className="text-xs font-semibold text-indigo-300">Current Estimated Internal Mark:</span>
          <span className="text-sm font-black text-white">
            {isInternalAvailable ? `${internalMark.toFixed(1)}/40` : '--/40'}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {!isInternalAvailable ? (
        /* Edge Case 3: Missing Inputs Banner */
        <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
          <Info className="w-8 h-8 text-brand-400 mx-auto" />
          <p className="text-sm font-bold text-slate-200">
            Enter both Internal 1 and Internal 2 marks above to see your Semester Exam target suggestions.
          </p>
          <p className="text-xs text-slate-400">
            The target calculator automatically reads your estimated internal mark (out of 40) once both 50-mark internal exams are entered.
          </p>
        </div>
      ) : (
        /* Target Suggestions Cards Grid */
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              🎯 Semester Exam Target Suggestions
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {targets.map((item) => {
              const { calcResult, isProminent } = item;
              const { status, displayValue, suggestion, message } = calcResult;

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 relative overflow-hidden ${
                    isProminent
                      ? 'bg-gradient-to-br from-amber-950/40 to-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                      : status === 'achievable'
                      ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      : status === 'already_achieved'
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-rose-950/20 border-rose-500/30'
                  }`}
                >
                  {isProminent && (
                    <div className="absolute top-0 right-0 px-2.5 py-0.5 rounded-bl-xl text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                      Highest Target
                    </div>
                  )}

                  {/* Card Header: Icon & Grade Name */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{item.icon}</span>
                      <h5 className={`text-base font-extrabold ${isProminent ? 'text-amber-300' : 'text-white'}`}>
                        {item.grade}
                      </h5>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      Target Final Mark: <strong className="text-slate-200">{item.targetFinalMark}/100</strong>
                    </p>
                  </div>

                  {/* Card Body: Semester Exam Target / Edge Case status */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-1">
                    {status === 'achievable' ? (
                      <>
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="text-slate-400 font-medium">Semester Exam Target:</span>
                          <span className="text-sm font-black text-indigo-300">{displayValue}</span>
                        </div>
                        <p className="text-[11px] font-semibold text-emerald-400 pt-0.5 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 inline text-emerald-400 mr-1" />
                          <span>{suggestion}</span>
                        </p>
                      </>
                    ) : status === 'already_achieved' ? (
                      <p className="text-xs font-semibold text-emerald-400 flex items-start space-x-1.5 pt-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{message}</span>
                      </p>
                    ) : (
                      <p className="text-xs font-semibold text-rose-400 flex items-start space-x-1.5 pt-1">
                        <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                        <span>{message}</span>
                      </p>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mandatory Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 flex items-start space-x-3 text-xs">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-300 uppercase tracking-wide text-[11px]">⚠️ DISCLAIMER:</p>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            "This calculator provides estimated target marks for personal academic planning only. It is NOT an official mark calculator and does not guarantee any grade or result. Actual marks and grades may vary according to official college/university regulations, evaluation methods, moderation, rounding, and other academic rules."
          </p>
        </div>
      </div>

    </div>
  );
};

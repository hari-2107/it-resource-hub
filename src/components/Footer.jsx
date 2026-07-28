import React from 'react';
import { GraduationCap, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center shadow-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">IT Student Resource Hub</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              Empowering Information Technology students with instant access to verified lecture notes, question banks, AI study tools, lab workbooks, and real-time class timetables.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Quick Categories</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="hover:text-brand-300 transition-colors cursor-pointer">Lecture Notes & Slides</li>
              <li className="hover:text-brand-300 transition-colors cursor-pointer">Lab Manuals & Practical Code</li>
              <li className="hover:text-brand-300 transition-colors cursor-pointer">Previous Year Exam Papers</li>
              <li className="hover:text-brand-300 transition-colors cursor-pointer">Curriculum & Syllabus</li>
              <li className="hover:text-brand-300 transition-colors cursor-pointer">AI Tools Recommendations</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} whitedevilt. All rights reserved.</p>
          <div className="flex items-center space-x-1 text-slate-400">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for IT Students</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

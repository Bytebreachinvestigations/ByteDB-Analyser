
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/20">
              <i className="fas fa-shield-halved text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100 glow-text">
                OMNIDB <span className="text-sky-400">FORENSIC</span>
              </h1>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-tight">
                Unified Investigation Suite
              </p>
            </div>
          </div>

          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-slate-300 hover:text-sky-400 text-sm font-medium transition-colors">Dashboard</a>
            <a href="#" className="text-sky-400 text-sm font-medium transition-colors border-b-2 border-sky-400 pb-5 translate-y-[1px]">Investigations</a>
            <a href="#" className="text-slate-300 hover:text-sky-400 text-sm font-medium transition-colors">Knowledge Base</a>
            <a href="#" className="text-slate-300 hover:text-sky-400 text-sm font-medium transition-colors">Settings</a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-sky-400 transition-colors">
              <i className="fas fa-bell text-lg"></i>
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <i className="fas fa-user-secret text-slate-400"></i>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

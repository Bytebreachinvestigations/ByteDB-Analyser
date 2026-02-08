
import React, { useState } from 'react';
import { DATABASE_CATEGORIES } from '../constants';

interface Props {
  onSelect: (db: string) => void;
  selectedDb?: string;
}

const DatabaseSearch: React.FC<Props> = ({ onSelect, selectedDb }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredDbs = DATABASE_CATEGORIES.flatMap(cat => 
    cat.systems.map(sys => ({ name: sys, category: cat.category }))
  ).filter(db => db.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-400 mb-2">Select Database System Under Investigation</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i className="fas fa-database text-slate-500"></i>
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all placeholder:text-slate-600"
          placeholder="Search 400+ database systems..."
          value={searchTerm || selectedDb || ''}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {selectedDb && !searchTerm && (
          <button 
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => onSelect('')}
          >
            <i className="fas fa-times text-slate-500 hover:text-slate-300"></i>
          </button>
        )}
      </div>

      {isOpen && searchTerm && (
        <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto cyber-border">
          {filteredDbs.length > 0 ? (
            filteredDbs.map((db, idx) => (
              <button
                key={idx}
                className="w-full text-left px-4 py-2 hover:bg-slate-700 flex items-center justify-between group"
                onClick={() => {
                  onSelect(db.name);
                  setSearchTerm('');
                  setIsOpen(false);
                }}
              >
                <span className="text-slate-200 group-hover:text-sky-400 transition-colors">{db.name}</span>
                <span className="text-[10px] font-mono text-slate-500 uppercase">{db.category}</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-4 text-center text-slate-500 italic">No matching database found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatabaseSearch;

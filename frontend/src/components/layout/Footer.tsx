import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-slate-500 text-sm">
      <div className="max-w-7xl mx-auto px-4">
        <p>© {new Date().getFullYear()} SkillForge AI. Forge Your Skills. Build Your Future.</p>
      </div>
    </footer>
  );
};

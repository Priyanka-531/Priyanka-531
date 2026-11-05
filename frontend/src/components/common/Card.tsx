import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl p-6 shadow-xl ${className}`}>
      {children}
    </div>
  );
};

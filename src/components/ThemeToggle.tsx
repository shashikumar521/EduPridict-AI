import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 cursor-pointer border ${
        isLight
          ? 'bg-[#F0F3F9] text-[#172033] hover:text-[#7000E8] border-[#E1E6EF] hover:bg-white shadow-xs'
          : 'bg-[#182236] text-slate-300 hover:text-white border-[#1E2B42] hover:bg-[#1F2C46]'
      } ${className}`}
    >
      {isLight ? (
        <Moon className="w-4 h-4 text-[#7000E8] transition-transform duration-200 hover:-rotate-12" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
      )}
    </button>
  );
};

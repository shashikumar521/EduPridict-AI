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
          ? 'bg-[#F0F3F8] text-[#11182E] hover:text-[#8000E8] border-[#E9E5F2] hover:bg-white shadow-xs'
          : 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-800 hover:bg-zinc-800'
      } ${className}`}
    >
      {isLight ? (
        <Moon className="w-4 h-4 text-[#8000E8] transition-transform duration-200 hover:-rotate-12" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
      )}
    </button>
  );
};

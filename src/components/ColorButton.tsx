import React from 'react';
import { ColorOption } from '../types/database';

interface ColorButtonProps {
  color: ColorOption;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const colorStyles = {
  red: 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 border-red-400',
  green: 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 border-emerald-400',
  blue: 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 border-blue-400',
  yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 border-yellow-400',
};

export function ColorButton({ color, selected, onClick, disabled = false }: ColorButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl transition-all duration-200 transform border-2
        ${colorStyles[color]}
        ${selected ? 'scale-105 shadow-lg shadow-white/20 border-white' : 'border-transparent hover:scale-102'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-[#00d4aa] focus:ring-offset-2 focus:ring-offset-[#0f212e]
      `}
    >
      <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-200" />
      <span className="relative z-10 text-white font-bold text-sm sm:text-base capitalize drop-shadow-lg">
        {color}
      </span>
      {selected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#00d4aa] rounded-full border-2 border-[#0f212e]" />
      )}
    </button>
  );
}
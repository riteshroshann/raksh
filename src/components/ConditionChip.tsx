import React from 'react';
import type { Condition } from '../lib/types';
import { CONDITION_COLORS, CONDITION_BG } from '../lib/utils';

interface ConditionChipProps {
  condition: Condition;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export function ConditionChip({ condition, selected, onClick, size = 'md' }: ConditionChipProps) {
  const color = CONDITION_COLORS[condition];
  const bg = CONDITION_BG[condition];

  const base = 'inline-flex items-center gap-1.5 rounded-full font-medium border transition-all duration-150';
  const sizes = size === 'sm'
    ? 'px-2.5 py-0.5 text-xs'
    : 'px-3 py-1.5 text-sm';

  const style = selected
    ? { background: color, color: 'white', borderColor: color }
    : { background: bg, color, borderColor: `${color}33` };

  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={`${base} ${sizes} ${onClick ? 'cursor-pointer active:scale-95' : 'cursor-default'}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: selected ? 'white' : color }}
      />
      {condition}
    </button>
  );
}

import React from 'react';
import type { VitalStatus } from '../lib/types';
import { STATUS_LABELS, STATUS_CLASSES } from '../lib/utils';

interface StatusBadgeProps {
  status: VitalStatus;
  /** Override label text */
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
  return (
    <span className={`${STATUS_CLASSES[status]} ${className}`}>
      {label ?? STATUS_LABELS[status]}
    </span>
  );
}

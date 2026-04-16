import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info';

interface ToastProps {
  open: boolean;
  message: string;
  variant?: ToastVariant;
  onClose: () => void;
  duration?: number;
}

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const COLORS = {
  success: { bg: 'var(--success-light)', text: 'var(--success)', border: '#BBF7D0' },
  error:   { bg: 'var(--danger-light)',  text: 'var(--danger)',  border: '#FECACA' },
  info:    { bg: 'var(--info-light)',    text: 'var(--info)',    border: '#BFDBFE' },
};

export function Toast({ open, message, variant = 'success', onClose, duration = 2500 }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  const Icon = ICONS[variant];
  const colors = COLORS[variant];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          className="fixed bottom-24 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none"
        >
          <div
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border max-w-sm w-full"
            style={{ background: colors.bg, borderColor: colors.border }}
          >
            <Icon size={18} style={{ color: colors.text, flexShrink: 0 }} />
            <p className="text-sm font-medium flex-1" style={{ color: colors.text }}>
              {message}
            </p>
            <button
              onClick={onClose}
              className="w-5 h-5 flex items-center justify-center rounded-full opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: colors.text }}
            >
              <X size={12} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useToast() {
  const [state, setState] = React.useState<{
    open: boolean;
    message: string;
    variant: ToastVariant;
  }>({ open: false, message: '', variant: 'success' });

  const show = React.useCallback((message: string, variant: ToastVariant = 'success') => {
    setState({ open: true, message, variant });
  }, []);

  const hide = React.useCallback(() => {
    setState(prev => ({ ...prev, open: false }));
  }, []);

  return { ...state, show, hide };
}

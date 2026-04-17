// Glass Effect Components for Raksh
import React from 'react';

interface GlassProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const GlassFilter: React.FC = () => (
  <svg style={{ display: 'none' }} aria-hidden>
    <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
      <feTurbulence type="fractalNoise" baseFrequency="0.001 0.005" numOctaves="1" seed="17" result="turbulence" />
      <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
        <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
        <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
      </feComponentTransfer>
      <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
      <feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1" specularExponent="100" lightingColor="white" result="specLight">
        <fePointLight x="-200" y="-200" z="300" />
      </feSpecularLighting>
      <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage" />
      <feDisplacementMap in="SourceGraphic" in2="softMap" scale="200" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>
);

export const GlassCard: React.FC<GlassProps> = ({ children, className = '', style = {}, onClick }) => (
  <div
    onClick={onClick}
    className={`relative overflow-hidden ${className}`}
    style={{
      boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 1.5px 4px rgba(0,0,0,0.06)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      background: 'rgba(255,255,255,0.72)',
      border: '1px solid rgba(255,255,255,0.55)',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
      ...style,
    }}
  >
    {/* Shimmer top edge */}
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(255,255,255,0.2)',
      borderRadius: 'inherit',
    }} />
    <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
  </div>
);

export const GlassCardDark: React.FC<GlassProps> = ({ children, className = '', style = {}, onClick }) => (
  <div
    onClick={onClick}
    className={`relative overflow-hidden ${className}`}
    style={{
      boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 1.5px 4px rgba(0,0,0,0.2)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      background: 'rgba(20,20,28,0.65)',
      border: '1px solid rgba(255,255,255,0.09)',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
      ...style,
    }}
  >
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(255,255,255,0.04)',
      borderRadius: 'inherit',
    }} />
    <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
  </div>
);

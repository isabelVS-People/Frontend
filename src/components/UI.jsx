import { useState } from 'react';

const V = '#7F56FA';
const VL = '#EEEDFE';
const VD = '#3C3489';
const VM = '#534AB7';

export function Badge({ children, color = 'gray' }) {
  const colors = {
    gray:   { bg: '#F9F5F1', text: '#5a5a58', border: 'rgba(0,0,0,0.12)' },
    purple: { bg: '#EEEDFE', text: '#3C3489', border: '#AFA9EC' },
    teal:   { bg: '#E1F5EE', text: '#085041', border: '#9FE1CB' },
    amber:  { bg: '#FAEEDA', text: '#633806', border: '#FAC775' },
    blue:   { bg: '#E6F1FB', text: '#0C447C', border: '#B5D4F4' },
    red:    { bg: '#FCEBEB', text: '#791F1F', border: '#F7C1C1' },
    green:  { bg: '#EAF3DE', text: '#27500A', border: '#C0DD97' },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 9px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 500,
      background: c.bg,
      color: c.text,
      border: `0.5px solid ${c.border}`,
      whiteSpace: 'nowrap',
      letterSpacing: '0.01em',
    }}>
      {children}
    </span>
  );
}

export function LevelDots({ level, max = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{
          width: 9, height: 9, borderRadius: '50%',
          background: i < level ? V : '#D3D1C7',
          transition: 'background 0.2s',
        }} />
      ))}
      <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginLeft: 4, fontWeight: 500 }}>
        {level}/{max}
      </span>
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(19,19,19,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: 400, backdropFilter: 'blur(2px)',
    }}>
      <div style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 16, padding: '1.5rem',
        width: '100%', maxWidth: 480,
        boxSizing: 'border-box',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>{title}</h3>
          <button onClick={onClose} style={{
            border: '0.5px solid var(--color-border-secondary)',
            background: 'transparent', cursor: 'pointer',
            fontSize: 16, color: 'var(--color-text-secondary)',
            padding: '4px 10px', borderRadius: 6, lineHeight: 1,
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function StatCard({ label, value, color = 'purple' }) {
  const colors = {
    purple: { bg: VL, text: VD, val: V },
    teal:   { bg: '#E1F5EE', text: '#085041', val: '#0F6E56' },
    amber:  { bg: '#FAEEDA', text: '#633806', val: '#BA7517' },
    gray:   { bg: '#F1EFE8', text: '#444441', val: '#5F5E5A' },
  };
  const c = colors[color] || colors.purple;
  return (
    <div style={{ background: c.bg, borderRadius: 10, padding: '0.875rem 1rem' }}>
      <div style={{ fontSize: 10, color: c.text, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color: c.val }}>{value}</div>
    </div>
  );
}

export function FilterBar({ filters, onChange, options }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
      {options.map(opt => (
        <select
          key={opt.key}
          value={filters[opt.key] || ''}
          onChange={e => onChange(opt.key, e.target.value)}
          style={{ fontSize: 12, padding: '5px 8px', minWidth: 110, width: 'auto' }}
        >
          <option value="">{opt.label}</option>
          {opt.values.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      ))}
      {Object.values(filters).some(Boolean) && (
        <button onClick={() => options.forEach(o => onChange(o.key, ''))}
          style={{
            fontSize: 12, padding: '5px 10px', color: 'var(--color-text-secondary)',
            border: '0.5px solid var(--color-border-secondary)', borderRadius: 8,
            background: 'transparent', cursor: 'pointer',
          }}>
          Limpiar
        </button>
      )}
    </div>
  );
}

export function SectionTitle({ children }) {
  return (
    <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 1rem', color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
      {children}
    </h2>
  );
}

export function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: 12, padding: '1.25rem',
      marginBottom: '1rem',
      ...style,
    }}>
      {children}
    </div>
  );
}

export function Avatar({ name, size = 36, bg, textColor }) {
  const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  const palettes = [
    { bg: '#EEEDFE', color: '#3C3489' },
    { bg: '#E1F5EE', color: '#085041' },
    { bg: '#FAEEDA', color: '#633806' },
    { bg: '#E6F1FB', color: '#0C447C' },
    { bg: '#EAF3DE', color: '#27500A' },
  ];
  const idx = name.charCodeAt(0) % palettes.length;
  const p = palettes[idx];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg || p.bg, color: textColor || p.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 600, flexShrink: 0,
      letterSpacing: '0.02em',
    }}>
      {initials}
    </div>
  );
}

export function PrimaryButton({ children, onClick, disabled, style }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? '#D3D1C7' : '#7F56FA',
      color: disabled ? '#888780' : 'white',
      border: 'none',
      padding: '9px 18px', borderRadius: 8,
      fontSize: 13, fontWeight: 500,
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...style,
    }}>
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent',
      color: 'var(--color-text-secondary)',
      border: '0.5px solid var(--color-border-secondary)',
      padding: '7px 13px', borderRadius: 8,
      fontSize: 12, fontWeight: 400,
      cursor: 'pointer',
      ...style,
    }}>
      {children}
    </button>
  );
}

export function GradientBar() {
  return (
    <div style={{
      height: 3,
      background: 'linear-gradient(90deg, #FFAB65 0%, #7F56FA 100%)',
      borderRadius: 20,
      margin: '1rem 0',
    }} />
  );
}

export function SuccessToast({ message }) {
  if (!message) return null;
  return (
    <div style={{
      background: '#E1F5EE',
      color: '#085041',
      border: '0.5px solid #9FE1CB',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 13,
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <span style={{ fontSize: 16 }}>✓</span>
      {message}
    </div>
  );
}

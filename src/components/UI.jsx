import { useState } from 'react';

export function Badge({ children, color = 'gray' }) {
  const colors = {
    gray: { bg: '#F1EFE8', text: '#444441' },
    purple: { bg: '#EEEDFE', text: '#3C3489' },
    teal: { bg: '#E1F5EE', text: '#0F6E56' },
    amber: { bg: '#FAEEDA', text: '#633806' },
    blue: { bg: '#E6F1FB', text: '#0C447C' },
    red: { bg: '#FCEBEB', text: '#A32D2D' },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 500,
      background: c.bg,
      color: c.text,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

export function LevelDots({ level, max = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: i < level ? '#534AB7' : '#D3D1C7',
        }} />
      ))}
      <span style={{ fontSize: 12, color: '#888780', marginLeft: 4 }}>{level}/{max}</span>
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: 400,
    }}>
      <div style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 12, padding: '1.5rem',
        width: '100%', maxWidth: 480,
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>{title}</h3>
          <button onClick={onClose} style={{
            border: 'none', background: 'transparent', cursor: 'pointer',
            fontSize: 18, color: 'var(--color-text-secondary)', padding: '2px 6px',
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function StatCard({ label, value, color = 'purple' }) {
  const colors = {
    purple: { bg: '#EEEDFE', text: '#3C3489' },
    teal: { bg: '#E1F5EE', text: '#0F6E56' },
    amber: { bg: '#FAEEDA', text: '#633806' },
    gray: { bg: '#F1EFE8', text: '#444441' },
  };
  const c = colors[color] || colors.purple;
  return (
    <div style={{
      background: c.bg, borderRadius: 8, padding: '0.875rem 1rem',
    }}>
      <div style={{ fontSize: 11, color: c.text, marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 500, color: c.text }}>{value}</div>
    </div>
  );
}

export function FilterBar({ filters, onChange, options }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem' }}>
      {options.map(opt => (
        <select
          key={opt.key}
          value={filters[opt.key] || ''}
          onChange={e => onChange(opt.key, e.target.value)}
          style={{ fontSize: 13, padding: '4px 8px', minWidth: 120 }}
        >
          <option value="">{opt.label}</option>
          {opt.values.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      ))}
      {Object.values(filters).some(Boolean) && (
        <button onClick={() => options.forEach(o => onChange(o.key, ''))}
          style={{ fontSize: 12, padding: '4px 10px', color: 'var(--color-text-secondary)' }}>
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

export function SectionTitle({ children }) {
  return (
    <h2 style={{ fontSize: 15, fontWeight: 500, margin: '0 0 1rem', color: 'var(--color-text-primary)' }}>
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

export function Avatar({ name, size = 36 }) {
  const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#EEEDFE', color: '#3C3489',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 500, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

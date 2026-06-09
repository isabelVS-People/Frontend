import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { users } from '../data/mockData';
import { GradientBar } from '../components/UI';

export default function LoginView() {
  const { loginDemo } = useAuth();
  const [selected, setSelected] = useState('');

  const roleLabels = { colaborador: 'Colaborador', lider: 'Líder', admin_rrhh: 'Administrador RRHH' };
  const rolePalettes = {
    colaborador: { bg: '#EEEDFE', text: '#3C3489' },
    lider:       { bg: '#E1F5EE', text: '#085041' },
    admin_rrhh:  { bg: '#FAEEDA', text: '#633806' },
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F9F5F1', fontFamily: "'Inter', sans-serif" }}>
      {/* Panel izquierdo */}
      <div style={{
        width: 400, background: '#131313', display: 'flex',
        flexDirection: 'column', justifyContent: 'space-between',
        padding: '2.5rem', flexShrink: 0,
      }} className="login-panel">
        <div>
          <div style={{ marginBottom: '3rem' }}>
            <span style={{ color: 'white', fontSize: 22, fontWeight: 700, letterSpacing: '.08em' }}>VISMA</span>
          </div>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 600, lineHeight: 1.3, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Gestión de<br />competencias
          </h1>
          <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6 }}>
            Plataforma de desarrollo organizacional para Chile, Colombia, Perú y Argentina.
          </p>
        </div>
        <div>
          <div style={{ height: 3, background: 'linear-gradient(90deg, #FFAB65, #7F56FA)', borderRadius: 20, marginBottom: '1.5rem' }} />
          <p style={{ color: '#555', fontSize: 12, lineHeight: 1.6 }}>En producción el acceso se realiza vía SSO corporativo.</p>
        </div>
      </div>

      {/* Panel derecho */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6, letterSpacing: '-0.01em' }}>Seleccioná tu usuario</h2>
          <p style={{ fontSize: 13, color: '#5a5a58', marginBottom: '1.5rem' }}>Simulando acceso SSO corporativo</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1.5rem' }}>
            {users.map(u => {
              const p = rolePalettes[u.role] || rolePalettes.colaborador;
              const isSelected = selected === String(u.id);
              return (
                <button key={u.id} onClick={() => setSelected(String(u.id))} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                  border: isSelected ? '1.5px solid #7F56FA' : '0.5px solid rgba(0,0,0,0.12)',
                  background: isSelected ? '#EEEDFE' : 'white',
                  textAlign: 'left', width: '100%', transition: 'all 0.12s',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: p.bg, color: p.text,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 600, flexShrink: 0,
                  }}>
                    {u.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: isSelected ? '#3C3489' : '#131313' }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: isSelected ? '#534AB7' : '#5a5a58' }}>
                      {roleLabels[u.role]} · {u.country}
                    </div>
                  </div>
                  {isSelected && (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#7F56FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'white', fontSize: 12 }}>✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => selected && loginDemo(selected)}
            disabled={!selected}
            style={{
              width: '100%', padding: '11px', borderRadius: 10,
              cursor: selected ? 'pointer' : 'not-allowed',
              background: selected ? '#7F56FA' : '#D3D1C7',
              color: selected ? 'white' : '#888780',
              border: 'none', fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
            }}
          >
            Ingresar
          </button>
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .login-panel { display: none !important; } }`}</style>
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { users } from '../data/mockData';

export default function LoginView() {
  const { login } = useAuth();
  const [selected, setSelected] = useState('');

  const roleLabels = {
    colaborador: 'Colaborador',
    lider: 'Líder',
    admin_rrhh: 'Administrador RRHH',
  };

  const roleColors = {
    colaborador: '#E1F5EE',
    lider: '#EEEDFE',
    admin_rrhh: '#FAEEDA',
  };

  const roleText = {
    colaborador: '#0F6E56',
    lider: '#3C3489',
    admin_rrhh: '#633806',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-background-tertiary)', padding: '1rem',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: '#534AB7', marginBottom: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L3 7v11h5v-5h4v5h5V7L10 2z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: '0 0 4px' }}>Gestión de competencias</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
            Sistema organizacional · Chile · Colombia · Perú
          </p>
        </div>

        <div style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 12, padding: '1.5rem',
        }}>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 0, marginBottom: '1rem' }}>
            Seleccioná un usuario para simular el acceso SSO:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1.25rem' }}>
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => setSelected(String(u.id))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                  border: selected === String(u.id)
                    ? '1.5px solid #534AB7'
                    : '0.5px solid var(--color-border-tertiary)',
                  background: selected === String(u.id) ? '#EEEDFE' : 'var(--color-background-primary)',
                  textAlign: 'left', width: '100%', transition: 'all 0.12s',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: roleColors[u.role], color: roleText[u.role],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 500, flexShrink: 0,
                }}>
                  {u.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                    {roleLabels[u.role]} · {u.country}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => selected && login(selected)}
            disabled={!selected}
            style={{
              width: '100%', padding: '10px', borderRadius: 8, cursor: selected ? 'pointer' : 'not-allowed',
              background: selected ? '#534AB7' : 'var(--color-background-secondary)',
              color: selected ? 'white' : 'var(--color-text-tertiary)',
              border: 'none', fontSize: 14, fontWeight: 500, transition: 'all 0.12s',
            }}
          >
            Ingresar
          </button>
        </div>

        <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', textAlign: 'center', marginTop: '1rem' }}>
          En producción, el acceso se realiza vía SSO corporativo
        </p>
      </div>
    </div>
  );
}

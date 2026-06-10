
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function LoginView() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      setError('Email o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: '#F7F6F2', fontFamily: "'Inter', sans-serif",
    }}>
      {/* Panel izquierdo */}
      <div className="login-panel" style={{
        width: 420, background: '#0E0E0E', display: 'flex',
        flexDirection: 'column', justifyContent: 'space-between',
        padding: '2.5rem', flexShrink: 0,
      }}>
        <div>
          <span style={{
            color: 'white', fontSize: 13, fontWeight: 700,
            letterSpacing: '.18em', textTransform: 'uppercase', opacity: 0.5,
          }}>
            VISMA
          </span>

          <div style={{ marginTop: '3.5rem' }}>
            <h1 style={{
              color: 'white', fontSize: 36, fontWeight: 700,
              lineHeight: 1.15, letterSpacing: '-0.03em', margin: 0,
            }}>
              Plan de<br />Carrera
            </h1>
            <div style={{
              width: 40, height: 3, marginTop: '1.2rem',
              background: 'linear-gradient(90deg, #FFAB65, #7F56FA)',
              borderRadius: 20,
            }} />
            <p style={{
              color: '#666', fontSize: 13, lineHeight: 1.7,
              marginTop: '1.2rem', maxWidth: 280,
            }}>
              Desarrollo organizacional para Chile, Colombia, Perú y Argentina.
            </p>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { role: 'People', desc: 'Ve y gestiona todos los colaboradores de su compañía.' },
              { role: 'Líder', desc: 'Evalúa el progreso de su equipo.' },
              { role: 'Colaborador', desc: 'Accede a su perfil y plan de carrera.' },
            ].map(({ role, desc }) => (
              <div key={role} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#7F56FA', marginTop: 6, flexShrink: 0,
                }} />
                <div>
                  <div style={{ color: '#ccc', fontSize: 13, fontWeight: 600 }}>{role}</div>
                  <div style={{ color: '#555', fontSize: 12, lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '2rem',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{
            fontSize: 22, fontWeight: 700, marginBottom: 6,
            letterSpacing: '-0.02em', color: '#0E0E0E',
          }}>
            Ingresá a tu cuenta
          </h2>
          <p style={{ fontSize: 13, color: '#888', marginBottom: '2rem' }}>
            Usá el email y contraseña de tu organización.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#444', letterSpacing: '.02em' }}>
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                autoComplete="email"
                style={{
                  padding: '11px 14px', borderRadius: 9, fontSize: 14,
                  border: '1.5px solid #E0DDD6', outline: 'none',
                  background: 'white', color: '#0E0E0E',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = '#7F56FA'}
                onBlur={e => e.target.style.borderColor = '#E0DDD6'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#444', letterSpacing: '.02em' }}>
                CONTRASEÑA
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  padding: '11px 14px', borderRadius: 9, fontSize: 14,
                  border: '1.5px solid #E0DDD6', outline: 'none',
                  background: 'white', color: '#0E0E0E',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = '#7F56FA'}
                onBlur={e => e.target.style.borderColor = '#E0DDD6'}
              />
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 8,
                background: '#FEF2F2', border: '1px solid #FECACA',
                color: '#B91C1C', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!email || !password || loading}
              style={{
                marginTop: 4, padding: '12px', borderRadius: 9,
                cursor: email && password && !loading ? 'pointer' : 'not-allowed',
                background: email && password && !loading ? '#7F56FA' : '#D3D1C7',
                color: email && password && !loading ? 'white' : '#888',
                border: 'none', fontSize: 14, fontWeight: 600,
                letterSpacing: '.01em', transition: 'all 0.15s',
              }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .login-panel { display: none !important; } }
        input::placeholder { color: #BBB; }
      `}</style>
    </div>
  );
}

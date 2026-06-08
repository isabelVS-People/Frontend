import { useAuth } from './hooks/useAuth';
import LoginView from './views/LoginView';
import ColaboradorView from './views/ColaboradorView';
import LiderView from './views/LiderView';
import AdminRRHHView from './views/AdminRRHHView';

const roleLabels = {
  colaborador: 'Colaborador',
  lider: 'Líder',
  admin_rrhh: 'Administrador RRHH',
};

const roleColors = {
  colaborador: { bg: '#E1F5EE', text: '#0F6E56' },
  lider: { bg: '#EEEDFE', text: '#3C3489' },
  admin_rrhh: { bg: '#FAEEDA', text: '#633806' },
};

function AppShell() {
  const { currentUser, logout } = useAuth();

  const roleColor = roleColors[currentUser.role] || roleColors.colaborador;

  const navItems = {
    colaborador: [
      { label: 'Mi perfil y roles', icon: 'person' },
    ],
    lider: [
      { label: 'Mi equipo', icon: 'group' },
    ],
    admin_rrhh: [
      { label: 'Panel RRHH', icon: 'settings' },
    ],
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-background-tertiary)',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{
        background: 'var(--color-background-primary)',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        padding: '0 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 52, position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: '#534AB7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L3 7v11h5v-5h4v5h5V7L10 2z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Gestión de competencias</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginLeft: 4 }}>· {currentUser.country}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: roleColor.bg, color: roleColor.text,
            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
          }}>
            {roleLabels[currentUser.role]}
          </div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{currentUser.name}</div>
          <button onClick={logout} style={{
            fontSize: 12, padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
            border: '0.5px solid var(--color-border-secondary)',
            background: 'transparent', color: 'var(--color-text-secondary)',
          }}>Salir</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, margin: '0 0 2px' }}>
            {roleLabels[currentUser.role]}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
            {currentUser.role === 'colaborador' && 'Tu perfil, nivel de competencia y exploración de roles.'}
            {currentUser.role === 'lider' && 'Mapeo y gestión del nivel de competencias de tu equipo.'}
            {currentUser.role === 'admin_rrhh' && `Panel de administración · ${currentUser.country}`}
          </p>
        </div>

        {currentUser.role === 'colaborador' && <ColaboradorView />}
        {currentUser.role === 'lider' && <LiderView />}
        {currentUser.role === 'admin_rrhh' && <AdminRRHHView />}
      </div>
    </div>
  );
}

export default function App() {
  const { currentUser } = useAuth();
  return currentUser ? <AppShell /> : <LoginView />;
}

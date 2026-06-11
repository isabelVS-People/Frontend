import { useAuth } from './hooks/useAuth';
import LoginView from './views/LoginView';
import ColaboradorView from './views/ColaboradorView';
import LiderView from './views/LiderView';
import AdminRRHHView from './views/AdminRRHHView';

const roleLabels = {
  colaborador: 'Colaborador',
  lider: 'Líder',
  admin_rrhh: 'Administrador RRHH',
  super_admin_rrhh: 'Super Admin RRHH',
};

const rolePalettes = {
  colaborador: { bg: '#EEEDFE', text: '#3C3489' },
  lider:       { bg: '#E1F5EE', text: '#085041' },
  admin_rrhh:  { bg: '#FAEEDA', text: '#633806' },
  super_admin_rrhh: { bg: '#FCE4E4', text: '#7A1F1F' },
};

function AppShell() {
  const { currentUser, logout } = useAuth();
  const p = rolePalettes[currentUser.role] || rolePalettes.colaborador;
  const isGlobalAdmin = currentUser.role === 'super_admin_rrhh';

  return (
    <div style={{ minHeight: '100vh', background: '#F9F5F1', fontFamily: "'Inter', sans-serif" }}>

      {/* Navbar */}
      <nav style={{
        background: '#131313',
        padding: '0 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 52, position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'white', fontSize: 16, fontWeight: 700, letterSpacing: '.08em' }}>VISMA</span>
          <span style={{ color: '#555', fontSize: 13 }}>|</span>
          <span style={{ fontSize: 13, color: '#aaa' }}>Gestión de competencias</span>
          <span style={{
            background: '#EEEDFE', color: '#3C3489',
            padding: '2px 8px', borderRadius: 4,
            fontSize: 11, fontWeight: 500,
          }}>{isGlobalAdmin ? 'Todos los países' : currentUser.country}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            background: p.bg, color: p.text,
            padding: '3px 10px', borderRadius: 20,
            fontSize: 11, fontWeight: 500,
          }}>
            {roleLabels[currentUser.role] || currentUser.role}
          </span>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#ccc' }}>{currentUser.name}</span>
          <button onClick={logout} style={{
            fontSize: 12, padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
            border: '0.5px solid #444', background: 'transparent', color: '#aaa',
          }}>Salir</button>
        </div>
      </nav>

      {/* Contenido */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.75rem 1rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 3, height: 22, borderRadius: 2,
              background: 'linear-gradient(180deg, #FFAB65, #7F56FA)',
            }} />
            <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>
              {roleLabels[currentUser.role] || currentUser.role}
            </h1>
          </div>
          <p style={{ fontSize: 13, color: '#5a5a58', marginLeft: 13 }}>
            {currentUser.role === 'colaborador' && 'Tu perfil, nivel de competencia y exploración de roles.'}
            {currentUser.role === 'lider' && 'Mapeo y gestión del nivel de competencias de tu equipo.'}
            {currentUser.role === 'admin_rrhh' && `Panel de administración · ${currentUser.country}`}
            {currentUser.role === 'super_admin_rrhh' && 'Panel de administración · Todos los países'}
          </p>
        </div>

        {currentUser.role === 'colaborador' && <ColaboradorView />}
        {currentUser.role === 'lider' && <LiderView />}
        {(currentUser.role === 'admin_rrhh' || currentUser.role === 'super_admin_rrhh') && <AdminRRHHView />}
      </div>
    </div>
  );
}

export default function App() {
  const { currentUser } = useAuth();
  return currentUser ? <AppShell /> : <LoginView />;
}

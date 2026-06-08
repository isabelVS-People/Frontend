import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  employees, roles, roleFamilies, getLevels,
  changeHistory, additionalRequirements, requirementValues
} from '../data/mockData';
import { Badge, LevelDots, Modal, Card, SectionTitle, FilterBar, Avatar } from '../components/UI';
import { exportToExcel } from '../utils/exportExcel';

export default function LiderView() {
  const { currentUser } = useAuth();
  const [teamData, setTeamData] = useState(employees);
  const [histData, setHistData] = useState(changeHistory);
  const [filters, setFilters] = useState({});
  const [editingEmp, setEditingEmp] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [tab, setTab] = useState('equipo');
  const [successMsg, setSuccessMsg] = useState('');

  const myTeamIds = currentUser.teamIds || [];
  const myTeam = teamData.filter(e => myTeamIds.includes(e.id) && e.country === currentUser.country);

  const filtered = myTeam.filter(e => {
    const role = roles.find(r => r.id === e.roleId);
    const family = roleFamilies.find(f => f.id === role?.familyId);
    if (filters.area && e.area !== filters.area) return false;
    if (filters.rol && role?.name !== filters.rol) return false;
    if (filters.nivel && String(e.currentLevel) !== filters.nivel) return false;
    return true;
  });

  const areas = [...new Set(myTeam.map(e => e.area))];
  const roleNames = [...new Set(myTeam.map(e => roles.find(r => r.id === e.roleId)?.name).filter(Boolean))];

  const openEdit = (emp) => {
    setEditingEmp(emp);
    setEditForm({ roleId: emp.roleId, level: emp.currentLevel });
  };

  const saveEdit = () => {
    const prev = employees.find(e => e.id === editingEmp.id);
    const newEntry = {
      id: histData.length + 1,
      employeeId: editingEmp.id,
      changedBy: `Líder: ${currentUser.name}`,
      changeDate: new Date().toISOString(),
      prevRoleId: editingEmp.roleId,
      newRoleId: parseInt(editForm.roleId),
      prevLevel: editingEmp.currentLevel,
      newLevel: parseInt(editForm.level),
    };
    setTeamData(prev => prev.map(e =>
      e.id === editingEmp.id
        ? { ...e, roleId: parseInt(editForm.roleId), currentLevel: parseInt(editForm.level) }
        : e
    ));
    setHistData(prev => [newEntry, ...prev]);
    setEditingEmp(null);
    setSuccessMsg(`Cambios guardados para ${editingEmp.name}`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const myHistory = histData.filter(h => myTeamIds.includes(h.employeeId));

  const tabs = [
    { id: 'equipo', label: 'Mi equipo' },
    { id: 'historial', label: 'Historial' },
  ];

  return (
    <div style={{ position: 'relative' }}>
      {editingEmp && (
        <Modal title={`Editar: ${editingEmp.name}`} onClose={() => setEditingEmp(null)}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Familia de rol</label>
            <select
              value={roles.find(r => r.id === parseInt(editForm.roleId))?.familyId || ''}
              onChange={e => {
                const firstRole = roles.find(r => r.familyId === parseInt(e.target.value));
                if (firstRole) setEditForm(f => ({ ...f, roleId: firstRole.id }));
              }}
              style={{ width: '100%', marginBottom: 0 }}
            >
              {roleFamilies.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Rol</label>
            <select
              value={editForm.roleId}
              onChange={e => setEditForm(f => ({ ...f, roleId: e.target.value }))}
              style={{ width: '100%' }}
            >
              {roles
                .filter(r => r.familyId === (roles.find(r2 => r2.id === parseInt(editForm.roleId))?.familyId))
                .map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>
              Nivel de competencia: <strong>{editForm.level}</strong>
            </label>
            <input type="range" min="1" max="5" step="1"
              value={editForm.level}
              onChange={e => setEditForm(f => ({ ...f, level: e.target.value }))}
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
              {getLevels(parseInt(editForm.roleId)).find(l => l.level === parseInt(editForm.level))?.description}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={saveEdit} style={{
              flex: 1, padding: '9px', borderRadius: 8, border: 'none',
              background: '#534AB7', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            }}>Guardar cambios</button>
            <button onClick={() => setEditingEmp(null)} style={{
              padding: '9px 16px', borderRadius: 8,
              border: '0.5px solid var(--color-border-secondary)',
              background: 'transparent', cursor: 'pointer', fontSize: 13,
            }}>Cancelar</button>
          </div>
        </Modal>
      )}

      {successMsg && (
        <div style={{
          background: '#E1F5EE', color: '#0F6E56', borderRadius: 8,
          padding: '10px 14px', fontSize: 13, marginBottom: '1rem',
        }}>
          {successMsg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
              border: tab === t.id ? '1.5px solid #534AB7' : '0.5px solid var(--color-border-secondary)',
              background: tab === t.id ? '#EEEDFE' : 'transparent',
              color: tab === t.id ? '#3C3489' : 'var(--color-text-secondary)',
              fontWeight: tab === t.id ? 500 : 400,
            }}>{t.label}</button>
          ))}
        </div>
        <button onClick={() => exportToExcel(myTeam, roles, roleFamilies, additionalRequirements, requirementValues, myHistory)} style={{
          padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
          border: '0.5px solid var(--color-border-secondary)',
          background: 'transparent', color: 'var(--color-text-secondary)',
        }}>
          Exportar a Excel
        </button>
      </div>

      {tab === 'equipo' && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
            <SectionTitle>Equipo · {filtered.length} colaboradores</SectionTitle>
          </div>
          <FilterBar
            filters={filters}
            onChange={(key, val) => setFilters(f => ({ ...f, [key]: val }))}
            options={[
              { key: 'area', label: 'Área', values: areas },
              { key: 'rol', label: 'Rol', values: roleNames },
              { key: 'nivel', label: 'Nivel', values: ['1', '2', '3', '4', '5'] },
            ]}
          />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                  {['Colaborador', 'Área', 'Familia', 'Rol', 'Nivel', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 500, fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, i) => {
                  const role = roles.find(r => r.id === emp.roleId) || {};
                  const family = roleFamilies.find(f => f.id === role.familyId) || {};
                  return (
                    <tr key={emp.id} style={{ borderBottom: '0.5px solid var(--color-border-tertiary)', background: i % 2 === 0 ? 'transparent' : 'var(--color-background-secondary)' }}>
                      <td style={{ padding: '10px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar name={emp.name} size={28} />
                          <div>
                            <div style={{ fontWeight: 500 }}>{emp.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 10px', color: 'var(--color-text-secondary)' }}>{emp.area}</td>
                      <td style={{ padding: '10px 10px', color: 'var(--color-text-secondary)' }}>{family.name || '—'}</td>
                      <td style={{ padding: '10px 10px' }}>{role.name || '—'}</td>
                      <td style={{ padding: '10px 10px' }}><LevelDots level={emp.currentLevel} /></td>
                      <td style={{ padding: '10px 10px' }}>
                        <button onClick={() => openEdit(emp)} style={{
                          padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                          border: '0.5px solid var(--color-border-secondary)',
                          background: 'transparent', color: 'var(--color-text-secondary)',
                        }}>Editar</button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13 }}>Sin resultados con los filtros aplicados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'historial' && (
        <Card>
          <SectionTitle>Historial del equipo</SectionTitle>
          {myHistory.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Sin cambios registrados.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                    {['Colaborador', 'Fecha', 'Realizado por', 'Rol anterior', 'Rol nuevo', 'Niv. ant.', 'Niv. nuevo'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 500, fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myHistory.map((h, i) => {
                    const emp = employees.find(e => e.id === h.employeeId);
                    const prevRole = roles.find(r => r.id === h.prevRoleId);
                    const newRole = roles.find(r => r.id === h.newRoleId);
                    return (
                      <tr key={h.id} style={{ borderBottom: '0.5px solid var(--color-border-tertiary)', background: i % 2 === 0 ? 'transparent' : 'var(--color-background-secondary)' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 500 }}>{emp?.name || '—'}</td>
                        <td style={{ padding: '8px 10px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                          {new Date(h.changeDate).toLocaleDateString('es-CL')}
                        </td>
                        <td style={{ padding: '8px 10px', color: 'var(--color-text-secondary)' }}>{h.changedBy}</td>
                        <td style={{ padding: '8px 10px' }}><Badge color="gray">{prevRole?.name || '—'}</Badge></td>
                        <td style={{ padding: '8px 10px' }}><Badge color={prevRole?.id !== newRole?.id ? 'teal' : 'gray'}>{newRole?.name || '—'}</Badge></td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{h.prevLevel}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <Badge color={h.newLevel > h.prevLevel ? 'purple' : h.newLevel < h.prevLevel ? 'amber' : 'gray'}>{h.newLevel}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

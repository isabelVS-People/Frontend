import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { roles as mockRoles, roleFamilies as mockFamilies } from '../data/mockData';
import api from '../utils/api';
import { Badge, LevelDots, Modal, Card, SectionTitle, FilterBar, Avatar, SuccessToast } from '../components/UI';
import ExplorarRolesTab from '../components/ExplorarRolesTab';

const userRoleLabels = { admin_rrhh: 'People', lider: 'Líder', colaborador: 'Colaborador' };
const userRoleColors = { admin_rrhh: 'amber', lider: 'teal', colaborador: 'gray' };

export default function LiderView() {
  const { currentUser } = useAuth();
  const [teamData, setTeamData] = useState([]);
  const [roles, setRoles] = useState(mockRoles);
  const [families, setFamilies] = useState(mockFamilies);
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState({});
  const [editingEmp, setEditingEmp] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editCompetencies, setEditCompetencies] = useState([]);
  const [tab, setTab] = useState('equipo');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.employees.list(),
      api.roles.families(),
    ]).then(([emps, fams]) => {
      setTeamData(emps);
      setFamilies(fams);
      const allRoles = fams.flatMap(f => (f.roles || []).map(r => ({ ...r, familyId: f.id })));
      setRoles(allRoles);
    }).catch(err => {
      console.error('Error cargando equipo:', err);
    }).finally(() => setLoading(false));
  }, []);

  const flash = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const filtered = teamData.filter(e => {
    const role = roles.find(r => r.id === (e.role_id || e.roleId));
    if (filters.area && e.area !== filters.area) return false;
    if (filters.rol && role?.name !== filters.rol) return false;
    if (filters.nivel && String(e.current_level || e.currentLevel) !== filters.nivel) return false;
    return true;
  });

  const areas = [...new Set(teamData.map(e => e.area).filter(Boolean))];
  const roleNames = [...new Set(teamData.map(e => {
    const r = roles.find(r => r.id === (e.role_id || e.roleId));
    return r?.name;
  }).filter(Boolean))];

  const currentFamilyId = roles.find(r => r.id === parseInt(editForm.roleId))?.familyId || roles.find(r => r.id === parseInt(editForm.roleId))?.family_id;
  const familyRoles = roles.filter(r => (r.familyId || r.family_id) === currentFamilyId);

  useEffect(() => {
    if (!currentFamilyId) { setEditCompetencies([]); return; }
    api.roles.familyCompetencies(currentFamilyId)
      .then(setEditCompetencies)
      .catch(() => setEditCompetencies([]));
  }, [currentFamilyId]);

  const openEdit = (emp) => {
    setEditingEmp(emp);
    setEditForm({ roleId: emp.role_id || emp.roleId, level: emp.current_level || emp.currentLevel });
  };

  const saveEdit = async () => {
    try {
      await api.employees.update(editingEmp.id, {
        role_id: parseInt(editForm.roleId),
        current_level: parseInt(editForm.level),
      });
      setTeamData(prev => prev.map(e =>
        e.id === editingEmp.id
          ? { ...e, role_id: parseInt(editForm.roleId), current_level: parseInt(editForm.level) }
          : e
      ));
      setEditingEmp(null);
      flash(`Cambios guardados para ${editingEmp.name}`);
    } catch (err) {
      flash(`Error: ${err.message}`);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const ids = teamData.map(e => e.id);
      const results = await Promise.allSettled(ids.map(id => api.employees.history(id)));
      const all = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
      setHistory(all.sort((a, b) => new Date(b.change_date) - new Date(a.change_date)));
    } catch (err) {
      console.error('Error cargando historial:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (id) => {
    setTab(id);
    if (id === 'historial' && history.length === 0) loadHistory();
  };

  const tabs = [
    { id: 'equipo', label: 'Mi equipo' },
    { id: 'explorar', label: 'Explorar roles' },
    { id: 'historial', label: 'Historial' },
  ];

  if (loading && tab !== 'historial') return <div style={{ padding: '3rem', textAlign: 'center', color: '#5a5a58' }}>Cargando equipo...</div>;

  return (
    <div style={{ position: 'relative' }}>
      {editingEmp && (
        <Modal title={`Editar: ${editingEmp.name}`} onClose={() => setEditingEmp(null)}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: 12, color: '#5a5a58', display: 'block', marginBottom: 5, fontWeight: 500 }}>Familia de rol</label>
            <select value={currentFamilyId || ''} onChange={e => {
              const fr = roles.find(r => (r.familyId || r.family_id) === parseInt(e.target.value));
              if (fr) setEditForm(f => ({ ...f, roleId: fr.id }));
            }}>
              {families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: 12, color: '#5a5a58', display: 'block', marginBottom: 5, fontWeight: 500 }}>Rol</label>
            <select value={editForm.roleId} onChange={e => setEditForm(f => ({ ...f, roleId: e.target.value }))}>
              {familyRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: 12, color: '#5a5a58', display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Nivel de competencia: <strong style={{ color: '#7F56FA' }}>{editForm.level}</strong>
            </label>
            <input type="range" min="1" max="5" step="1"
              value={editForm.level}
              onChange={e => setEditForm(f => ({ ...f, level: e.target.value }))}
              style={{ width: '100%', accentColor: '#7F56FA' }}
            />
            <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
              {[1,2,3,4,5].map(n => (
                <div key={n} style={{
                  flex: 1, textAlign: 'center', fontSize: 10, fontWeight: 500,
                  color: parseInt(editForm.level) >= n ? '#7F56FA' : '#D3D1C7',
                }}>{n}</div>
              ))}
            </div>
            {editCompetencies.length === 0 ? (
              <div style={{ fontSize: 12, color: '#5a5a58', marginTop: 10 }}>Sin matriz de competencias cargada para esta familia.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                {editCompetencies.map(c => {
                  const desc = c.levels.find(l => l.level === parseInt(editForm.level))?.description;
                  return (
                    <div key={c.competency_name} style={{ background: '#EEEDFE', padding: '9px 12px', borderRadius: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#3C3489', marginBottom: 2 }}>{c.competency_name}</div>
                      <div style={{ fontSize: 12, color: '#534AB7', lineHeight: 1.6 }}>{desc || '—'}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={saveEdit} style={{
              flex: 1, padding: '10px', borderRadius: 8, border: 'none',
              background: '#7F56FA', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            }}>Guardar cambios</button>
            <button onClick={() => setEditingEmp(null)} style={{
              padding: '10px 16px', borderRadius: 8,
              border: '0.5px solid rgba(0,0,0,0.2)',
              background: 'transparent', cursor: 'pointer', fontSize: 13,
            }}>Cancelar</button>
          </div>
        </Modal>
      )}

      <SuccessToast message={successMsg} />

      <div style={{ display: 'flex', gap: 6, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => handleTabChange(t.id)} style={{
            padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
            border: tab === t.id ? '1.5px solid #7F56FA' : '0.5px solid rgba(0,0,0,0.15)',
            background: tab === t.id ? '#EEEDFE' : 'white',
            color: tab === t.id ? '#3C3489' : '#5a5a58',
            fontWeight: tab === t.id ? 500 : 400,
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'equipo' && (
        <Card>
          <SectionTitle>Mi equipo · {filtered.length} colaboradores</SectionTitle>
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
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid rgba(0,0,0,0.10)' }}>
                  {['Colaborador', 'Tipo', 'Área', 'Familia', 'Rol', 'Nivel', ''].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 10, color: '#5a5a58', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, i) => {
                  const role = roles.find(r => r.id === (emp.role_id || emp.roleId)) || {};
                  const family = families.find(f => f.id === (role.familyId || role.family_id)) || {};
                  const sysRole = emp.user_role;
                  return (
                    <tr key={emp.id} style={{ borderBottom: '0.5px solid rgba(0,0,0,0.07)', background: i % 2 === 0 ? 'transparent' : '#FAFAF9' }}>
                      <td style={{ padding: '11px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <Avatar name={emp.name} size={30} />
                          <div>
                            <div style={{ fontWeight: 500 }}>{emp.name}</div>
                            <div style={{ fontSize: 11, color: '#5a5a58' }}>{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '11px 12px' }}>
                        {sysRole ? (
                          <Badge color={userRoleColors[sysRole] || 'gray'}>{userRoleLabels[sysRole] || sysRole}</Badge>
                        ) : (
                          <span style={{ fontSize: 11, color: '#bbb' }}>Sin acceso</span>
                        )}
                      </td>
                      <td style={{ padding: '11px 12px', color: '#5a5a58' }}>{emp.area}</td>
                      <td style={{ padding: '11px 12px', color: '#5a5a58', fontSize: 12 }}>{emp.family_name || family.name || '—'}</td>
                      <td style={{ padding: '11px 12px' }}>{emp.role_name || role.name || '—'}</td>
                      <td style={{ padding: '11px 12px' }}><LevelDots level={emp.current_level || emp.currentLevel} /></td>
                      <td style={{ padding: '11px 12px' }}>
                        <button onClick={() => openEdit(emp)} style={{
                          padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                          border: '0.5px solid #7F56FA', background: '#EEEDFE', color: '#3C3489', fontWeight: 500,
                        }}>Editar</button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#5a5a58' }}>Sin colaboradores asignados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'explorar' && <ExplorarRolesTab families={families} />}

      {tab === 'historial' && (
        <Card>
          <SectionTitle>Historial del equipo</SectionTitle>
          {loading ? (
            <p style={{ fontSize: 13, color: '#5a5a58', textAlign: 'center', padding: '2rem 0' }}>Cargando...</p>
          ) : history.length === 0 ? (
            <p style={{ fontSize: 13, color: '#5a5a58', textAlign: 'center', padding: '2rem 0' }}>Sin cambios registrados.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '0.5px solid rgba(0,0,0,0.10)' }}>
                    {['Colaborador', 'Fecha', 'Realizado por', 'Rol anterior', 'Rol nuevo', 'Niv. ant.', 'Niv. nuevo'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, fontSize: 10, color: '#5a5a58', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={h.id || i} style={{ borderBottom: '0.5px solid rgba(0,0,0,0.07)', background: i % 2 === 0 ? 'transparent' : '#FAFAF9' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 500 }}>{h.employee_name || '—'}</td>
                      <td style={{ padding: '8px 10px', color: '#5a5a58', whiteSpace: 'nowrap' }}>{new Date(h.change_date).toLocaleDateString('es-CL')}</td>
                      <td style={{ padding: '8px 10px', color: '#5a5a58' }}>{h.changed_by}</td>
                      <td style={{ padding: '8px 10px' }}><Badge color="gray">{h.previous_role || '—'}</Badge></td>
                      <td style={{ padding: '8px 10px' }}><Badge color={h.previous_role !== h.new_role ? 'teal' : 'gray'}>{h.new_role || '—'}</Badge></td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>{h.previous_level}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <Badge color={h.new_level > h.previous_level ? 'purple' : h.new_level < h.previous_level ? 'amber' : 'gray'}>{h.new_level}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

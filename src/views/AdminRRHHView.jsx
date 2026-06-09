import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { roles as mockRoles, roleFamilies as mockFamilies, getLevels } from '../data/mockData';
import api from '../utils/api';
import { Badge, LevelDots, Modal, Card, SectionTitle, FilterBar, Avatar, StatCard, SuccessToast } from '../components/UI';

export default function AdminRRHHView() {
  const { currentUser } = useAuth();
  const [empData, setEmpData] = useState([]);
  const [roles, setRoles] = useState(mockRoles);
  const [families, setFamilies] = useState(mockFamilies);
  const [reqs, setReqs] = useState([]);
  const [filters, setFilters] = useState({});
  const [tab, setTab] = useState('colaboradores');
  const [editingEmp, setEditingEmp] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showNewReq, setShowNewReq] = useState(false);
  const [newReq, setNewReq] = useState({ name: '', valueType: 'text', options: '' });
  const [editingReqEmp, setEditingReqEmp] = useState(null);
  const [reqEditForm, setReqEditForm] = useState({});
  const [bulkMsg, setBulkMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const fileRef = useRef();

  const myCountry = currentUser.country;

  useEffect(() => {
    Promise.all([
      api.employees.list(),
      api.roles.families(),
      api.requirements.list(),
    ]).then(([emps, fams, reqList]) => {
      setEmpData(emps);
      setFamilies(fams);
      // Aplanar roles de las familias
      const allRoles = fams.flatMap(f => (f.roles || []).map(r => ({ ...r, familyId: f.id })));
      setRoles(allRoles);
      setReqs(reqList);
    }).catch(err => {
      console.error('Error cargando datos:', err);
      // Fallback a mock data si la API falla
      const { employees: mockEmps, additionalRequirements: mockReqs } = require('../data/mockData');
      setEmpData(mockEmps.filter(e => e.country === myCountry));
      setReqs(mockReqs);
    }).finally(() => setLoading(false));
  }, []);

  const flash = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const filtered = empData.filter(e => {
    const role = roles.find(r => r.id === (e.roleId || e.role_id));
    if (filters.area && e.area !== filters.area) return false;
    if (filters.rol && role?.name !== filters.rol) return false;
    if (filters.nivel && String(e.current_level || e.currentLevel) !== filters.nivel) return false;
    return true;
  });

  const areas = [...new Set(empData.map(e => e.area).filter(Boolean))];
  const roleNames = [...new Set(empData.map(e => {
    const r = roles.find(r => r.id === (e.roleId || e.role_id));
    return r?.name;
  }).filter(Boolean))];

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
      setEmpData(prev => prev.map(e =>
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

  const saveNewReq = async () => {
    if (!newReq.name.trim()) return;
    try {
      const opts = newReq.valueType === 'options' ? newReq.options.split(',').map(s => s.trim()).filter(Boolean) : [];
      const created = await api.requirements.create({ name: newReq.name, value_type: newReq.valueType, options_list: opts });
      setReqs(prev => [...prev, created]);
      setNewReq({ name: '', valueType: 'text', options: '' });
      setShowNewReq(false);
      flash(`Requisito "${newReq.name}" creado`);
    } catch (err) { flash(`Error: ${err.message}`); }
  };

  const openReqEdit = async (emp) => {
    setEditingReqEmp(emp);
    try {
      const vals = await api.employees.getRequirements(emp.id);
      const form = {};
      vals.forEach(v => { form[v.requirement_def_id] = v.value; });
      setReqEditForm(form);
    } catch { setReqEditForm({}); }
  };

  const saveReqEdit = async () => {
    try {
      const values = Object.entries(reqEditForm).map(([reqId, value]) => ({
        requirement_def_id: parseInt(reqId), value,
      }));
      await api.employees.updateRequirements(editingReqEmp.id, values);
      setEditingReqEmp(null);
      flash(`Requisitos actualizados para ${editingReqEmp.name}`);
    } catch (err) { flash(`Error: ${err.message}`); }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBulkMsg(`Procesando: ${file.name}...`);
    try {
      const result = await api.bulk.uploadEmployees(file);
      setBulkMsg(`✓ Carga completada: ${result.inserted} colaboradores importados. ${result.skipped > 0 ? `${result.skipped} omitidos.` : ''}`);
      // Recargar lista
      const emps = await api.employees.list();
      setEmpData(emps);
    } catch (err) {
      setBulkMsg(`Error: ${err.message}`);
    }
    setTimeout(() => setBulkMsg(''), 5000);
    e.target.value = '';
  };

  const reqTypeLabels = { text: 'Texto', number: 'Número', date: 'Fecha', boolean: 'Sí / No', options: 'Lista' };
  const reqTypeColors = { text: 'gray', number: 'purple', date: 'amber', boolean: 'teal', options: 'blue' };

  const tabs = [
    { id: 'colaboradores', label: 'Colaboradores' },
    { id: 'requisitos', label: 'Requisitos' },
    { id: 'carga', label: 'Carga masiva' },
    { id: 'historial', label: 'Historial' },
  ];

  const currentFamilyId = roles.find(r => r.id === parseInt(editForm.roleId))?.familyId || roles.find(r => r.id === parseInt(editForm.roleId))?.family_id;
  const familyRoles = roles.filter(r => (r.familyId || r.family_id) === currentFamilyId);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#5a5a58' }}>Cargando datos...</div>;

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
              Nivel: <strong style={{ color: '#7F56FA' }}>{editForm.level}</strong>
            </label>
            <input type="range" min="1" max="5" step="1" value={editForm.level}
              onChange={e => setEditForm(f => ({ ...f, level: e.target.value }))}
              style={{ width: '100%', accentColor: '#7F56FA' }} />
            <div style={{ fontSize: 12, color: '#534AB7', marginTop: 10, lineHeight: 1.6, background: '#EEEDFE', padding: '10px 12px', borderRadius: 8 }}>
              {getLevels(parseInt(editForm.roleId)).find(l => l.level === parseInt(editForm.level))?.description}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={saveEdit} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#7F56FA', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Guardar</button>
            <button onClick={() => setEditingEmp(null)} style={{ padding: '10px 16px', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.2)', background: 'transparent', cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
          </div>
        </Modal>
      )}

      {editingReqEmp && (
        <Modal title={`Requisitos: ${editingReqEmp.name}`} onClose={() => setEditingReqEmp(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '1.5rem' }}>
            {reqs.map(req => (
              <div key={req.id}>
                <label style={{ fontSize: 12, color: '#5a5a58', display: 'block', marginBottom: 4, fontWeight: 500 }}>{req.name}</label>
                {(req.value_type || req.valueType) === 'boolean' ? (
                  <select value={reqEditForm[req.id] || ''} onChange={e => setReqEditForm(f => ({ ...f, [req.id]: e.target.value }))}>
                    <option value="">— Sin evaluar —</option>
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                ) : (req.value_type || req.valueType) === 'options' ? (
                  <select value={reqEditForm[req.id] || ''} onChange={e => setReqEditForm(f => ({ ...f, [req.id]: e.target.value }))}>
                    <option value="">— Seleccionar —</option>
                    {(req.options_list || req.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={(req.value_type || req.valueType) === 'number' ? 'number' : (req.value_type || req.valueType) === 'date' ? 'date' : 'text'}
                    value={reqEditForm[req.id] || ''} onChange={e => setReqEditForm(f => ({ ...f, [req.id]: e.target.value }))} />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={saveReqEdit} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#7F56FA', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Guardar</button>
            <button onClick={() => setEditingReqEmp(null)} style={{ padding: '10px 16px', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.2)', background: 'transparent', cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
          </div>
        </Modal>
      )}

      <SuccessToast message={successMsg} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: '1.5rem' }}>
        <StatCard label="Colaboradores" value={empData.length} color="purple" />
        <StatCard label="Áreas" value={areas.length} color="teal" />
        <StatCard label="Familias de rol" value={families.length} color="amber" />
        <StatCard label="Requisitos" value={reqs.length} color="gray" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
              border: tab === t.id ? '1.5px solid #7F56FA' : '0.5px solid rgba(0,0,0,0.15)',
              background: tab === t.id ? '#EEEDFE' : 'white',
              color: tab === t.id ? '#3C3489' : '#5a5a58',
              fontWeight: tab === t.id ? 500 : 400,
            }}>{t.label}</button>
          ))}
        </div>
        <button onClick={() => api.export.employees()} style={{ padding: '7px 13px', borderRadius: 8, cursor: 'pointer', fontSize: 12, border: '0.5px solid rgba(0,0,0,0.18)', background: 'white', color: '#5a5a58' }}>
          Exportar a Excel
        </button>
      </div>

      {tab === 'colaboradores' && (
        <Card>
          <SectionTitle>Colaboradores en {myCountry} · {filtered.length} registros</SectionTitle>
          <FilterBar filters={filters} onChange={(key, val) => setFilters(f => ({ ...f, [key]: val }))} options={[
            { key: 'area', label: 'Área', values: areas },
            { key: 'rol', label: 'Rol', values: roleNames },
            { key: 'nivel', label: 'Nivel', values: ['1', '2', '3', '4', '5'] },
          ]} />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid rgba(0,0,0,0.10)' }}>
                  {['Colaborador', 'Área', 'Familia', 'Rol', 'Nivel', 'Editar', 'Requisitos'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 10, color: '#5a5a58', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, i) => {
                  const role = roles.find(r => r.id === (emp.role_id || emp.roleId)) || {};
                  const family = families.find(f => f.id === (role.familyId || role.family_id)) || {};
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
                      <td style={{ padding: '11px 12px', color: '#5a5a58' }}>{emp.area}</td>
                      <td style={{ padding: '11px 12px', color: '#5a5a58', fontSize: 12 }}>{emp.family_name || family.name || '—'}</td>
                      <td style={{ padding: '11px 12px' }}>{emp.role_name || role.name || '—'}</td>
                      <td style={{ padding: '11px 12px' }}><LevelDots level={emp.current_level || emp.currentLevel} /></td>
                      <td style={{ padding: '11px 12px' }}>
                        <button onClick={() => openEdit(emp)} style={{ padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, border: '0.5px solid #7F56FA', background: '#EEEDFE', color: '#3C3489', fontWeight: 500 }}>Editar</button>
                      </td>
                      <td style={{ padding: '11px 12px' }}>
                        <button onClick={() => openReqEdit(emp)} style={{ padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, border: '0.5px solid rgba(0,0,0,0.18)', background: 'transparent', color: '#5a5a58' }}>Evaluar</button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#5a5a58' }}>Sin colaboradores cargados. Usá la carga masiva para importar.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'requisitos' && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <SectionTitle>Requisitos adicionales</SectionTitle>
            <button onClick={() => setShowNewReq(!showNewReq)} style={{ padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, border: '0.5px solid #7F56FA', background: showNewReq ? '#EEEDFE' : 'white', color: '#3C3489', fontWeight: 500 }}>+ Nuevo</button>
          </div>
          {showNewReq && (
            <div style={{ background: '#F9F5F1', borderRadius: 10, padding: '1rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: 10, border: '0.5px solid rgba(0,0,0,0.10)' }}>
              <div>
                <label style={{ fontSize: 12, color: '#5a5a58', display: 'block', marginBottom: 4, fontWeight: 500 }}>Nombre</label>
                <input type="text" placeholder="Ej: Certificación AWS" value={newReq.name} onChange={e => setNewReq(r => ({ ...r, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#5a5a58', display: 'block', marginBottom: 4, fontWeight: 500 }}>Tipo</label>
                <select value={newReq.valueType} onChange={e => setNewReq(r => ({ ...r, valueType: e.target.value }))}>
                  <option value="text">Texto</option>
                  <option value="number">Número</option>
                  <option value="date">Fecha</option>
                  <option value="boolean">Sí / No</option>
                  <option value="options">Lista</option>
                </select>
              </div>
              {newReq.valueType === 'options' && (
                <div>
                  <label style={{ fontSize: 12, color: '#5a5a58', display: 'block', marginBottom: 4, fontWeight: 500 }}>Opciones (separadas por coma)</label>
                  <input type="text" value={newReq.options} onChange={e => setNewReq(r => ({ ...r, options: e.target.value }))} />
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={saveNewReq} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#7F56FA', color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Crear</button>
                <button onClick={() => setShowNewReq(false)} style={{ padding: '8px 14px', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.18)', background: 'transparent', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reqs.map(req => (
              <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.10)', background: '#F9F5F1' }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{req.name}</span>
                  {(req.options_list || req.options)?.length > 0 && <div style={{ fontSize: 11, color: '#5a5a58', marginTop: 2 }}>Opciones: {(req.options_list || req.options).join(', ')}</div>}
                </div>
                <Badge color={reqTypeColors[req.value_type || req.valueType] || 'gray'}>{reqTypeLabels[req.value_type || req.valueType] || req.value_type}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'carga' && (
        <Card>
          <SectionTitle>Carga masiva de colaboradores</SectionTitle>
          <p style={{ fontSize: 13, color: '#5a5a58', marginTop: -8, marginBottom: '1.25rem', lineHeight: 1.7 }}>
            Subí un archivo CSV o Excel con las columnas: <strong>nombre, email, área, país, rol, nivel</strong>.
          </p>
          <div style={{
            border: '1.5px dashed rgba(127,86,250,0.4)', borderRadius: 12,
            padding: '2.5rem', textAlign: 'center', marginBottom: '1rem',
            cursor: 'pointer', background: '#FAFAF9',
          }} onClick={() => fileRef.current?.click()}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📥</div>
            <div style={{ fontSize: 14, color: '#5a5a58', marginBottom: 6, fontWeight: 500 }}>Arrastrá o hacé clic para seleccionar</div>
            <div style={{ fontSize: 12, color: '#9a9a96' }}>CSV · XLS · XLSX</div>
            <input ref={fileRef} type="file" accept=".csv,.xls,.xlsx" style={{ display: 'none' }} onChange={handleBulkUpload} />
          </div>
          {bulkMsg && (
            <div style={{ background: bulkMsg.startsWith('Error') ? '#FCEBEB' : '#E1F5EE', color: bulkMsg.startsWith('Error') ? '#791F1F' : '#085041', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: '1rem' }}>
              {bulkMsg}
            </div>
          )}
          <div style={{ background: '#F9F5F1', borderRadius: 8, padding: '1rem', border: '0.5px solid rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Formato esperado</div>
            <pre style={{ fontSize: 11, color: '#5a5a58', margin: 0, lineHeight: 1.8, fontFamily: 'monospace' }}>
{`nombre,email,area,pais,rol,nivel
María González,maria@empresa.com,Finanzas,Chile,Accountant,2
Carlos Vega,carlos@empresa.com,Tecnología,Argentina,Developer,3`}
            </pre>
          </div>
        </Card>
      )}

      {tab === 'historial' && (
        <HistorialTab country={myCountry} empData={empData} />
      )}
    </div>
  );
}

function HistorialTab({ country, empData }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar historial de todos los empleados del país
    const ids = empData.map(e => e.id);
    if (ids.length === 0) { setLoading(false); return; }
    // Usamos el primer empleado para demo — en prod haría un endpoint de historial global
    Promise.allSettled(ids.slice(0, 10).map(id => api.employees.history(id)))
      .then(results => {
        const all = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
        setHistory(all.sort((a, b) => new Date(b.change_date) - new Date(a.change_date)));
      })
      .finally(() => setLoading(false));
  }, [empData]);

  if (loading) return <Card><div style={{ padding: '2rem', textAlign: 'center', color: '#5a5a58' }}>Cargando historial...</div></Card>;

  return (
    <Card>
      <SectionTitle>Historial · {country}</SectionTitle>
      {history.length === 0 ? (
        <p style={{ fontSize: 13, color: '#5a5a58', textAlign: 'center', padding: '2rem 0' }}>Sin historial registrado.</p>
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
  );
}

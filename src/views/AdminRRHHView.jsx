import { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  employees as initialEmployees, roles, roleFamilies, getLevels,
  changeHistory as initialHistory, additionalRequirements as initialReqs,
  requirementValues as initialReqValues
} from '../data/mockData';
import { Badge, LevelDots, Modal, Card, SectionTitle, FilterBar, Avatar, StatCard, SuccessToast } from '../components/UI';
import { exportToExcel } from '../utils/exportExcel';

export default function AdminRRHHView() {
  const { currentUser } = useAuth();
  const [empData, setEmpData] = useState(initialEmployees);
  const [histData, setHistData] = useState(initialHistory);
  const [reqs, setReqs] = useState(initialReqs);
  const [reqValues, setReqValues] = useState(initialReqValues);
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
  const fileRef = useRef();

  const myCountry = currentUser.country;
  const countryEmps = empData.filter(e => e.country === myCountry);
  const filtered = countryEmps.filter(e => {
    const role = roles.find(r => r.id === e.roleId);
    if (filters.area && e.area !== filters.area) return false;
    if (filters.rol && role?.name !== filters.rol) return false;
    if (filters.nivel && String(e.currentLevel) !== filters.nivel) return false;
    return true;
  });

  const areas = [...new Set(countryEmps.map(e => e.area))];
  const roleNames = [...new Set(countryEmps.map(e => roles.find(r => r.id === e.roleId)?.name).filter(Boolean))];
  const flash = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const openEdit = (emp) => { setEditingEmp(emp); setEditForm({ roleId: emp.roleId, level: emp.currentLevel }); };
  const saveEdit = () => {
    const newEntry = {
      id: histData.length + 1, employeeId: editingEmp.id, changedBy: 'Admin RRHH',
      changeDate: new Date().toISOString(), prevRoleId: editingEmp.roleId,
      newRoleId: parseInt(editForm.roleId), prevLevel: editingEmp.currentLevel, newLevel: parseInt(editForm.level),
    };
    setEmpData(prev => prev.map(e => e.id === editingEmp.id ? { ...e, roleId: parseInt(editForm.roleId), currentLevel: parseInt(editForm.level) } : e));
    setHistData(prev => [newEntry, ...prev]);
    setEditingEmp(null);
    flash(`Cambios guardados para ${editingEmp.name}`);
  };

  const saveNewReq = () => {
    if (!newReq.name.trim()) return;
    const newId = Math.max(...reqs.map(r => r.id)) + 1;
    const opts = newReq.valueType === 'options' ? newReq.options.split(',').map(s => s.trim()).filter(Boolean) : [];
    setReqs(prev => [...prev, { id: newId, name: newReq.name, valueType: newReq.valueType, options: opts }]);
    setNewReq({ name: '', valueType: 'text', options: '' });
    setShowNewReq(false);
    flash(`Requisito "${newReq.name}" creado`);
  };

  const openReqEdit = (emp) => {
    setEditingReqEmp(emp);
    const empVals = {};
    reqValues.filter(v => v.employeeId === emp.id).forEach(v => { empVals[v.reqId] = v.value; });
    setReqEditForm(empVals);
  };

  const saveReqEdit = () => {
    const filtered2 = reqValues.filter(v => v.employeeId !== editingReqEmp.id);
    let idCnt = Math.max(...reqValues.map(v => v.id), 0) + 1;
    const newVals = Object.entries(reqEditForm).map(([reqId, value]) => ({ id: idCnt++, employeeId: editingReqEmp.id, reqId: parseInt(reqId), value }));
    setReqValues([...filtered2, ...newVals]);
    setEditingReqEmp(null);
    flash(`Requisitos actualizados para ${editingReqEmp.name}`);
  };

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBulkMsg(`Procesando: ${file.name}...`);
    setTimeout(() => {
      const mockNew = [{ id: empData.length + 1, name: 'Nuevo Colaborador (Demo)', email: 'nuevo@empresa.com', area: 'Ingeniería', roleId: 1, currentLevel: 1, country: myCountry, leaderId: null }];
      setEmpData(prev => [...prev, ...mockNew]);
      setBulkMsg(`✓ Carga completada: 1 colaborador importado de ${file.name}`);
      setTimeout(() => setBulkMsg(''), 4000);
    }, 1200);
    e.target.value = '';
  };

  const myHistory = histData.filter(h => countryEmps.some(e => e.id === h.employeeId));
  const tabs = [
    { id: 'colaboradores', label: 'Colaboradores' },
    { id: 'requisitos', label: 'Requisitos' },
    { id: 'carga', label: 'Carga masiva' },
    { id: 'historial', label: 'Historial' },
  ];

  const reqTypeLabels = { text: 'Texto', number: 'Número', date: 'Fecha', boolean: 'Sí / No', options: 'Lista' };
  const reqTypeColors = { text: 'gray', number: 'purple', date: 'amber', boolean: 'teal', options: 'blue' };

  return (
    <div style={{ position: 'relative' }}>
      {editingEmp && (
        <Modal title={`Editar: ${editingEmp.name}`} onClose={() => setEditingEmp(null)}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: 12, color: '#5a5a58', display: 'block', marginBottom: 5, fontWeight: 500 }}>Familia de rol</label>
            <select value={roles.find(r => r.id === parseInt(editForm.roleId))?.familyId || ''} onChange={e => { const fr = roles.find(r => r.familyId === parseInt(e.target.value)); if (fr) setEditForm(f => ({ ...f, roleId: fr.id })); }}>
              {roleFamilies.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: 12, color: '#5a5a58', display: 'block', marginBottom: 5, fontWeight: 500 }}>Rol</label>
            <select value={editForm.roleId} onChange={e => setEditForm(f => ({ ...f, roleId: e.target.value }))}>
              {roles.filter(r => r.familyId === (roles.find(r2 => r2.id === parseInt(editForm.roleId))?.familyId)).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: 12, color: '#5a5a58', display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Nivel: <strong style={{ color: '#7F56FA' }}>{editForm.level}</strong>
            </label>
            <input type="range" min="1" max="5" step="1" value={editForm.level} onChange={e => setEditForm(f => ({ ...f, level: e.target.value }))} style={{ width: '100%', accentColor: '#7F56FA' }} />
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
                {req.valueType === 'boolean' ? (
                  <select value={reqEditForm[req.id] || ''} onChange={e => setReqEditForm(f => ({ ...f, [req.id]: e.target.value }))}>
                    <option value="">— Sin evaluar —</option>
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                ) : req.valueType === 'options' ? (
                  <select value={reqEditForm[req.id] || ''} onChange={e => setReqEditForm(f => ({ ...f, [req.id]: e.target.value }))}>
                    <option value="">— Seleccionar —</option>
                    {(req.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={req.valueType === 'number' ? 'number' : req.valueType === 'date' ? 'date' : 'text'} value={reqEditForm[req.id] || ''} onChange={e => setReqEditForm(f => ({ ...f, [req.id]: e.target.value }))} />
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
        <StatCard label="Colaboradores" value={countryEmps.length} color="purple" />
        <StatCard label="Áreas" value={areas.length} color="teal" />
        <StatCard label="Familias de rol" value={roleFamilies.length} color="amber" />
        <StatCard label="Historial" value={myHistory.length} color="gray" />
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
        <button onClick={() => exportToExcel(countryEmps, roles, roleFamilies, reqs, reqValues, myHistory)} style={{ padding: '7px 13px', borderRadius: 8, cursor: 'pointer', fontSize: 12, border: '0.5px solid rgba(0,0,0,0.18)', background: 'white', color: '#5a5a58' }}>
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
                  {['Colaborador', 'Área', 'Familia', 'Rol', 'Nivel', 'Rol/Nivel', 'Requisitos'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 10, color: '#5a5a58', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, i) => {
                  const role = roles.find(r => r.id === emp.roleId) || {};
                  const family = roleFamilies.find(f => f.id === role.familyId) || {};
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
                      <td style={{ padding: '11px 12px', color: '#5a5a58', fontSize: 12 }}>{family.name || '—'}</td>
                      <td style={{ padding: '11px 12px' }}>{role.name || '—'}</td>
                      <td style={{ padding: '11px 12px' }}><LevelDots level={emp.currentLevel} /></td>
                      <td style={{ padding: '11px 12px' }}>
                        <button onClick={() => openEdit(emp)} style={{ padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, border: '0.5px solid #7F56FA', background: '#EEEDFE', color: '#3C3489', fontWeight: 500, marginRight: 4 }}>Editar</button>
                      </td>
                      <td style={{ padding: '11px 12px' }}>
                        <button onClick={() => openReqEdit(emp)} style={{ padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, border: '0.5px solid rgba(0,0,0,0.18)', background: 'transparent', color: '#5a5a58' }}>Evaluar</button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#5a5a58' }}>Sin resultados.</td></tr>
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
            <button onClick={() => setShowNewReq(!showNewReq)} style={{
              padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
              border: '0.5px solid #7F56FA', background: showNewReq ? '#EEEDFE' : 'white', color: '#3C3489', fontWeight: 500,
            }}>+ Nuevo requisito</button>
          </div>
          {showNewReq && (
            <div style={{ background: '#F9F5F1', borderRadius: 10, padding: '1rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: 10, border: '0.5px solid rgba(0,0,0,0.10)' }}>
              <div>
                <label style={{ fontSize: 12, color: '#5a5a58', display: 'block', marginBottom: 4, fontWeight: 500 }}>Nombre del requisito</label>
                <input type="text" placeholder="Ej: Certificación AWS" value={newReq.name} onChange={e => setNewReq(r => ({ ...r, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#5a5a58', display: 'block', marginBottom: 4, fontWeight: 500 }}>Tipo de valor</label>
                <select value={newReq.valueType} onChange={e => setNewReq(r => ({ ...r, valueType: e.target.value }))}>
                  <option value="text">Texto</option>
                  <option value="number">Número</option>
                  <option value="date">Fecha</option>
                  <option value="boolean">Sí / No</option>
                  <option value="options">Lista de opciones</option>
                </select>
              </div>
              {newReq.valueType === 'options' && (
                <div>
                  <label style={{ fontSize: 12, color: '#5a5a58', display: 'block', marginBottom: 4, fontWeight: 500 }}>Opciones (separadas por coma)</label>
                  <input type="text" placeholder="Ej: Inglés B2, Inglés C1, Francés" value={newReq.options} onChange={e => setNewReq(r => ({ ...r, options: e.target.value }))} />
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={saveNewReq} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#7F56FA', color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Crear requisito</button>
                <button onClick={() => setShowNewReq(false)} style={{ padding: '8px 14px', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.18)', background: 'transparent', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reqs.map(req => (
              <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.10)', background: '#F9F5F1' }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{req.name}</span>
                  {req.options?.length > 0 && <div style={{ fontSize: 11, color: '#5a5a58', marginTop: 2 }}>Opciones: {req.options.join(', ')}</div>}
                </div>
                <Badge color={reqTypeColors[req.valueType] || 'gray'}>{reqTypeLabels[req.valueType] || req.valueType}</Badge>
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
            cursor: 'pointer', background: '#FAFAF9', transition: 'all 0.15s',
          }} onClick={() => fileRef.current?.click()}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📥</div>
            <div style={{ fontSize: 14, color: '#5a5a58', marginBottom: 6, fontWeight: 500 }}>Arrastrá o hacé clic para seleccionar</div>
            <div style={{ fontSize: 12, color: '#9a9a96' }}>CSV · XLS · XLSX</div>
            <input ref={fileRef} type="file" accept=".csv,.xls,.xlsx" style={{ display: 'none' }} onChange={handleBulkUpload} />
          </div>
          {bulkMsg && (
            <div style={{ background: '#E1F5EE', color: '#085041', border: '0.5px solid #9FE1CB', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: '1rem' }}>
              {bulkMsg}
            </div>
          )}
          <div style={{ background: '#F9F5F1', borderRadius: 8, padding: '1rem', border: '0.5px solid rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#131313' }}>Formato esperado</div>
            <pre style={{ fontSize: 11, color: '#5a5a58', margin: 0, lineHeight: 1.8, fontFamily: 'var(--font-mono)' }}>
{`nombre,email,area,pais,rol,nivel
María González,maria@empresa.com,Ingeniería,Chile,Desarrollador Frontend,2
Carlos Vega,carlos@empresa.com,Datos,Colombia,Data Analyst,3`}
            </pre>
          </div>
        </Card>
      )}

      {tab === 'historial' && (
        <Card>
          <SectionTitle>Historial · {myCountry}</SectionTitle>
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
                {myHistory.length === 0 && <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#5a5a58' }}>Sin historial.</td></tr>}
                {myHistory.map((h, i) => {
                  const emp = empData.find(e => e.id === h.employeeId);
                  const prevRole = roles.find(r => r.id === h.prevRoleId);
                  const newRole = roles.find(r => r.id === h.newRoleId);
                  return (
                    <tr key={h.id} style={{ borderBottom: '0.5px solid rgba(0,0,0,0.07)', background: i % 2 === 0 ? 'transparent' : '#FAFAF9' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 500 }}>{emp?.name || '—'}</td>
                      <td style={{ padding: '8px 10px', color: '#5a5a58', whiteSpace: 'nowrap' }}>{new Date(h.changeDate).toLocaleDateString('es-CL')}</td>
                      <td style={{ padding: '8px 10px', color: '#5a5a58' }}>{h.changedBy}</td>
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
        </Card>
      )}
    </div>
  );
}

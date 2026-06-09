import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { roleFamilies, getLevels } from '../data/mockData';
import api from '../utils/api';
import { Badge, LevelDots, Card, SectionTitle, Avatar, GradientBar } from '../components/UI';

export default function ColaboradorView() {
  const { currentUser } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [history, setHistory] = useState([]);
  const [reqValues, setReqValues] = useState([]);
  const [families, setFamilies] = useState([]);
  const [exploreFamily, setExploreFamily] = useState(null);
  const [tab, setTab] = useState('perfil');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si tiene employeeId (modo demo), usar mock. Si no, llamar API
    if (currentUser?.employeeId) {
      const { employees, changeHistory, requirementValues, roleFamilies: rf, roles, additionalRequirements } = require('../data/mockData');
      const emp = employees.find(e => e.id === currentUser.employeeId);
      setEmployee(emp ? { ...emp, roleName: roles.find(r => r.id === emp.roleId)?.name, familyName: rf.find(f => f.id === roles.find(r => r.id === emp.roleId)?.familyId)?.name } : null);
      setHistory(changeHistory.filter(h => h.employeeId === currentUser.employeeId));
      setReqValues(requirementValues.filter(v => v.employeeId === currentUser.employeeId));
      setFamilies(rf);
    } else {
      Promise.all([
        api.employees.me(),
        api.roles.families(),
      ]).then(([emp, fams]) => {
        setEmployee(emp);
        setFamilies(fams);
        return Promise.all([
          api.employees.history(emp.id),
          api.employees.getRequirements(emp.id),
        ]);
      }).then(([hist, reqs]) => {
        setHistory(hist);
        setReqValues(reqs);
      }).catch(console.error)
        .finally(() => setLoading(false));
    }
    setLoading(false);
  }, [currentUser]);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#5a5a58' }}>Cargando...</div>;
  if (!employee) return <div style={{ padding: '3rem', textAlign: 'center', color: '#5a5a58' }}>Sin datos asignados. Contactá a tu administrador de RRHH.</div>;

  const levels = getLevels(employee.roleId || employee.role_id);

  const tabs = [
    { id: 'perfil', label: 'Mi perfil' },
    { id: 'explorar', label: 'Explorar roles' },
    { id: 'historial', label: 'Mi historial' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
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

      {tab === 'perfil' && (
        <div>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.25rem' }}>
              <Avatar name={employee.name} size={48} bg="#7F56FA" textColor="white" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 600 }}>{employee.name}</div>
                <div style={{ fontSize: 13, color: '#5a5a58', marginTop: 2 }}>{employee.email} · {employee.area}</div>
              </div>
              <Badge color="purple">{employee.country}</Badge>
            </div>
            <GradientBar />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginTop: '1rem' }}>
              {[
                { label: 'Familia de rol', value: employee.family_name || employee.familyName || '—' },
                { label: 'Rol asignado', value: employee.role_name || employee.roleName || '—' },
                { label: 'Área', value: employee.area },
              ].map(item => (
                <div key={item.label} style={{ background: '#F9F5F1', borderRadius: 8, padding: '0.75rem 1rem' }}>
                  <div style={{ fontSize: 10, color: '#5a5a58', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle>Nivel de competencia actual</SectionTitle>
            <div style={{ marginBottom: '1rem' }}>
              <LevelDots level={employee.current_level || employee.currentLevel} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {levels.map(l => {
                const current = employee.current_level || employee.currentLevel;
                return (
                  <div key={l.level} style={{
                    display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 10,
                    background: l.level === current ? '#EEEDFE' : '#F9F5F1',
                    border: l.level === current ? '1px solid #AFA9EC' : '0.5px solid transparent',
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                      background: l.level === current ? '#7F56FA' : '#D3D1C7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 600,
                      color: l.level === current ? 'white' : '#888780',
                    }}>{l.level}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3, color: l.level === current ? '#3C3489' : '#131313' }}>
                        Nivel {l.level}{l.level === current ? ' · actual' : ''}
                      </div>
                      <div style={{ fontSize: 12, color: l.level === current ? '#534AB7' : '#5a5a58', lineHeight: 1.6 }}>
                        {l.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {reqValues.length > 0 && (
            <Card>
              <SectionTitle>Requisitos adicionales</SectionTitle>
              {reqValues.map((v, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
                  <span style={{ fontSize: 13, color: '#5a5a58' }}>{v.name || v.req_name}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>
                    {v.value_type === 'boolean' || v.valueType === 'boolean' ? (v.value === 'true' ? '✓ Sí' : '✗ No') : v.value}
                  </span>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {tab === 'explorar' && (
        <div>
          <Card>
            <SectionTitle>Familias de roles</SectionTitle>
            <p style={{ fontSize: 13, color: '#5a5a58', marginTop: -8, marginBottom: '1rem' }}>
              Explorá cualquier familia para planificar tu trayectoria de carrera.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 8 }}>
              {families.map(f => (
                <button key={f.id} onClick={() => setExploreFamily(exploreFamily?.id === f.id ? null : f)}
                  style={{
                    padding: '12px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                    border: exploreFamily?.id === f.id ? '1.5px solid #7F56FA' : '0.5px solid rgba(0,0,0,0.12)',
                    background: exploreFamily?.id === f.id ? '#EEEDFE' : 'white',
                    color: exploreFamily?.id === f.id ? '#3C3489' : '#131313',
                    fontSize: 13, fontWeight: exploreFamily?.id === f.id ? 500 : 400,
                    transition: 'all 0.12s',
                  }}>
                  {f.name}
                </button>
              ))}
            </div>
          </Card>

          {exploreFamily && (
            <Card>
              <SectionTitle>{exploreFamily.name}</SectionTitle>
              {(exploreFamily.roles || []).map(r => {
                const lvls = getLevels(r.id);
                return (
                  <div key={r.id} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 4, height: 16, borderRadius: 2, background: '#7F56FA' }} />
                      {r.name}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {lvls.map(l => (
                        <div key={l.level} style={{ display: 'flex', gap: 12, padding: '9px 12px', borderRadius: 8, background: '#F9F5F1' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#7F56FA', minWidth: 52, paddingTop: 1 }}>Nivel {l.level}</span>
                          <span style={{ fontSize: 12, color: '#5a5a58', lineHeight: 1.6 }}>{l.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </div>
      )}

      {tab === 'historial' && (
        <Card>
          <SectionTitle>Historial de cambios</SectionTitle>
          {history.length === 0 ? (
            <p style={{ fontSize: 13, color: '#5a5a58', textAlign: 'center', padding: '2rem 0' }}>Sin cambios registrados.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {history.map((h, i) => (
                <div key={i} style={{ padding: '14px', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.10)', background: '#F9F5F1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>
                      {new Date(h.changeDate || h.change_date).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    <span style={{ fontSize: 11, color: '#5a5a58' }}>{h.changedBy || h.changed_by}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: 12 }}>
                    {(h.prevRoleId || h.previous_role) && (h.newRoleId || h.new_role) && (
                      <>
                        <Badge color="gray">{h.previous_role || h.prevRoleId}</Badge>
                        <span style={{ color: '#aaa' }}>→</span>
                        <Badge color="teal">{h.new_role || h.newRoleId}</Badge>
                      </>
                    )}
                    {(h.prevLevel || h.previous_level) !== (h.newLevel || h.new_level) && (
                      <>
                        <Badge color="gray">Nivel {h.prevLevel || h.previous_level}</Badge>
                        <span style={{ color: '#aaa' }}>→</span>
                        <Badge color="purple">Nivel {h.newLevel || h.new_level}</Badge>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

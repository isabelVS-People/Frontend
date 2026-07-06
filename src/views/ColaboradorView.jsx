import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import { Badge, LevelDots, Card, SectionTitle, Avatar, GradientBar } from '../components/UI';
import ExplorarRolesTab from '../components/ExplorarRolesTab';

export default function ColaboradorView() {
  const { currentUser } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [history, setHistory] = useState([]);
  const [reqValues, setReqValues] = useState([]);
  const [families, setFamilies] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [tab, setTab] = useState('perfil');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.employees.me(),
      api.roles.families(),
    ]).then(([emp, fams]) => {
      setEmployee(emp);
      setFamilies(fams);
      return Promise.all([
        api.employees.history(emp.id),
        api.employees.getRequirements(emp.id),
        emp.family_id ? api.roles.familyCompetencies(emp.family_id) : Promise.resolve([]),
      ]);
    }).then(([hist, reqs, comps]) => {
      setHistory(hist);
      setReqValues(reqs);
      setCompetencies(comps);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [currentUser]);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#5a5a58' }}>Cargando...</div>;
  if (!employee) return <div style={{ padding: '3rem', textAlign: 'center', color: '#5a5a58' }}>Sin datos asignados. Contactá a tu administrador de RRHH.</div>;

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
                { label: 'Familia de rol', value: employee.family_name || '—' },
                { label: 'Rol asignado', value: employee.role_name || '—' },
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
              <LevelDots level={employee.current_level} />
            </div>
            {competencies.length === 0 ? (
              <div style={{ fontSize: 13, color: '#5a5a58', padding: '0.5rem 0' }}>
                Esta familia todavía no tiene matriz de competencias cargada.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {competencies.map(c => {
                  const current = employee.current_level;
                  const currentLevelData = c.levels.find(l => l.level === current);
                  return (
                    <div key={c.competency_name}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 4, height: 14, borderRadius: 2, background: '#7F56FA' }} />
                        {c.competency_name}
                      </div>
                      <div style={{
                        display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 10,
                        background: '#EEEDFE', border: '1px solid #AFA9EC',
                      }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                          background: '#7F56FA',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 600, color: 'white',
                        }}>{current}</div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3, color: '#3C3489' }}>
                            Nivel {current} · actual
                          </div>
                          <div style={{ fontSize: 12, color: '#534AB7', lineHeight: 1.6 }}>
                            {currentLevelData?.description || 'Sin descripción para este nivel.'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {reqValues.length > 0 && (
            <Card>
              <SectionTitle>Requisitos adicionales</SectionTitle>
              {reqValues.map((v, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
                  <span style={{ fontSize: 13, color: '#5a5a58' }}>{v.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>
                    {v.value_type === 'boolean' ? (v.value === 'true' ? '✓ Sí' : '✗ No') : v.value}
                  </span>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {tab === 'explorar' && <ExplorarRolesTab families={families} />}

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
                      {new Date(h.change_date).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    <span style={{ fontSize: 11, color: '#5a5a58' }}>{h.changed_by}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: 12 }}>
                    {h.previous_role && h.new_role && (
                      <>
                        <Badge color="gray">{h.previous_role}</Badge>
                        <span style={{ color: '#aaa' }}>→</span>
                        <Badge color="teal">{h.new_role}</Badge>
                      </>
                    )}
                    {h.previous_level !== h.new_level && (
                      <>
                        <Badge color="gray">Nivel {h.previous_level}</Badge>
                        <span style={{ color: '#aaa' }}>→</span>
                        <Badge color="purple">Nivel {h.new_level}</Badge>
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

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  employees, roles, roleFamilies, getLevels,
  changeHistory, additionalRequirements, requirementValues
} from '../data/mockData';
import { Badge, LevelDots, Card, SectionTitle, Avatar, GradientBar } from '../components/UI';

export default function ColaboradorView() {
  const { currentUser } = useAuth();
  const [exploreFamily, setExploreFamily] = useState(null);
  const [tab, setTab] = useState('perfil');

  const employee = employees.find(e => e.id === currentUser.employeeId);
  if (!employee) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#5a5a58' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>👤</div>
      Sin datos asignados. Contactá a tu administrador de RRHH.
    </div>
  );

  const role = roles.find(r => r.id === employee.roleId) || {};
  const family = roleFamilies.find(f => f.id === role.familyId) || {};
  const levels = getLevels(employee.roleId);
  const myHistory = changeHistory.filter(h => h.employeeId === employee.id);
  const myReqValues = requirementValues.filter(v => v.employeeId === employee.id);

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
            transition: 'all 0.12s',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'perfil' && (
        <div>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.25rem' }}>
              <Avatar name={employee.name} size={48} bg="#7F56FA" textColor="white" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>{employee.name}</div>
                <div style={{ fontSize: 13, color: '#5a5a58', marginTop: 2 }}>{employee.email} · {employee.area}</div>
              </div>
              <Badge color="purple">{employee.country}</Badge>
            </div>
            <GradientBar />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginTop: '1rem' }}>
              {[
                { label: 'Familia de rol', value: family.name || '—' },
                { label: 'Rol asignado', value: role.name || '—' },
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
              <LevelDots level={employee.currentLevel} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {levels.map(l => (
                <div key={l.level} style={{
                  display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 10,
                  background: l.level === employee.currentLevel ? '#EEEDFE' : '#F9F5F1',
                  border: l.level === employee.currentLevel ? '1px solid #AFA9EC' : '0.5px solid transparent',
                  transition: 'all 0.15s',
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: l.level === employee.currentLevel ? '#7F56FA' : '#D3D1C7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 600,
                    color: l.level === employee.currentLevel ? 'white' : '#888780',
                  }}>{l.level}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3, color: l.level === employee.currentLevel ? '#3C3489' : '#131313' }}>
                      Nivel {l.level}{l.level === employee.currentLevel ? ' · actual' : ''}
                    </div>
                    <div style={{ fontSize: 12, color: l.level === employee.currentLevel ? '#534AB7' : '#5a5a58', lineHeight: 1.6 }}>
                      {l.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {myReqValues.length > 0 && (
            <Card>
              <SectionTitle>Requisitos adicionales</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {myReqValues.map(v => {
                  const req = additionalRequirements.find(r => r.id === v.reqId);
                  if (!req) return null;
                  return (
                    <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
                      <span style={{ fontSize: 13, color: '#5a5a58' }}>{req.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>
                        {req.valueType === 'boolean' ? (v.value === 'true' ? '✓ Sí' : '✗ No') : v.value}
                      </span>
                    </div>
                  );
                })}
              </div>
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
              {roleFamilies.map(f => (
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
              {roles.filter(r => r.familyId === exploreFamily.id).map(r => {
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
          {myHistory.length === 0 ? (
            <p style={{ fontSize: 13, color: '#5a5a58', textAlign: 'center', padding: '2rem 0' }}>Sin cambios registrados.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myHistory.map(h => {
                const prevRole = roles.find(r => r.id === h.prevRoleId);
                const newRole = roles.find(r => r.id === h.newRoleId);
                return (
                  <div key={h.id} style={{ padding: '14px', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.10)', background: '#F9F5F1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>
                        {new Date(h.changeDate).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                      <span style={{ fontSize: 11, color: '#5a5a58' }}>{h.changedBy}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: 12 }}>
                      {prevRole?.name !== newRole?.name && (
                        <>
                          <Badge color="gray">{prevRole?.name}</Badge>
                          <span style={{ color: '#aaa' }}>→</span>
                          <Badge color="teal">{newRole?.name}</Badge>
                        </>
                      )}
                      {h.prevLevel !== h.newLevel && (
                        <>
                          <Badge color="gray">Nivel {h.prevLevel}</Badge>
                          <span style={{ color: '#aaa' }}>→</span>
                          <Badge color="purple">Nivel {h.newLevel}</Badge>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  employees, roles, roleFamilies, getLevels,
  changeHistory, additionalRequirements, requirementValues
} from '../data/mockData';
import { Badge, LevelDots, Card, SectionTitle, Avatar } from '../components/UI';

export default function ColaboradorView() {
  const { currentUser } = useAuth();
  const [exploreFamily, setExploreFamily] = useState(null);
  const [tab, setTab] = useState('perfil');

  const employee = employees.find(e => e.id === currentUser.employeeId);
  if (!employee) return <div style={{ padding: '2rem', color: 'var(--color-text-secondary)' }}>Sin datos asignados.</div>;

  const role = roles.find(r => r.id === employee.roleId) || {};
  const family = roleFamilies.find(f => f.id === role.familyId) || {};
  const levels = getLevels(employee.roleId);
  const currentLevelDesc = levels.find(l => l.level === employee.currentLevel);
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
            padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
            border: tab === t.id ? '1.5px solid #534AB7' : '0.5px solid var(--color-border-secondary)',
            background: tab === t.id ? '#EEEDFE' : 'transparent',
            color: tab === t.id ? '#3C3489' : 'var(--color-text-secondary)',
            fontWeight: tab === t.id ? 500 : 400,
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'perfil' && (
        <div>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
              <Avatar name={employee.name} size={44} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{employee.name}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  {employee.email} · {employee.area}
                </div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Badge color="purple">{employee.country}</Badge>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              {[
                { label: 'Familia de rol', value: family.name || '—' },
                { label: 'Rol asignado', value: role.name || '—' },
                { label: 'Área', value: employee.area },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--color-background-secondary)', borderRadius: 8, padding: '0.75rem 1rem' }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{item.value}</div>
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
                  display: 'flex', gap: 12, padding: '10px 12px', borderRadius: 8,
                  background: l.level === employee.currentLevel ? '#EEEDFE' : 'var(--color-background-secondary)',
                  border: l.level === employee.currentLevel ? '1px solid #AFA9EC' : '0.5px solid var(--color-border-tertiary)',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: l.level === employee.currentLevel ? '#534AB7' : '#D3D1C7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 500,
                    color: l.level === employee.currentLevel ? 'white' : '#888780',
                  }}>{l.level}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2, color: l.level === employee.currentLevel ? '#3C3489' : 'var(--color-text-primary)' }}>
                      Nivel {l.level}{l.level === employee.currentLevel ? ' · actual' : ''}
                    </div>
                    <div style={{ fontSize: 12, color: l.level === employee.currentLevel ? '#534AB7' : 'var(--color-text-secondary)', lineHeight: 1.5 }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {myReqValues.map(v => {
                  const req = additionalRequirements.find(r => r.id === v.reqId);
                  if (!req) return null;
                  return (
                    <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                      <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{req.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>
                        {req.valueType === 'boolean' ? (v.value === 'true' ? 'Sí' : 'No') : v.value}
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
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 0, marginBottom: '1rem' }}>
              Explorá cualquier familia para conocer los roles y sus niveles de competencia.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
              {roleFamilies.map(f => (
                <button key={f.id} onClick={() => setExploreFamily(exploreFamily?.id === f.id ? null : f)}
                  style={{
                    padding: '10px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                    border: exploreFamily?.id === f.id ? '1.5px solid #534AB7' : '0.5px solid var(--color-border-tertiary)',
                    background: exploreFamily?.id === f.id ? '#EEEDFE' : 'var(--color-background-secondary)',
                    color: exploreFamily?.id === f.id ? '#3C3489' : 'var(--color-text-primary)',
                    fontSize: 13, fontWeight: exploreFamily?.id === f.id ? 500 : 400,
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
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, color: 'var(--color-text-primary)' }}>
                      {r.name}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {lvls.map(l => (
                        <div key={l.level} style={{ display: 'flex', gap: 10, padding: '8px 10px', borderRadius: 6, background: 'var(--color-background-secondary)' }}>
                          <span style={{ fontSize: 11, fontWeight: 500, color: '#534AB7', minWidth: 48, paddingTop: 1 }}>Nivel {l.level}</span>
                          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{l.description}</span>
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
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Sin cambios registrados.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myHistory.map(h => {
                const prevRole = roles.find(r => r.id === h.prevRoleId);
                const newRole = roles.find(r => r.id === h.newRoleId);
                return (
                  <div key={h.id} style={{ padding: '12px', borderRadius: 8, border: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 500 }}>
                        {new Date(h.changeDate).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{h.changedBy}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: 12 }}>
                      {prevRole?.name !== newRole?.name && (
                        <>
                          <Badge color="gray">{prevRole?.name}</Badge>
                          <span style={{ color: 'var(--color-text-tertiary)' }}>→</span>
                          <Badge color="teal">{newRole?.name}</Badge>
                        </>
                      )}
                      {h.prevLevel !== h.newLevel && (
                        <>
                          <Badge color="gray">Nivel {h.prevLevel}</Badge>
                          <span style={{ color: 'var(--color-text-tertiary)' }}>→</span>
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

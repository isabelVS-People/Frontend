import { useState } from 'react';
import { getLevels } from '../data/mockData';
import { Card, SectionTitle } from './UI';

/**
 * Pestaña "Explorar roles" — compartida entre Colaborador, Líder y Admin RRHH.
 * Muestra todas las familias de rol y, al seleccionar una, sus roles
 * con la descripción de cada nivel de competencia (1 a 5).
 */
export default function ExplorarRolesTab({ families }) {
  const [exploreFamily, setExploreFamily] = useState(null);

  return (
    <div>
      <Card>
        <SectionTitle>Familias de roles</SectionTitle>
        <p style={{ fontSize: 13, color: '#5a5a58', marginTop: -8, marginBottom: '1rem' }}>
          Explorá cualquier familia para ver los roles y sus niveles de competencia.
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
  );
}

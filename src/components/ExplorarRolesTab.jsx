import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Card, SectionTitle } from './UI';

/**
 * Pestaña "Explorar roles" — compartida entre Colaborador, Líder y Admin RRHH.
 * Muestra todas las familias de rol y, al seleccionar una, su matriz de
 * competencias x niveles (5 competencias x 5 niveles, compartida por todos
 * los roles de esa familia), además del listado de roles de la familia.
 */
export default function ExplorarRolesTab({ families }) {
  const [exploreFamily, setExploreFamily] = useState(null);
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!exploreFamily) { setCompetencies([]); return; }
    setLoading(true);
    setError(null);
    api.roles.familyCompetencies(exploreFamily.id)
      .then(data => setCompetencies(data))
      .catch(err => { setError(err.message); setCompetencies([]); })
      .finally(() => setLoading(false));
  }, [exploreFamily]);

  return (
    <div>
      <Card>
        <SectionTitle>Familias de roles</SectionTitle>
        <p style={{ fontSize: 13, color: '#5a5a58', marginTop: -8, marginBottom: '1rem' }}>
          Explorá cualquier familia para ver sus roles y la matriz de competencias por nivel.
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

          {(exploreFamily.roles || []).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1.25rem' }}>
              {exploreFamily.roles.map(r => (
                <span key={r.id} style={{
                  fontSize: 12, padding: '4px 10px', borderRadius: 20,
                  background: '#F0EDE8', color: '#5a5a58',
                }}>{r.name}</span>
              ))}
            </div>
          )}

          {loading && <div style={{ padding: '1rem', color: '#5a5a58', fontSize: 13 }}>Cargando matriz de competencias...</div>}
          {error && <div style={{ padding: '1rem', color: '#791F1F', fontSize: 13 }}>Error al cargar: {error}</div>}

          {!loading && !error && competencies.length === 0 && (
            <div style={{ padding: '1rem', color: '#5a5a58', fontSize: 13 }}>
              Esta familia todavía no tiene matriz de competencias cargada.
            </div>
          )}

          {!loading && !error && competencies.map(c => (
            <div key={c.competency_name} style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 4, height: 16, borderRadius: 2, background: '#7F56FA' }} />
                {c.competency_name}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {c.levels.map(l => (
                  <div key={l.level} style={{ display: 'flex', gap: 12, padding: '9px 12px', borderRadius: 8, background: '#F9F5F1' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#7F56FA', minWidth: 52, paddingTop: 1 }}>Nivel {l.level}</span>
                    <span style={{ fontSize: 12, color: '#5a5a58', lineHeight: 1.6 }}>{l.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

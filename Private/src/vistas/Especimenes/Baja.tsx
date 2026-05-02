import React, { useState } from 'react';
import { ArrowLeft, Search, Trash2, X } from 'lucide-react';
import type { Especimen } from './types';

interface BajaProps {
  especimenes: Especimen[];
  onBack: () => void;
  onBaja: (id: number) => void;
}

const Baja: React.FC<BajaProps> = ({ especimenes, onBack, onBaja }) => {
  const [searchTerm, setSearchTerm]         = useState('');
  const [showDropdown, setShowDropdown]     = useState(false);
  const [selected, setSelected]             = useState<Especimen | null>(null);

  const filteredEspecimenes = especimenes.filter(e => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (e.especie_nombre ?? '').toLowerCase().includes(q) ||
      e.id_especimen.toString().includes(q) ||
      (e.localidad_nombre ?? '').toLowerCase().includes(q) ||
      (e.colector_nombre ?? '').toLowerCase().includes(q)
    );
  });

  const handleSelect = (e: Especimen) => {
    setSelected(e);
    setSearchTerm(`#${String(e.id_especimen).padStart(5, '0')} — ${e.especie_nombre || 'Sin identificar'}`);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setSelected(null);
    setSearchTerm('');
  };

  const handleBaja = () => {
    if (!selected) return;
    if (confirm('¿Estás seguro de que deseas eliminar este espécimen?')) {
      onBaja(selected.id_especimen);
    }
  };

  const isReady = !!selected;

  return (
    <div className="screen-container animate-slide-in">
      {/* ── Header ── */}
      <div className="screen-header">
        <div className="header-with-back">
          <button className="btn-back" onClick={onBack}><ArrowLeft size={20} /></button>
          <div>
            <h2 className="screen-title">Eliminar Espécimen</h2>
            <p className="screen-subtitle">
              {selected
                ? `Eliminando: #${String(selected.id_especimen).padStart(5, '0')} — ${selected.especie_nombre || 'Sin identificar'}`
                : 'Busca y selecciona un espécimen para eliminar'}
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-outline" onClick={onBack}>Cancelar</button>
          <button
            type="button"
            className="btn-danger-soft with-icon"
            onClick={handleBaja}
            disabled={!isReady}
          >
            <Trash2 size={18} />
            Eliminar Espécimen
          </button>
        </div>
      </div>

      {/* ── Search card ── */}
      <div className="form-card" style={{ marginBottom: '1.5rem', overflow: 'visible' }}>
        <div className="form-section" style={{ position: 'relative', marginBottom: 0 }}>
          <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Buscar Espécimen a Eliminar</label>
          <div className="search-wrapper" style={{ marginTop: '0.75rem', width: '100%', maxWidth: '700px' }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar por especie, ID, localidad o colector..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setShowDropdown(true); setSelected(null); }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            {searchTerm && (
              <button type="button" className="btn-clear" onClick={handleClear} title="Limpiar">
                <X size={16} />
              </button>
            )}
          </div>
          {showDropdown && (
            <div className="search-dropdown" style={{ maxWidth: '700px' }}>
              {filteredEspecimenes.length > 0 ? filteredEspecimenes.slice(0, 20).map(e => (
                <div
                  key={e.id_especimen}
                  className="search-dropdown-item"
                  onMouseDown={ev => { ev.preventDefault(); handleSelect(e); }}
                >
                  <span style={{ fontWeight: 600 }}>#{String(e.id_especimen).padStart(5, '0')}</span>
                  <span>{e.especie_nombre || 'Sin identificar'}</span>
                  {e.localidad_nombre && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{e.localidad_nombre}</span>
                  )}
                </div>
              )) : (
                <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>No se encontraron resultados</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Preview + confirm (locked until selection) ── */}
      <div style={{ opacity: selected ? 1 : 0.4, pointerEvents: selected ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
        <fieldset disabled style={{ border: 'none', padding: 0, margin: 0 }}>
          <div className="form-container alta-form" style={{ marginBottom: '1.5rem' }}>
            <div className="form-card">
              
              <div className="form-section">
                <h3 className="section-title">Información Taxonómica (Solo lectura)</h3>
                <div className="form-grid">
                  <div className="form-group"><label>Nombre Común</label><input type="text" readOnly value={selected?.nombre_comun || '—'} className="input-disabled" /></div>
                  <div className="form-group"><label>Nombre Científico</label><input type="text" readOnly value={selected?.nombre_cientifico || '—'} className="input-disabled" /></div>
                  <div className="form-group"><label>Orden</label><input type="text" readOnly value={selected?.orden_nombre || '—'} className="input-disabled" /></div>
                  <div className="form-group"><label>Familia</label><input type="text" readOnly value={selected?.familia_nombre || '—'} className="input-disabled" /></div>
                  <div className="form-group"><label>Subfamilia</label><input type="text" readOnly value={selected?.subfamilia_nombre || '—'} className="input-disabled" /></div>
                  <div className="form-group"><label>Tribu</label><input type="text" readOnly value={selected?.tribu_nombre || '—'} className="input-disabled" /></div>
                  <div className="form-group"><label>Género</label><input type="text" readOnly value={selected?.genero_nombre || '—'} className="input-disabled" /></div>
                  <div className="form-group"><label>Especie</label><input type="text" readOnly value={selected?.especie_nombre || '—'} className="input-disabled" /></div>
                </div>
              </div>

              <div className="form-section-divider" style={{ margin: '1.5rem 0', borderBottom: '1px solid var(--border-color)', opacity: 0.3 }} />

              <div className="form-section">
                <h3 className="section-title">Geografía y Localización (Solo lectura)</h3>
                <div className="form-grid">
                  <div className="form-group"><label>País</label><input type="text" readOnly value={selected?.pais_nombre || '—'} className="input-disabled" /></div>
                  <div className="form-group"><label>Estado</label><input type="text" readOnly value={selected?.estado_nombre || '—'} className="input-disabled" /></div>
                  <div className="form-group"><label>Municipio</label><input type="text" readOnly value={selected?.municipio_nombre || '—'} className="input-disabled" /></div>
                  <div className="form-group"><label>Localidad</label><input type="text" readOnly value={selected?.localidad_nombre || '—'} className="input-disabled" /></div>
                  <div className="form-group"><label>Latitud (N)</label><input type="text" readOnly value={selected?.latitud_n ?? '—'} className="input-disabled" /></div>
                  <div className="form-group"><label>Longitud (O)</label><input type="text" readOnly value={selected?.longitud_o ?? '—'} className="input-disabled" /></div>
                  <div className="form-group"><label>Altitud (msnm)</label><input type="text" readOnly value={selected?.altitud ?? '—'} className="input-disabled" /></div>
                </div>
              </div>

              <div className="form-section-divider" style={{ margin: '1.5rem 0', borderBottom: '1px solid var(--border-color)', opacity: 0.3 }} />

              <div className="form-section">
                <h3 className="section-title">Datos de Colecta (Solo lectura)</h3>
                <div className="form-grid">
                  <div className="form-group"><label>Colector</label><input type="text" readOnly value={selected?.colector_nombre || '—'} className="input-disabled" /></div>
                  <div className="form-group"><label>Fecha de Colecta</label><input type="text" readOnly value={selected?.fecha_colecta ? new Date(selected.fecha_colecta).toLocaleDateString() : '—'} className="input-disabled" /></div>
                  <div className="form-group"><label>Número de Frasco / Caja</label><input type="text" readOnly value={selected?.numero_frasco || '—'} className="input-disabled" /></div>
                  <div className="form-group"><label>Planta Hospedera</label><input type="text" readOnly value={selected?.planta_nombre || '—'} className="input-disabled" /></div>
                  <div className="form-group"><label>Organismo Huésped</label><input type="text" readOnly value={selected?.organismo_nombre || '—'} className="input-disabled" /></div>
                  <div className="form-group"><label>Núm. Individuos</label><input type="text" readOnly value={selected?.num_individuos ?? '—'} className="input-disabled" /></div>
                  <div className="form-group full-width"><label>Datos Ecológicos</label><textarea readOnly value={selected?.datos_ecologicos || '—'} className="input-disabled" rows={2} style={{ padding: '0.75rem' }} /></div>
                </div>
              </div>

              <div className="form-section-divider" style={{ margin: '1.5rem 0', borderBottom: '1px solid var(--border-color)', opacity: 0.3 }} />

              <div className="form-section">
                <h3 className="section-title">Detalles de Curación (Solo lectura)</h3>
                <div className="form-grid">
                  <div className="form-group"><label>Determinador</label><input type="text" readOnly value={selected?.determinador_nombre || '—'} className="input-disabled" /></div>
                  <div className="form-group"><label>Año Identificación</label><input type="text" readOnly value={selected?.anio_identificacion ?? '—'} className="input-disabled" /></div>
                  <div className="form-group"><label>Año Catalogación</label><input type="text" readOnly value={selected?.anio_catalogacion ?? '—'} className="input-disabled" /></div>
                  <div className="form-group"><label>Colección</label><input type="text" readOnly value={selected?.coleccion_nombre || '—'} className="input-disabled" /></div>
                  <div className="form-group"><label>Cita Bibliográfica</label><input type="text" readOnly value={selected?.cita_nombre || '—'} className="input-disabled" /></div>
                  <div className="form-group"><label>Envío a Identificación</label><input type="text" readOnly value={selected?.envio_identificacion ? new Date(selected.envio_identificacion).toLocaleDateString() : '—'} className="input-disabled" /></div>
                  <div className="form-group">
                    <label>Estado del Registro</label>
                    <input type="text" readOnly value={selected?.status ? 'Activo' : 'Inactivo'} className="input-disabled" style={{ color: selected?.status ? 'var(--success-color)' : 'var(--text-muted)' }} />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </fieldset>

      </div>
    </div>
  );
};

export default Baja;

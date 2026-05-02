import React, { useState } from 'react';
import { ArrowLeft, Search, Trash2, X } from 'lucide-react';
import type { Prestamo } from './types';

interface BajaProps {
  prestamos: Prestamo[];
  selectedPrestamo: Prestamo | null;
  onBack: () => void;
  onBaja: (id: number) => void;
  onSelectPrestamo: (p: Prestamo) => void;
}

const Baja: React.FC<BajaProps> = ({ prestamos, selectedPrestamo, onBack, onBaja, onSelectPrestamo }) => {
  const [searchTerm, setSearchTerm]     = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredPrestamos = prestamos.filter(p => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return p.prestatario.toLowerCase().includes(q) || p.idPrestamo.toString().includes(q) || (p.institucion || '').toLowerCase().includes(q);
  });

  const handleSelect = (p: Prestamo) => {
    onSelectPrestamo(p);
    setSearchTerm(`#${p.idPrestamo} — ${p.prestatario}`);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onSelectPrestamo(null as any);
    setSearchTerm('');
  };

  const isReady = !!selectedPrestamo;

  return (
    <div className="screen-container animate-slide-in">
      {/* ── Header ── */}
      <div className="screen-header">
        <div className="header-with-back">
          <button className="btn-back" onClick={onBack}><ArrowLeft size={20} /></button>
          <div>
            <h2 className="screen-title">Eliminar Préstamo</h2>
            <p className="screen-subtitle">
              {selectedPrestamo
                ? `Eliminando: #${selectedPrestamo.idPrestamo} — ${selectedPrestamo.prestatario}`
                : 'Busca y selecciona un préstamo para eliminar'}
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-outline" onClick={onBack}>Cancelar</button>
          <button type="button" className="btn-danger-soft with-icon" onClick={() => {
            if (isReady && confirm('¿Estás seguro de que deseas eliminar este préstamo?')) {
              onBaja(selectedPrestamo!.idPrestamo);
            }
          }} disabled={!isReady}>
            <Trash2 size={18} />
            Eliminar Préstamo
          </button>
        </div>
      </div>

      {/* ── Buscador de préstamo ── */}
      <div className="form-card" style={{ marginBottom: '1.5rem', overflow: 'visible' }}>
        <div className="form-section" style={{ position: 'relative', marginBottom: 0 }}>
          <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Buscar Préstamo a Eliminar</label>
          <div className="search-wrapper" style={{ marginTop: '0.75rem', width: '100%', maxWidth: '700px' }}>
            <Search size={18} />
            <input type="text" placeholder="Buscar por prestatario, ID o institución..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setShowDropdown(true); if (selectedPrestamo) { onSelectPrestamo(null as any); } }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            {searchTerm && <button type="button" className="btn-clear" onClick={handleClear}><X size={16} /></button>}
          </div>
          {showDropdown && (
            <div className="search-dropdown" style={{ maxWidth: '700px' }}>
              {filteredPrestamos.length > 0 ? filteredPrestamos.slice(0, 20).map(p => (
                <div key={p.idPrestamo} className="search-dropdown-item" onMouseDown={e => { e.preventDefault(); handleSelect(p); }}>
                  <span style={{ fontWeight: 600 }}>#{p.idPrestamo}</span>
                  <span>{p.prestatario}</span>
                  {p.institucion && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.institucion}</span>}
                </div>
              )) : <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>No se encontraron resultados</div>}
            </div>
          )}
        </div>
      </div>

      {/* ── Datos + zona de peligro (igual layout que Alta) ── */}
      <div style={{ opacity: selectedPrestamo ? 1 : 0.4, pointerEvents: selectedPrestamo ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
        <div className="form-container">
          <fieldset disabled style={{ border: 'none', padding: 0, margin: 0 }}>
            <div className="form-card">
              <div className="form-section">
                <h3 className="section-title">Datos del Préstamo (Solo lectura)</h3>
                <div className="form-grid">

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '1.25rem' }} className="full-width">
                    <div className="form-group">
                      <label>ID Ejemplar</label>
                      <input type="text" readOnly value={selectedPrestamo?.idEjemplar ?? '—'} className="input-disabled" />
                    </div>
                    <div className="form-group">
                      <label>Nombre Común</label>
                      <input type="text" readOnly value={selectedPrestamo?.nombre_comun || '—'} className="input-disabled" />
                    </div>
                    <div className="form-group">
                      <label>Nombre Científico</label>
                      <input type="text" readOnly value={selectedPrestamo?.nombre_cientifico || '—'} className="input-disabled" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Prestatario</label>
                    <input type="text" readOnly value={selectedPrestamo?.prestatario || '—'} className="input-disabled" />
                  </div>
                  <div className="form-group">
                    <label>Institución</label>
                    <input type="text" readOnly value={selectedPrestamo?.institucion || '—'} className="input-disabled" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }} className="full-width">
                    <div className="form-group">
                      <label>Fecha de Préstamo</label>
                      <input type="text" readOnly value={selectedPrestamo?.fecha_prestamo ? new Date(selectedPrestamo.fecha_prestamo).toLocaleDateString() : '—'} className="input-disabled" />
                    </div>
                    <div className="form-group">
                      <label>Devolución Estimada</label>
                      <input type="text" readOnly value={selectedPrestamo?.fecha_devolucion_estimada ? new Date(selectedPrestamo.fecha_devolucion_estimada).toLocaleDateString() : '—'} className="input-disabled" />
                    </div>
                    <div className="form-group">
                      <label>Estado</label>
                      <div style={{ paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-color)' }}>
                        <span className={`status-badge ${selectedPrestamo?.estado_prestamo === 'Activo' ? 'activo' : selectedPrestamo?.estado_prestamo === 'Devuelto' ? 'inactivo' : 'baja'}`}>
                          {selectedPrestamo?.estado_prestamo || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label>Propósito</label>
                    <input type="text" readOnly value={selectedPrestamo?.proposito || '—'} className="input-disabled" />
                  </div>
                  <div className="form-group full-width">
                    <label>Observaciones</label>
                    <input type="text" readOnly value={selectedPrestamo?.observaciones || '—'} className="input-disabled" />
                  </div>

                </div>
              </div>
            </div>
          </fieldset>


        </div>
      </div>
    </div>
  );
};

export default Baja;

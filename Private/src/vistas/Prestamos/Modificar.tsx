import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Search, X } from 'lucide-react';
import type { Prestamo } from './types';

interface ModificarProps {
  prestamos: Prestamo[];
  prestamo: Prestamo | null;
  onBack: () => void;
  onUpdate: () => void;
  onSelectPrestamo: (p: Prestamo) => void;
}

interface EspecimenOpt { id_especimen: number; especie_nombre?: string; nombre_comun?: string; }

const Modificar: React.FC<ModificarProps> = ({ prestamos, prestamo, onBack, onUpdate, onSelectPrestamo }) => {
  // ── Búsqueda del préstamo ────────────────────────────────
  const [prestamoSearch, setPrestamoSearch] = useState('');
  const [showPrestamoDD, setShowPrestamoDD]  = useState(false);

  const filteredPrestamos = prestamos.filter(p => {
    if (!prestamoSearch.trim()) return true;
    const q = prestamoSearch.toLowerCase();
    return p.prestatario.toLowerCase().includes(q) || p.idPrestamo.toString().includes(q) || (p.institucion || '').toLowerCase().includes(q);
  });

  const handleSelectPrestamo = (p: Prestamo) => {
    onSelectPrestamo(p);
    setPrestamoSearch(`#${p.idPrestamo} — ${p.prestatario}`);
    setShowPrestamoDD(false);
  };

  // ── Búsqueda del ejemplar ────────────────────────────────
  const [queryEjemplar, setQueryEjemplar]     = useState('');
  const [openEjemplarDD, setOpenEjemplarDD]   = useState(false);
  const [ejemplares, setEjemplares]           = useState<EspecimenOpt[]>([]);
  const ejemplarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/especimenes').then(r => r.ok ? r.json() : []).then(setEjemplares).catch(() => {});
    const close = (e: MouseEvent) => {
      if (ejemplarRef.current && !ejemplarRef.current.contains(e.target as Node)) setOpenEjemplarDD(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const filteredEjemplares = queryEjemplar.trim() === ''
    ? []
    : ejemplares.filter(e =>
        (e.especie_nombre || '').toLowerCase().includes(queryEjemplar.toLowerCase()) ||
        e.id_especimen.toString().includes(queryEjemplar)
      );

  // ── Form data ────────────────────────────────────────────
  const [formData, setFormData] = useState<any>({
    idEjemplar: '', nombre_comun: '', nombre_cientifico: '',
    prestatario: '', institucion: '',
    fecha_prestamo: '', fecha_devolucion_estimada: '', fecha_devolucion_real: '',
    estado_prestamo: 'Activo', proposito: '', condicion_al_prestar: '', observaciones: '',
  });

  useEffect(() => {
    if (prestamo) {
      setPrestamoSearch(`#${prestamo.idPrestamo} — ${prestamo.prestatario}`);
      setQueryEjemplar(prestamo.nombre_cientifico || '');
      setFormData({
        idEjemplar:               prestamo.idEjemplar ?? '',
        nombre_comun:             prestamo.nombre_comun || '',
        nombre_cientifico:        prestamo.nombre_cientifico || '',
        prestatario:              prestamo.prestatario || '',
        institucion:              prestamo.institucion || '',
        fecha_prestamo:           prestamo.fecha_prestamo            ? new Date(prestamo.fecha_prestamo).toISOString().split('T')[0]            : '',
        fecha_devolucion_estimada:prestamo.fecha_devolucion_estimada ? new Date(prestamo.fecha_devolucion_estimada).toISOString().split('T')[0] : '',
        fecha_devolucion_real:    prestamo.fecha_devolucion_real     ? new Date(prestamo.fecha_devolucion_real).toISOString().split('T')[0]     : '',
        estado_prestamo:          prestamo.estado_prestamo || 'Activo',
        proposito:                prestamo.proposito || '',
        condicion_al_prestar:     prestamo.condicion_al_prestar || '',
        observaciones:            prestamo.observaciones || '',
      });
    }
  }, [prestamo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectEjemplar = (ej: EspecimenOpt) => {
    setFormData((prev: any) => ({
      ...prev,
      idEjemplar:        ej.id_especimen,
      nombre_cientifico: ej.especie_nombre || '',
      nombre_comun:      ej.nombre_comun || '',
    }));
    setQueryEjemplar(ej.especie_nombre || String(ej.id_especimen));
    setOpenEjemplarDD(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prestamo) return;
    try {
      const res = await fetch(`/api/prestamos/${prestamo.idPrestamo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) onUpdate();
      else alert('Error al actualizar el préstamo');
    } catch (err) {
      console.error('Error de red:', err);
    }
  };

  const isLocked = !prestamo;
  const canSave  = !isLocked && !!formData.idEjemplar && !!formData.prestatario.trim() && !!formData.fecha_prestamo;

  return (
    <div className="screen-container animate-slide-in">
      {/* ── Header ── */}
      <div className="screen-header">
        <div className="header-with-back">
          <button className="btn-back" onClick={onBack}><ArrowLeft size={20} /></button>
          <div>
            <h2 className="screen-title">Modificar Préstamo</h2>
            <p className="screen-subtitle">
              {prestamo ? `Editando: #${prestamo.idPrestamo} — ${prestamo.prestatario}` : 'Busca y selecciona un préstamo para editar'}
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-outline" onClick={onBack}>Cancelar</button>
          <button type="submit" form="modificar-prestamo-form" className="btn-primary with-icon" disabled={!canSave}>
            <Save size={18} />
            Actualizar Préstamo
          </button>
        </div>
      </div>

      {/* ── Buscador de préstamo ── */}
      <div className="form-card" style={{ marginBottom: '1.5rem', overflow: 'visible' }}>
        <div className="form-section" style={{ position: 'relative', marginBottom: 0 }}>
          <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Buscar Préstamo a Modificar</label>
          <div className="search-wrapper" style={{ marginTop: '0.75rem', width: '100%', maxWidth: '700px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Buscar por prestatario, ID o institución..."
              style={{ paddingLeft: '28px', border: 'none', borderBottom: '1px solid var(--border-color)', background: 'transparent', width: '100%' }}
              value={prestamoSearch}
              onChange={e => { setPrestamoSearch(e.target.value); setShowPrestamoDD(true); if (prestamo) onSelectPrestamo(null as any); }}
              onFocus={() => setShowPrestamoDD(true)}
              onBlur={() => setTimeout(() => setShowPrestamoDD(false), 200)}
            />
            {prestamoSearch && (
              <button type="button" className="btn-clear" onClick={() => { onSelectPrestamo(null as any); setPrestamoSearch(''); }}><X size={16} /></button>
            )}
          </div>
          {showPrestamoDD && (
            <div className="search-dropdown" style={{ maxWidth: '700px' }}>
              {filteredPrestamos.length > 0 ? filteredPrestamos.slice(0, 20).map(p => (
                <div key={p.idPrestamo} className="search-dropdown-item" onMouseDown={e => { e.preventDefault(); handleSelectPrestamo(p); }}>
                  <span style={{ fontWeight: 600 }}>#{p.idPrestamo}</span>
                  <span>{p.prestatario}</span>
                  {p.institucion && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.institucion}</span>}
                </div>
              )) : <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>No se encontraron resultados</div>}
            </div>
          )}
        </div>
      </div>

      {/* ── Formulario (igual que Alta) ── */}
      <div style={{ opacity: isLocked ? 0.45 : 1, pointerEvents: isLocked ? 'none' : 'auto', transition: 'opacity 0.3s' }}>
        <div className="form-container">
          <form id="modificar-prestamo-form" onSubmit={handleSubmit}>
            <div className="form-card">
              <div className="form-section">
                <h3 className="section-title">Datos del Préstamo</h3>
                <div className="form-grid">

                  {/* Buscar ejemplar */}
                  <div className="form-group full-width" ref={ejemplarRef}>
                    <label>Buscar Ejemplar (Autocompleta los campos de abajo)</label>
                    <div className="search-wrapper" style={{ position: 'relative' }}>
                      <Search size={18} style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input type="text" placeholder="Busca y selecciona para rellenar ID y Nombres..."
                        style={{ paddingLeft: '28px', border: 'none', borderBottom: '1px solid var(--border-color)', background: 'transparent', width: '100%' }}
                        value={queryEjemplar}
                        onChange={e => { setQueryEjemplar(e.target.value); setOpenEjemplarDD(true); }}
                        onFocus={() => setOpenEjemplarDD(true)}
                      />
                      {openEjemplarDD && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', maxHeight: '250px', overflowY: 'auto', zIndex: 100, boxShadow: '0 10px 15px -3px rgba(0,0,0,.5)' }}>
                          {filteredEjemplares.length === 0 ? (
                            <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                              {queryEjemplar.trim() ? 'Sin resultados' : 'Escribe para buscar...'}
                            </div>
                          ) : filteredEjemplares.map(ej => (
                            <div key={ej.id_especimen} className="search-dropdown-item" onMouseDown={() => handleSelectEjemplar(ej)}>
                              <span style={{ fontWeight: 600 }}>#{String(ej.id_especimen).padStart(5, '0')}</span>
                              <span style={{ fontStyle: 'italic' }}>{ej.especie_nombre || 'Sin identificar'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '1.25rem' }} className="full-width">
                    <div className="form-group">
                      <label>ID Ejemplar</label>
                      <input type="number" name="idEjemplar" value={formData.idEjemplar} onChange={handleChange} required readOnly placeholder="..." />
                    </div>
                    <div className="form-group">
                      <label>Nombre Común</label>
                      <input type="text" name="nombre_comun" value={formData.nombre_comun} onChange={handleChange} readOnly placeholder="..." />
                    </div>
                    <div className="form-group">
                      <label>Nombre Científico</label>
                      <input type="text" name="nombre_cientifico" value={formData.nombre_cientifico} onChange={handleChange} readOnly placeholder="..." />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Prestatario</label>
                    <input type="text" name="prestatario" value={formData.prestatario} onChange={handleChange} required placeholder="Nombre del investigador o persona que solicita el préstamo" />
                  </div>
                  <div className="form-group">
                    <label>Institución</label>
                    <input type="text" name="institucion" value={formData.institucion} onChange={handleChange} placeholder="Universidad de Guanajuato" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }} className="full-width">
                    <div className="form-group">
                      <label>Fecha de Préstamo</label>
                      <input type="date" name="fecha_prestamo" value={formData.fecha_prestamo} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>Fecha Devolución Estimada</label>
                      <input type="date" name="fecha_devolucion_estimada" value={formData.fecha_devolucion_estimada} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Estado</label>
                      <select name="estado_prestamo" value={formData.estado_prestamo} onChange={handleChange}>
                        <option value="Activo">Activo</option>
                        <option value="Devuelto">Devuelto</option>
                        <option value="Vencido">Vencido</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Fecha Devolución Real</label>
                    <input type="date" name="fecha_devolucion_real" value={formData.fecha_devolucion_real} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Condición al Prestar</label>
                    <input type="text" name="condicion_al_prestar" value={formData.condicion_al_prestar} onChange={handleChange} placeholder="Estado físico del ejemplar" />
                  </div>

                  <div className="form-group full-width">
                    <label>Propósito</label>
                    <input type="text" name="proposito" value={formData.proposito} onChange={handleChange} placeholder="Razón del préstamo" />
                  </div>
                  <div className="form-group full-width">
                    <label>Observaciones</label>
                    <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows={3} placeholder="Notas adicionales" />
                  </div>

                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Modificar;

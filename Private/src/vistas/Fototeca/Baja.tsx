import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Search, X } from 'lucide-react';
import type { Foto } from './types';

interface BajaProps {
  fotos: Foto[];
  foto: Foto | null;
  onBack: () => void;
  onSaved: () => void;
  onSelectFoto: (foto: Foto | null) => void;
}

const Baja: React.FC<BajaProps> = ({ fotos, foto, onBack, onSaved, onSelectFoto }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (foto) {
      setSearchTerm(foto.descripcion_foto || `#${foto.id_foto}`);
    } else {
      setSearchTerm('');
    }
  }, [foto]);

  const filteredFotos = searchTerm.trim() === ''
    ? fotos
    : fotos.filter(f =>
        (f.descripcion_foto || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.ruta_archivo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(f.id_especimen).includes(searchTerm) ||
        String(f.id_foto).includes(searchTerm)
      );

  const handleDelete = async () => {
    if (!foto) return;
    if (!confirm('¿Estás seguro de dar de baja esta imagen? (se marcará como inactiva)')) {
      return;
    }
    try {
      const response = await fetch(`/api/fototeca/${foto.id_foto}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        onSaved();
      } else {
        console.error('Error al dar de baja la imagen');
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  return (
    <div className="fototeca-module screen-container animate-slide-in">
      <div className="screen-header">
        <div className="header-with-back">
          <button className="btn-back" type="button" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="screen-title">Dar de Baja Imagen</h2>
            <p className="screen-subtitle">
              {foto ? `Eliminar la imagen: ${foto.descripcion_foto || `#${foto.id_foto}`}` : 'Busca y selecciona una imagen para eliminar'}
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-outline" onClick={onBack}>Cancelar</button>
          <button
            type="button"
            className="btn-danger-soft with-icon"
            onClick={handleDelete}
            disabled={!foto}
          >
            <Trash2 size={18} />
            Eliminar Imagen
          </button>
        </div>
      </div>

      <div className="form-card" style={{ marginBottom: '1.5rem', overflow: 'visible' }}>
        <div className="form-section" style={{ position: 'relative' }}>
          <label>Buscar Imagen a Eliminar</label>
          <div className="search-wrapper" style={{ marginTop: '0.5rem', width: '100%', maxWidth: '600px' }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar por descripción, ruta, ID foto o espécimen..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            {searchTerm && (
              <button
                type="button"
                className="btn-clear"
                onClick={() => {
                  setSearchTerm('');
                  onSelectFoto(null);
                  setShowDropdown(false);
                }}
                title="Limpiar búsqueda"
              >
                <X size={18} />
              </button>
            )}
          </div>
          {showDropdown && (
            <div className="search-dropdown" style={{ maxWidth: '600px' }}>
              {filteredFotos.length > 0 ? filteredFotos.map(f => (
                <div
                  key={f.id_foto}
                  className="search-dropdown-item"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelectFoto(f);
                    setSearchTerm(f.descripcion_foto || `#${f.id_foto}`);
                    setShowDropdown(false);
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{f.descripcion_foto || `Imagen #${f.id_foto}`}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Espécimen: {f.id_especimen} | Ruta: {f.ruta_archivo.slice(0, 40)}{f.ruta_archivo.length > 40 ? '…' : ''}
                  </span>
                </div>
              )) : (
                <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>No se encontraron resultados</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="form-container-split" style={{ opacity: foto ? 1 : 0.5, pointerEvents: foto ? 'auto' : 'none' }}>
        <form key={foto?.id_foto ?? 'empty'} className="split-layout-form" onSubmit={(e) => { e.preventDefault(); }}>
          <div className="form-left-column">

            <fieldset disabled style={{ border: 'none', padding: 0, margin: 0, width: '100%' }}>
              <div className="form-card">
                <div className="form-section">
                  <h3 className="section-title">Datos de la imagen (solo lectura)</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Id espécimen</label>
                      <input type="text" readOnly value={foto?.id_especimen ?? ''} />
                    </div>
                    <div className="form-group">
                      <label>Id colector</label>
                      <input type="text" readOnly value={foto?.id_colector ?? ''} />
                    </div>
                    <div className="form-group">
                      <label>Id determinador</label>
                      <input type="text" readOnly value={foto?.id_determinador ?? ''} />
                    </div>
                    <div className="form-group full-width">
                      <label>Ruta archivo</label>
                      <input type="text" readOnly value={foto?.ruta_archivo ?? ''} />
                    </div>
                    <div className="form-group full-width">
                      <label>Descripción</label>
                      <input type="text" readOnly value={foto?.descripcion_foto ?? ''} />
                    </div>
                    <div className="form-group">
                      <label>Fecha subida</label>
                      <input type="text" readOnly value={foto?.fecha_subida ? String(foto.fecha_subida) : ''} />
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>

          </div>
        </form>
      </div>
    </div>
  );
};

export default Baja;

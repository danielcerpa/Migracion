import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Search, X } from 'lucide-react';
import type { Foto } from './types';

interface ModificarProps {
  fotos: Foto[];
  foto: Foto | null;
  onBack: () => void;
  onSaved: () => void;
  onSelectFoto: (foto: Foto | null) => void;
}

const Modificar: React.FC<ModificarProps> = ({ fotos, foto, onBack, onSaved, onSelectFoto }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [id_especimen, setIdEspecimen] = useState('');
  const [ruta_archivo, setRutaArchivo] = useState('');
  const [descripcion_foto, setDescripcionFoto] = useState('');
  const [id_colector, setIdColector] = useState('');
  const [id_determinador, setIdDeterminador] = useState('');

  useEffect(() => {
    if (foto) {
      setSearchTerm(foto.descripcion_foto || `#${foto.id_foto}`);
      setIdEspecimen(String(foto.id_especimen));
      setRutaArchivo(foto.ruta_archivo);
      setDescripcionFoto(foto.descripcion_foto ?? '');
      setIdColector(foto.id_colector != null ? String(foto.id_colector) : '');
      setIdDeterminador(foto.id_determinador != null ? String(foto.id_determinador) : '');
    } else {
      setSearchTerm('');
      setIdEspecimen('');
      setRutaArchivo('');
      setDescripcionFoto('');
      setIdColector('');
      setIdDeterminador('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foto) return;
    const idEsp = Number(id_especimen);
    if (!Number.isFinite(idEsp) || idEsp < 1) {
      console.error('Id espécimen inválido');
      return;
    }
    const body: Record<string, unknown> = {
      id_especimen: idEsp,
      ruta_archivo: ruta_archivo.trim(),
      descripcion_foto: descripcion_foto.trim() === '' ? null : descripcion_foto.trim(),
    };
    const c = id_colector.trim();
    const d = id_determinador.trim();
    body.id_colector = c === '' ? null : Number(c);
    body.id_determinador = d === '' ? null : Number(d);
    if (c !== '' && !Number.isFinite(body.id_colector as number)) {
      console.error('Id colector inválido');
      return;
    }
    if (d !== '' && !Number.isFinite(body.id_determinador as number)) {
      console.error('Id determinador inválido');
      return;
    }

    try {
      const response = await fetch(`/api/fototeca/${foto.id_foto}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        onSaved();
      } else {
        console.error('Error al actualizar la imagen');
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  return (
    <div className="fototeca-module screen-container animate-slide-in">
      <div className="screen-header">
        <div className="header-with-back">
          <button
            className="btn-back"
            type="button"
            onClick={onBack}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="screen-title">Actualizar imagen</h2>
            <p className="screen-subtitle">
              {foto ? `Editando: ${foto.descripcion_foto || `#${foto.id_foto}`}` : 'Busca y selecciona una imagen para modificar'}
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-outline" onClick={onBack}>Cancelar</button>
          <button type="submit" form="fototeca-mod-form" className="btn-primary with-icon" disabled={!foto}>
            <Save size={18} />
            Guardar cambios
          </button>
        </div>
      </div>

      <div className="form-card" style={{ marginBottom: '1.5rem', overflow: 'visible' }}>
        <div className="form-section" style={{ position: 'relative' }}>
          <label>Buscar Imagen a Modificar</label>
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
                <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                  No se encontraron resultados
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="form-container-split" style={{ opacity: foto ? 1 : 0.5, pointerEvents: foto ? 'auto' : 'none' }}>
        <form
          id="fototeca-mod-form"
          key={foto?.id_foto ?? 'empty'}
          className="split-layout-form"
          onSubmit={handleSubmit}
        >
          <div className="form-left-column">
            <div className="form-card">
              <div className="form-section">
                <h3 className="section-title">Datos de la imagen</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Id espécimen</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={id_especimen}
                      onChange={(e) => setIdEspecimen(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Id colector (opcional)</label>
                    <input
                      type="number"
                      min={1}
                      placeholder="Vacío si no aplica"
                      value={id_colector}
                      onChange={(e) => setIdColector(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Id determinador (opcional)</label>
                    <input
                      type="number"
                      min={1}
                      placeholder="Vacío si no aplica"
                      value={id_determinador}
                      onChange={(e) => setIdDeterminador(e.target.value)}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Ruta archivo</label>
                    <input
                      type="text"
                      required
                      maxLength={255}
                      value={ruta_archivo}
                      onChange={(e) => setRutaArchivo(e.target.value)}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Descripción (opcional)</label>
                    <input
                      type="text"
                      maxLength={255}
                      value={descripcion_foto}
                      onChange={(e) => setDescripcionFoto(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modificar;

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Search } from 'lucide-react';
import type { CatalogSection, CatalogEntity } from './types'; 

interface BajaProps {
  section: CatalogSection;
  items: CatalogEntity[];
  item: CatalogEntity | null;
  onBack: () => void;
  onSelect: (item: CatalogEntity) => void;
  onBaja: (id: number) => Promise<void>;
}

const Baja: React.FC<BajaProps> = ({ section, items, item, onBack, onSelect, onBaja }) => {
  const [form, setForm] = useState<Record<string, string | number | boolean>>({});
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const getIdKey = (s: CatalogSection) => {
    if (s === 'organismo') return 'idOrganismo';
    return `id${s.charAt(0).toUpperCase()}${s.slice(1)}`;
  };

  useEffect(() => {
    if (item) {
      setForm(item as unknown as Record<string, string | number | boolean>);
      const nameGuess = (item as any).nombre || (item as any).nombre_cientifico || (item as any).nombre_organismo || (item as any).titulo || '';
      setSearchTerm(nameGuess ? String(nameGuess) : `Registro #${(item as any)[getIdKey(section)]}`);
    } else {
      setForm({});
      setSearchTerm('');
    }
  }, [item, section]);

  const lq = searchTerm.toLowerCase();
  const filteredItems = searchTerm.trim() === '' ? items : items.filter(it => {
    return Object.values(it).some(val => 
       typeof val === 'string' && val.toLowerCase().includes(lq)
    );
  });

  const val = (key: string, fallback = '') => (form[key] !== undefined ? String(form[key]) : fallback);
  const numVal = (key: string) => (form[key] !== undefined ? Number(form[key]) : '');

  const handleBajaSubmit = async () => {
    if (!item) return;
    setSaving(true);
    try {
      const idKey = getIdKey(section);
      const id = (item as any)[idKey];
      await onBaja(id);
    } finally {
      setSaving(false);
    }
  };

  const sectionTitles: Record<CatalogSection, string> = {
    pais: 'País',
    estado: 'Estado',
    municipio: 'Municipio',
    localidad: 'Localidad',
    orden: 'Orden',
    familia: 'Familia',
    subfamilia: 'Subfamilia',
    tribu: 'Tribu',
    genero: 'Género',
    especie: 'Especie',
    tipo: 'Tipo',
    colector: 'Colector',
    determinador: 'Determinador',
    planta: 'Planta / Hospedero',
    organismo: 'Organismo Hospedero',
    coleccion: 'Colección',
    cita: 'Cita Bibliográfica'
  };

  const renderFields = () => {
    switch (section) {
      case 'pais':
        return (
          <div className="form-grid-2">
            <div className="form-group"><label>Nombre del País</label><input type="text" value={val('nombre')} readOnly /></div>
            <div className="form-group"><label>Código (ISO)</label><input type="text" value={val('codigo')} readOnly /></div>
          </div>
        );
      case 'estado':
        return (
          <div className="form-grid-2">
            <div className="form-group"><label>ID País</label><input type="number" value={numVal('idPais')} readOnly /></div>
            <div className="form-group"><label>Nombre del Estado</label><input type="text" value={val('nombre')} readOnly /></div>
          </div>
        );
      case 'municipio':
        return (
          <div className="form-grid-2">
            <div className="form-group"><label>ID Estado</label><input type="number" value={numVal('idEstado')} readOnly /></div>
            <div className="form-group"><label>Nombre del Municipio</label><input type="text" value={val('nombre')} readOnly /></div>
          </div>
        );
      case 'localidad':
        return (
          <>
            <div className="form-grid-2">
              <div className="form-group"><label>ID Municipio</label><input type="number" value={numVal('idMunicipio')} readOnly /></div>
              <div className="form-group"><label>Nombre de la Localidad</label><input type="text" value={val('nombre')} readOnly /></div>
            </div>
            <div className="form-grid-3">
              <div className="form-group"><label>Latitud</label><input type="text" value={val('latitud')} readOnly /></div>
              <div className="form-group"><label>Longitud</label><input type="text" value={val('longitud')} readOnly /></div>
              <div className="form-group"><label>Altitud</label><input type="text" value={val('altitud')} readOnly /></div>
            </div>
          </>
        );
      case 'colector':
      case 'determinador':
        return (
          <>
            <div className="form-grid-2">
              <div className="form-group"><label>Nombre(s)</label><input type="text" value={val('nombre')} readOnly /></div>
              <div className="form-group"><label>Apellido Paterno</label><input type="text" value={val('apellido_paterno')} readOnly /></div>
            </div>
            <div className="form-grid-2">
              <div className="form-group"><label>Apellido Materno</label><input type="text" value={val('apellido_materno')} readOnly /></div>
              <div className="form-group"><label>Correo</label><input type="text" value={val('correo')} readOnly /></div>
            </div>
            <div className="form-group"><label>Institución</label><input type="text" value={val('institucion')} readOnly /></div>
          </>
        );
      case 'planta':
        return (
          <div className="form-grid-2">
            <div className="form-group"><label>Familia Botánica</label><input type="text" value={val('familia_botanica')} readOnly /></div>
            <div className="form-group"><label>Nombre Científico</label><input type="text" value={val('nombre_cientifico')} readOnly /></div>
          </div>
        );
      case 'organismo':
        return (
          <div className="form-grid-2">
            <div className="form-group"><label>Familia Hospedera</label><input type="text" value={val('familia_hospedera')} readOnly /></div>
            <div className="form-group"><label>Nombre Organismo</label><input type="text" value={val('nombre_organismo')} readOnly /></div>
          </div>
        );
      case 'cita':
        return (
          <>
            <div className="form-group"><label>Título</label><input type="text" value={val('titulo')} readOnly /></div>
            <div className="form-grid-3">
              <div className="form-group"><label>Autores</label><input type="text" value={val('autores')} readOnly /></div>
              <div className="form-group"><label>Revista</label><input type="text" value={val('revista')} readOnly /></div>
              <div className="form-group"><label>Año</label><input type="number" value={numVal('anio')} readOnly /></div>
            </div>
            <div className="form-grid-2">
              <div className="form-group"><label>Volumen</label><input type="text" value={val('volumen')} readOnly /></div>
              <div className="form-group"><label>Páginas</label><input type="text" value={val('paginas')} readOnly /></div>
            </div>
            <div className="form-group"><label>Referencia Completa</label><textarea value={val('referencia_completa')} readOnly style={{ width: '100%', minHeight: '80px', borderRadius: '8px', padding: '10px' }} /></div>
          </>
        );
      default:
        return <div className="form-group"><label>Nombre</label><input type="text" value={val('nombre')} readOnly /></div>;
    }
  };

  return (
    <div className="screen-container animate-slide-in">
      <div className="screen-header">
        <div className="header-with-back">
          <button className="btn-back" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="screen-title">Dar de Baja {sectionTitles[section]}</h2>
            <p className="screen-subtitle">
              {item ? 'Visualiza los datos antes de eliminarlos' : `Busca y selecciona un registro de ${sectionTitles[section].toLowerCase()} para eliminar`}
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-outline" onClick={onBack} disabled={saving}>Cancelar</button>
          <button 
            type="button" 
            className="btn-danger-soft with-icon" 
            onClick={() => {
              if (confirm('¿Estás completamente seguro de inhabilitar este registro?')) {
                handleBajaSubmit();
              }
            }} 
            disabled={!item || saving}
          >
            <Trash2 size={18} />
            {saving ? 'Procesando...' : 'Eliminar Registro'}
          </button>
        </div>
      </div>

      <div className="form-card" style={{ marginBottom: '1.5rem', overflow: 'visible' }}>
        <div className="form-section" style={{ position: 'relative' }}>
          <label>Buscar {sectionTitles[section]} a Eliminar</label>
          <div className="search-wrapper" style={{ marginTop: '0.5rem', width: '100%', maxWidth: '600px' }}>
            <Search size={18} />
            <input
              type="text"
              placeholder={`Buscar en ${sectionTitles[section].toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
          </div>
          {showDropdown && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, maxWidth: '600px', maxHeight: '200px',
              overflowY: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: '0.5rem', marginTop: '0.5rem', zIndex: 1000, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              {filteredItems.length > 0 ? filteredItems.map((it: any) => {
                const idKey = getIdKey(section);
                const id = it[idKey];
                const displayTitle = it.nombre || it.nombre_cientifico || it.nombre_organismo || it.titulo || it.familia || it.acronimo || `ID #${id}`;
                const displaySub = it.codigo || it.autores || it.especie || it.apellido_paterno || '';

                return (
                  <div key={id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onSelect(it);
                      setSearchTerm(String(displayTitle));
                      setShowDropdown(false);
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{displayTitle} <span style={{ color: 'var(--text-muted)' }}>#{id}</span></span>
                    {displaySub && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{displaySub}</span>}
                  </div>
                )
              }) : (
                <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>No se encontraron resultados</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="form-card" style={{ maxWidth: '720px', opacity: item ? 1 : 0.5, pointerEvents: item ? 'auto' : 'none' }}>
        <fieldset disabled style={{ border: 'none', padding: 0, margin: 0 }}>
          <div className="form-section">
            <h3 className="section-title">Datos (Modo Lectura) de {sectionTitles[section]}</h3>
            {renderFields()}
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label>Estado</label>
              <select
                value={form['status'] === false ? 'false' : 'true'}
                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--text-color)', padding: '0.6rem 0', width: '100%', fontSize: '0.95rem' }}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  );
};

export default Baja;

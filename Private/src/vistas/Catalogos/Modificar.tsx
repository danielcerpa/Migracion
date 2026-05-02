import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { CatalogSection, CatalogEntity } from './types';

interface ModificarProps {
  section: CatalogSection;
  items: CatalogEntity[];
  parentItems: CatalogEntity[];
  item: CatalogEntity | null;
  onBack: () => void;
  onSelect: (item: CatalogEntity) => void;
  onSave: (data: Partial<CatalogEntity>) => Promise<void>;
}

const Modificar: React.FC<ModificarProps> = ({ section, items, parentItems, item, onBack, onSelect, onSave }) => {
  const [form, setForm] = useState<Record<string, string | number | boolean>>({});
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Paginación y Búsqueda para Referencia (Side Panel)
  const [refSearch, setRefSearch] = useState('');
  const [refPage, setRefPage] = useState(1);
  const [refRows, setRefRows] = useState(10);

  const getIdKey = (s: CatalogSection) => {
    if (s === 'organismo') return 'idOrganismo';
    return `id${s.charAt(0).toUpperCase()}${s.slice(1)}`;
  };

  const idKey = getIdKey(section);

  useEffect(() => {
    if (item) {
      setForm(item as unknown as Record<string, string | number | boolean>);
      const name = (item as any).nombre || (item as any).nombre_cientifico || (item as any).nombre_organismo || (item as any).titulo || (item as any).acronimo || '';
      if (!searchTerm) setSearchTerm(name ? String(name) : `Registro #${(item as any)[idKey]}`);
    } else {
      setForm({});
    }
  }, [item, section]);

  const lq = searchTerm.toLowerCase();
  const filteredItems = searchTerm.trim() === '' ? items : items.filter(it => {
    return Object.values(it).some(val => 
       val !== null && val !== undefined && String(val).toLowerCase().includes(lq)
    );
  }).slice(0, 10);

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

  const refCfg = (() => {
    const titles = sectionTitles[section];
    if (section === 'estado') return { header: 'Países Registrados', source: parentItems, idKey: 'idPais', cols: [{ label: 'ID', key: 'idPais', center: true, width: '60px' }, { label: 'Nombre', key: 'nombre' }] };
    if (section === 'municipio') return { header: 'Estados Registrados', source: parentItems, idKey: 'idEstado', cols: [{ label: 'ID', key: 'idEstado', center: true, width: '60px' }, { label: 'Nombre', key: 'nombre' }] };
    if (section === 'localidad') return { header: 'Municipios Registrados', source: parentItems, idKey: 'idMunicipio', cols: [{ label: 'ID', key: 'idMunicipio', center: true, width: '60px' }, { label: 'Nombre', key: 'nombre' }] };
    if (section === 'familia') return { header: 'Órdenes Registrados', source: parentItems, idKey: 'idOrden', cols: [{ label: 'ID', key: 'idOrden', center: true, width: '60px' }, { label: 'Nombre', key: 'nombre' }] };
    if (section === 'subfamilia') return { header: 'Familias Registradas', source: parentItems, idKey: 'idFamilia', cols: [{ label: 'ID', key: 'idFamilia', center: true, width: '60px' }, { label: 'Nombre', key: 'nombre' }] };
    if (section === 'tribu') return { header: 'Subfamilias Registradas', source: parentItems, idKey: 'idSubfamilia', cols: [{ label: 'ID', key: 'idSubfamilia', center: true, width: '60px' }, { label: 'Nombre', key: 'nombre' }] };
    if (section === 'genero') return { header: 'Tribus Registradas', source: parentItems, idKey: 'idTribu', cols: [{ label: 'ID', key: 'idTribu', center: true, width: '60px' }, { label: 'Nombre', key: 'nombre' }] };
    if (section === 'especie') return { header: 'Géneros Registrados', source: parentItems, idKey: 'idGenero', cols: [{ label: 'ID', key: 'idGenero', center: true, width: '60px' }, { label: 'Nombre', key: 'nombre' }] };

    const base = { header: `${titles} Registrados`, source: items, idKey: idKey, cols: [] as any[] };
    if (section === 'pais') base.cols = [{ label: 'Nombre', key: 'nombre' }, { label: 'ISO', key: 'codigo', center: true, width: '80px' }];
    else if (section === 'cita') base.cols = [{ label: 'Título', key: 'titulo' }, { label: 'Año', key: 'anio', center: true, width: '70px' }];
    else base.cols = [{ label: 'Nombre', key: 'nombre' }, { label: 'ID', key: idKey, center: true, width: '70px' }];
    return base;
  })();

  const filteredRef = refSearch.trim() === '' ? refCfg.source : (refCfg.source as any[]).filter(it => 
    Object.values(it).some(val => val !== null && val !== undefined && String(val).toLowerCase().includes(refSearch.toLowerCase()))
  );
  const totalRefPages = Math.ceil(filteredRef.length / refRows);
  const paginatedRef = (filteredRef as any[]).slice((refPage - 1) * refRows, refPage * refRows);

  useEffect(() => { setRefPage(1); }, [refSearch]);

  const set = (key: string, value: string | number | boolean) => setForm(prev => ({ ...prev, [key]: value }));
  const val = (key: string, fb = '') => form[key] !== undefined ? String(form[key]) : fb;
  const numVal = (key: string) => form[key] !== undefined && form[key] !== null ? Number(form[key]) : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form as Partial<CatalogEntity>); } finally { setSaving(false); }
  };

  const renderFields = () => {
    switch (section) {
      case 'pais': return (
        <div className="form-grid-2">
          <div className="form-group"><label>Nombre del País *</label><input type="text" required value={val('nombre')} onChange={e => set('nombre', e.target.value)} /></div>
          <div className="form-group"><label>ISO</label><input type="text" maxLength={5} value={val('codigo')} onChange={e => set('codigo', e.target.value)} /></div>
        </div>
      );
      case 'estado': return (
        <div className="form-grid-2">
          <div className="form-group"><label>ID País *</label><input type="number" required value={numVal('idPais')} onChange={e => set('idPais', +e.target.value)} /></div>
          <div className="form-group"><label>Nombre del Estado *</label><input type="text" required value={val('nombre')} onChange={e => set('nombre', e.target.value)} /></div>
        </div>
      );
      case 'municipio': return (
        <div className="form-grid-2">
          <div className="form-group"><label>ID Estado *</label><input type="number" required value={numVal('idEstado')} onChange={e => set('idEstado', +e.target.value)} /></div>
          <div className="form-group"><label>Nombre del Municipio *</label><input type="text" required value={val('nombre')} onChange={e => set('nombre', e.target.value)} /></div>
        </div>
      );
      case 'localidad': return (
        <><div className="form-grid-2">
          <div className="form-group"><label>ID Municipio *</label><input type="number" required value={numVal('idMunicipio')} onChange={e => set('idMunicipio', +e.target.value)} /></div>
          <div className="form-group"><label>Nombre de la Localidad *</label><input type="text" required value={val('nombre')} onChange={e => set('nombre', e.target.value)} /></div>
        </div><div className="form-grid-3">
          <div className="form-group"><label>Latitud</label><input type="text" value={val('latitud')} onChange={e => set('latitud', e.target.value)} /></div>
          <div className="form-group"><label>Longitud</label><input type="text" value={val('longitud')} onChange={e => set('longitud', e.target.value)} /></div>
          <div className="form-group"><label>Altitud</label><input type="text" value={val('altitud')} onChange={e => set('altitud', e.target.value)} /></div>
        </div></>
      );
      case 'orden':
      case 'tipo': return (
        <div className="form-group">
          <label>Nombre *</label>
          <input type="text" required value={val('nombre')} onChange={e => set('nombre', e.target.value)} />
        </div>
      );
      case 'familia': return (
        <div className="form-grid-2">
          <div className="form-group"><label>ID Orden</label><input type="number" value={numVal('idOrden')} onChange={e => set('idOrden', +e.target.value)} /></div>
          <div className="form-group"><label>Nombre *</label><input type="text" required value={val('nombre')} onChange={e => set('nombre', e.target.value)} /></div>
        </div>
      );
      case 'subfamilia': return (
        <div className="form-grid-2">
          <div className="form-group"><label>ID Familia</label><input type="number" value={numVal('idFamilia')} onChange={e => set('idFamilia', +e.target.value)} /></div>
          <div className="form-group"><label>Nombre *</label><input type="text" required value={val('nombre')} onChange={e => set('nombre', e.target.value)} /></div>
        </div>
      );
      case 'tribu': return (
        <div className="form-grid-2">
          <div className="form-group"><label>ID Subfamilia</label><input type="number" value={numVal('idSubfamilia')} onChange={e => set('idSubfamilia', +e.target.value)} /></div>
          <div className="form-group"><label>Nombre *</label><input type="text" required value={val('nombre')} onChange={e => set('nombre', e.target.value)} /></div>
        </div>
      );
      case 'genero': return (
        <div className="form-grid-2">
          <div className="form-group"><label>ID Tribu</label><input type="number" value={numVal('idTribu')} onChange={e => set('idTribu', +e.target.value)} /></div>
          <div className="form-group"><label>Nombre *</label><input type="text" required value={val('nombre')} onChange={e => set('nombre', e.target.value)} /></div>
        </div>
      );
      case 'especie': return (
        <><div className="form-grid-2">
          <div className="form-group"><label>ID Género</label><input type="number" value={numVal('idGenero')} onChange={e => set('idGenero', +e.target.value)} /></div>
          <div className="form-group"><label>Nombre *</label><input type="text" required value={val('nombre')} onChange={e => set('nombre', e.target.value)} /></div>
        </div>
        <div className="form-group"><label>Subespecie</label><input type="text" value={val('subespecie')} onChange={e => set('subespecie', e.target.value)} /></div></>
      );
      case 'colector':
      case 'determinador': return (
        <><div className="form-grid-2">
          <div className="form-group"><label>Nombre(s) *</label><input type="text" required value={val('nombre')} onChange={e => set('nombre', e.target.value)} /></div>
          <div className="form-group"><label>Apellido Paterno</label><input type="text" value={val('apellido_paterno')} onChange={e => set('apellido_paterno', e.target.value)} /></div>
        </div><div className="form-grid-2">
          <div className="form-group"><label>Apellido Materno</label><input type="text" value={val('apellido_materno')} onChange={e => set('apellido_materno', e.target.value)} /></div>
          <div className="form-group"><label>Correo</label><input type="email" value={val('correo')} onChange={e => set('correo', e.target.value)} /></div>
        </div>
        <div className="form-group"><label>Institución</label><input type="text" value={val('institucion')} onChange={e => set('institucion', e.target.value)} /></div></>
      );
      case 'planta': return (
        <><div className="form-grid-2">
          <div className="form-group"><label>Familia Botánica</label><input type="text" value={val('familia_botanica')} onChange={e => set('familia_botanica', e.target.value)} /></div>
          <div className="form-group"><label>Nombre Científico *</label><input type="text" required value={val('nombre_cientifico')} onChange={e => set('nombre_cientifico', e.target.value)} /></div>
        </div>
        <div className="form-group"><label>Nombre Común</label><input type="text" value={val('nombre_comun')} onChange={e => set('nombre_comun', e.target.value)} /></div></>
      );
      case 'organismo': return (
        <div className="form-grid-2">
          <div className="form-group"><label>Familia Hospedera</label><input type="text" value={val('familia_hospedera')} onChange={e => set('familia_hospedera', e.target.value)} /></div>
          <div className="form-group"><label>Nombre Organismo *</label><input type="text" required value={val('nombre_organismo')} onChange={e => set('nombre_organismo', e.target.value)} /></div>
        </div>
      );
      case 'coleccion': return (
        <div className="form-grid-2">
          <div className="form-group"><label>Acrónimo *</label><input type="text" required value={val('acronimo')} onChange={e => set('acronimo', e.target.value)} /></div>
          <div className="form-group"><label>Nombre Institución</label><input type="text" value={val('nombre_institucion')} onChange={e => set('nombre_institucion', e.target.value)} /></div>
        </div>
      );
      case 'cita': return (
        <><div className="form-group"><label>Título *</label><input type="text" required value={val('titulo')} onChange={e => set('titulo', e.target.value)} /></div>
        <div className="form-grid-2">
          <div className="form-group"><label>Autores</label><input type="text" value={val('autores')} onChange={e => set('autores', e.target.value)} /></div>
          <div className="form-group"><label>Año</label><input type="number" value={numVal('anio')} onChange={e => set('anio', +e.target.value)} /></div>
        </div><div className="form-grid-3">
          <div className="form-group"><label>Revista</label><input type="text" value={val('revista')} onChange={e => set('revista', e.target.value)} /></div>
          <div className="form-group"><label>Volumen</label><input type="text" value={val('volumen')} onChange={e => set('volumen', e.target.value)} /></div>
          <div className="form-group"><label>Páginas</label><input type="text" value={val('paginas')} onChange={e => set('paginas', e.target.value)} /></div>
        </div>
        <div className="form-group"><label>Referencia Completa</label><textarea value={val('referencia_completa')} onChange={e => set('referencia_completa', e.target.value)} style={{ width: '100%', minHeight: '80px', borderRadius: '8px', padding: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }} /></div></>
      );
      default: return null;
    }
  };

  return (
    <div className="screen-container animate-slide-in">
      <div className="screen-header">
        <div className="header-with-back">
          <button className="btn-back" onClick={onBack}><ArrowLeft size={20} /></button>
          <div>
            <h2 className="screen-title">Modificar {sectionTitles[section]}</h2>
            <p className="screen-subtitle">{item ? 'Edita los datos del registro' : `Busca y selecciona un ${sectionTitles[section].toLowerCase()} para editar`}</p>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-outline" onClick={onBack}>Cancelar</button>
          <button type="submit" form="catalog-mod-form" className="btn-primary with-icon" disabled={saving || !item}>
            <Save size={18} /> {saving ? 'Guardando...' : 'Actualizar Registro'}
          </button>
        </div>
      </div>

      <div className="form-card" style={{ marginBottom: '1.5rem', overflow: 'visible' }}>
        <div className="form-section" style={{ position: 'relative' }}>
          <label>Buscar {sectionTitles[section]} a Modificar</label>
          <div className="search-wrapper" style={{ marginTop: '0.5rem', width: '100%', maxWidth: '600px' }}>
            <Search size={18} />
            <input
              type="text"
              placeholder={`Escribe el nombre del ${sectionTitles[section].toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            {searchTerm && (
              <button type="button" className="btn-clear" onClick={() => { setSearchTerm(''); onSelect(null as any); setShowDropdown(false); }}>
                <X size={18} />
              </button>
            )}
          </div>
          {showDropdown && (
            <div className="search-dropdown" style={{ maxWidth: '600px' }}>
              {filteredItems.length > 0 ? filteredItems.map((it: any) => {
                const label = it.nombre || it.nombre_cientifico || it.nombre_organismo || it.titulo || it.acronimo || 'Sin nombre';
                return (
                  <div key={it[idKey]} className="search-dropdown-item" onMouseDown={(e) => { e.preventDefault(); onSelect(it); setShowDropdown(false); }}>
                    <span style={{ fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: #{it[idKey]}</span>
                  </div>
                );
              }) : <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>No se encontraron resultados</div>}
            </div>
          )}
        </div>
      </div>

      <div className="form-container-split" style={{ opacity: item ? 1 : 0.5, pointerEvents: item ? 'auto' : 'none' }}>
        <div className="split-layout-form">
          <div className="form-left-column">
            <div className="form-card">
              <form id="catalog-mod-form" onSubmit={handleSubmit} key={item ? (item as any)[idKey] : 'empty'}>
                <div className="form-section">
                  <h3 className="section-title">Datos del Registro</h3>
                  {renderFields()}

                </div>
              </form>
            </div>
          </div>

          <div className="form-right-column">
            <div className="form-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="form-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 className="section-title" style={{ marginBottom: 0 }}>{refCfg.header}</h3>
                  <div className="search-wrapper" style={{ width: '180px', height: '32px' }}>
                    <Search size={14} /><input type="text" placeholder="Filtrar..." value={refSearch} onChange={e => setRefSearch(e.target.value)} style={{ fontSize: '0.8rem' }} />
                  </div>
                </div>

                <div className="pagination-container" style={{ marginBottom: '1.5rem', background: 'transparent', padding: '0.5rem 0', border: 'none' }}>
                    <div className="pagination-select-wrapper">
                      <span className="pagination-select-label">Mostrar:</span>
                      <select 
                        className="pagination-select"
                        value={refRows}
                        onChange={e => setRefRows(+e.target.value)}
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                    <div className="pagination-controls" style={{ gap: '8px' }}>
                      <button type="button" className="btn-page-nav" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={refPage === 1} onClick={() => setRefPage(p => p - 1)}><ChevronLeft size={20}/></button>
                      <span style={{ fontSize: '1rem', color: 'var(--text-color)', fontWeight: 600, margin: '0 12px' }}>{refPage}/{totalRefPages || 1}</span>
                      <button type="button" className="btn-page-nav" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={refPage === totalRefPages || totalRefPages === 0} onClick={() => setRefPage(p => p + 1)}><ChevronRight size={20}/></button>
                    </div>
                </div>

                <div className="mini-table" style={{ flex: 1 }}>
                  <table className="compact-table">
                    <thead><tr>{refCfg.cols.map((c, i) => (<th key={i} style={{ width: c.width, textAlign: c.center ? 'center' : 'left' }}>{c.label}</th>))}</tr></thead>
                    <tbody>
                      {paginatedRef.map((it) => (
                        <tr key={it[refCfg.idKey]}>
                          {refCfg.cols.map((c, i) => (<td key={i} style={{ textAlign: c.center ? 'center' : 'left' }}>{it[c.key] || '—'}</td>))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modificar;

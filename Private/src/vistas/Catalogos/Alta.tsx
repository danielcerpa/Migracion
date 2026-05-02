import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CatalogSection, CatalogEntity } from './types';

interface AltaProps {
  section: CatalogSection;
  items: CatalogEntity[];
  parentItems: CatalogEntity[];
  onBack: () => void;
  onSave: (data: Partial<CatalogEntity>) => Promise<void>;
}

const Alta: React.FC<AltaProps> = ({ section, items, parentItems, onBack, onSave }) => {
  const [form, setForm] = useState<Record<string, string | number | boolean>>({});
  const [saving, setSaving] = useState(false);
  const [refSearch, setRefSearch] = useState('');
  
  // Paginación para la tabla de referencia
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form as Partial<CatalogEntity>);
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, value: string | number | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  // Campo obligatorio principal según sección
  const isFormValid = (): boolean => {
    const str = (k: string) => String(form[k] ?? '').trim();
    const num = (k: string) => Number(form[k] ?? 0) > 0;
    switch (section) {
      case 'pais':        return str('nombre') !== '';
      case 'estado':      return num('idPais') && str('nombre') !== '';
      case 'municipio':   return num('idEstado') && str('nombre') !== '';
      case 'localidad':   return num('idMunicipio') && str('nombre') !== '';
      case 'orden':
      case 'tipo':        return str('nombre') !== '';
      case 'familia':     return str('nombre') !== '';
      case 'subfamilia':  return str('nombre') !== '';
      case 'tribu':       return str('nombre') !== '';
      case 'genero':      return str('nombre') !== '';
      case 'especie':     return str('nombre') !== '';
      case 'colector':
      case 'determinador':return str('nombre') !== '';
      case 'planta':      return str('nombre_cientifico') !== '';
      case 'organismo':   return str('nombre_organismo') !== '';
      case 'coleccion':   return str('acronimo') !== '';
      case 'cita':        return str('titulo') !== '';
      default:            return false;
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
            <div className="form-group">
              <label>Nombre del País *</label>
              <input type="text" required placeholder="Ej. México" onChange={e => set('nombre', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Código (ISO)</label>
              <input type="text" maxLength={5} placeholder="Ej. MX" onChange={e => set('codigo', e.target.value)} />
            </div>
          </div>
        );

      case 'estado':
        return (
          <div className="form-grid-2">
            <div className="form-group">
              <label>ID País *</label>
              <input type="number" required placeholder="ID del país" onChange={e => set('idPais', +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Nombre del Estado *</label>
              <input type="text" required placeholder="Ej. Jalisco" onChange={e => set('nombre', e.target.value)} />
            </div>
          </div>
        );

      case 'municipio':
        return (
          <div className="form-grid-2">
            <div className="form-group">
              <label>ID Estado *</label>
              <input type="number" required placeholder="ID del estado" onChange={e => set('idEstado', +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Nombre del Municipio *</label>
              <input type="text" required placeholder="Ej. Guadalajara" onChange={e => set('nombre', e.target.value)} />
            </div>
          </div>
        );

      case 'localidad':
        return (
          <>
            <div className="form-grid-2">
              <div className="form-group">
                <label>ID Municipio *</label>
                <input type="number" required placeholder="ID del municipio" onChange={e => set('idMunicipio', +e.target.value)} />
              </div>
              <div className="form-group">
                <label>Nombre de la Localidad *</label>
                <input type="text" required placeholder="Ej. El Salto" onChange={e => set('nombre', e.target.value)} />
              </div>
            </div>
            <div className="form-grid-3">
              <div className="form-group">
                <label>Latitud</label>
                <input type="text" placeholder="00.0000" onChange={e => set('latitud', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Longitud</label>
                <input type="text" placeholder="-00.0000" onChange={e => set('longitud', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Altitud</label>
                <input type="text" placeholder="0000m" onChange={e => set('altitud', e.target.value)} />
              </div>
            </div>
          </>
        );

      case 'orden':
      case 'tipo':
        return (
          <div className="form-group">
            <label>Nombre *</label>
            <input type="text" required placeholder="Nombre del registro" onChange={e => set('nombre', e.target.value)} />
          </div>
        );

      case 'familia':
        return (
          <div className="form-grid-2">
            <div className="form-group">
              <label>ID Orden</label>
              <input type="number" placeholder="ID del orden" onChange={e => set('idOrden', +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Nombre *</label>
              <input type="text" required placeholder="Nombre de la familia" onChange={e => set('nombre', e.target.value)} />
            </div>
          </div>
        );

      case 'subfamilia':
        return (
          <div className="form-grid-2">
            <div className="form-group">
              <label>ID Familia</label>
              <input type="number" placeholder="ID de la familia" onChange={e => set('idFamilia', +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Nombre *</label>
              <input type="text" required placeholder="Nombre de la subfamilia" onChange={e => set('nombre', e.target.value)} />
            </div>
          </div>
        );

      case 'tribu':
        return (
          <div className="form-grid-2">
            <div className="form-group">
              <label>ID Subfamilia</label>
              <input type="number" placeholder="ID de la subfamilia" onChange={e => set('idSubfamilia', +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Nombre *</label>
              <input type="text" required placeholder="Nombre de la tribu" onChange={e => set('nombre', e.target.value)} />
            </div>
          </div>
        );

      case 'genero':
        return (
          <div className="form-grid-2">
            <div className="form-group">
              <label>ID Tribu</label>
              <input type="number" placeholder="ID de la tribu" onChange={e => set('idTribu', +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Nombre *</label>
              <input type="text" required placeholder="Nombre del género" onChange={e => set('nombre', e.target.value)} />
            </div>
          </div>
        );

      case 'especie':
        return (
          <>
            <div className="form-grid-2">
              <div className="form-group">
                <label>ID Género</label>
                <input type="number" placeholder="ID del género" onChange={e => set('idGenero', +e.target.value)} />
              </div>
              <div className="form-group">
                <label>Nombre *</label>
                <input type="text" required placeholder="Nombre de la especie" onChange={e => set('nombre', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Subespecie</label>
              <input type="text" placeholder="Nombre de la subespecie" onChange={e => set('subespecie', e.target.value)} />
            </div>
          </>
        );

      case 'colector':
      case 'determinador':
        return (
          <>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Nombre(s) *</label>
                <input type="text" required placeholder="Nombres" onChange={e => set('nombre', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Apellido Paterno</label>
                <input type="text" placeholder="Primer apellido" onChange={e => set('apellido_paterno', e.target.value)} />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Apellido Materno</label>
                <input type="text" placeholder="Segundo apellido" onChange={e => set('apellido_materno', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Correo</label>
                <input type="email" placeholder="email@ejemplo.com" onChange={e => set('correo', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Institución</label>
              <input type="text" placeholder="Nombre de la institución" onChange={e => set('institucion', e.target.value)} />
            </div>
          </>
        );

      case 'planta':
        return (
          <>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Familia Botánica</label>
                <input type="text" placeholder="Familia" onChange={e => set('familia_botanica', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Nombre Científico *</label>
                <input type="text" required placeholder="Género especie" onChange={e => set('nombre_cientifico', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Nombre Común</label>
              <input type="text" placeholder="Nombre local" onChange={e => set('nombre_comun', e.target.value)} />
            </div>
          </>
        );

      case 'organismo':
        return (
          <div className="form-grid-2">
            <div className="form-group">
              <label>Familia Hospedera</label>
              <input type="text" placeholder="Familia" onChange={e => set('familia_hospedera', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Nombre Organismo *</label>
              <input type="text" required placeholder="Nombre científico/común" onChange={e => set('nombre_organismo', e.target.value)} />
            </div>
          </div>
        );

      case 'coleccion':
        return (
          <div className="form-grid-2">
            <div className="form-group">
              <label>Acrónimo *</label>
              <input type="text" required placeholder="Ej. CP" onChange={e => set('acronimo', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Nombre Institución</label>
              <input type="text" placeholder="Nombre completo" onChange={e => set('nombre_institucion', e.target.value)} />
            </div>
          </div>
        );

      case 'cita':
        return (
          <>
            <div className="form-group">
              <label>Título *</label>
              <input type="text" required placeholder="Título del trabajo" onChange={e => set('titulo', e.target.value)} />
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Autores</label>
                <input type="text" placeholder="Apellido, N." onChange={e => set('autores', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Año</label>
                <input type="number" placeholder="YYYY" onChange={e => set('anio', +e.target.value)} />
              </div>
            </div>
            <div className="form-grid-3">
              <div className="form-group">
                <label>Revista</label>
                <input type="text" placeholder="Nombre revista" onChange={e => set('revista', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Volumen</label>
                <input type="text" placeholder="Vol." onChange={e => set('volumen', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Páginas</label>
                <input type="text" placeholder="pp-pp" onChange={e => set('paginas', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Referencia Completa</label>
              <textarea placeholder="Formato APA/IEEE..." onChange={e => set('referencia_completa', e.target.value)} style={{ width: '100%', minHeight: '80px', borderRadius: '8px', padding: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }} />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const refCfg = (() => {
    const titles = sectionTitles[section];
    
    // CASOS CON DEPENDENCIAS
    if (section === 'estado') return { header: 'Países Registrados', source: parentItems, idKey: 'idPais', cols: [{ label: 'ID', key: 'idPais', center: true, width: '60px' }, { label: 'Nombre', key: 'nombre' }] };
    if (section === 'municipio') return { header: 'Estados Registrados', source: parentItems, idKey: 'idEstado', cols: [{ label: 'ID', key: 'idEstado', center: true, width: '60px' }, { label: 'Nombre', key: 'nombre' }] };
    if (section === 'localidad') return { header: 'Municipios Registrados', source: parentItems, idKey: 'idMunicipio', cols: [{ label: 'ID', key: 'idMunicipio', center: true, width: '60px' }, { label: 'Nombre', key: 'nombre' }] };
    
    if (section === 'familia') return { header: 'Órdenes Registrados', source: parentItems, idKey: 'idOrden', cols: [{ label: 'ID', key: 'idOrden', center: true, width: '60px' }, { label: 'Nombre', key: 'nombre' }] };
    if (section === 'subfamilia') return { header: 'Familias Registradas', source: parentItems, idKey: 'idFamilia', cols: [{ label: 'ID', key: 'idFamilia', center: true, width: '60px' }, { label: 'Nombre', key: 'nombre' }] };
    if (section === 'tribu') return { header: 'Subfamilias Registradas', source: parentItems, idKey: 'idSubfamilia', cols: [{ label: 'ID', key: 'idSubfamilia', center: true, width: '60px' }, { label: 'Nombre', key: 'nombre' }] };
    if (section === 'genero') return { header: 'Tribus Registradas', source: parentItems, idKey: 'idTribu', cols: [{ label: 'ID', key: 'idTribu', center: true, width: '60px' }, { label: 'Nombre', key: 'nombre' }] };
    if (section === 'especie') return { header: 'Géneros Registrados', source: parentItems, idKey: 'idGenero', cols: [{ label: 'ID', key: 'idGenero', center: true, width: '60px' }, { label: 'Nombre', key: 'nombre' }] };

    // CASOS RAÍCES
    const base = { header: `${titles} Registrados`, source: items, idKey: '', cols: [] as any[] };
    if (section === 'organismo') base.idKey = 'idOrganismo';
    else base.idKey = `id${section.charAt(0).toUpperCase()}${section.slice(1)}`;

    if (section === 'pais') base.cols = [{ label: 'Nombre', key: 'nombre' }, { label: 'ISO', key: 'codigo', center: true, width: '80px' }];
    else if (section === 'cita') base.cols = [{ label: 'Título', key: 'titulo' }, { label: 'Año', key: 'anio', center: true, width: '70px' }];
    else base.cols = [{ label: 'Nombre', key: 'nombre' }, { label: 'ID', key: base.idKey, center: true, width: '70px' }];
    
    return base;
  })();

  const filteredRef = refSearch.trim() === '' 
    ? refCfg.source 
    : (refCfg.source as any[]).filter(it => 
        Object.values(it).some(val => String(val).toLowerCase().includes(refSearch.toLowerCase()))
      );

  const totalItems = filteredRef.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRef = (filteredRef as any[]).slice(startIndex, startIndex + rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [refSearch]);

  return (
    <div className="screen-container animate-slide-in">
      <div className="screen-header">
        <div className="header-with-back">
          <button className="btn-back" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="screen-title">Nuevo {sectionTitles[section]}</h2>
          </div>
        </div>

        <div className="header-actions">
          <button type="button" className="btn-outline" onClick={onBack}>Cancelar</button>
          <button type="submit" form="catalog-alta-form" className="btn-primary with-icon" disabled={saving || !isFormValid()}>
            <Save size={18} />
            {saving ? 'Guardando...' : 'Guardar Registro'}
          </button>
        </div>
      </div>

      <div className="form-container-split">
        <form id="catalog-alta-form" className="split-layout-form" onSubmit={handleSubmit}>
          <div className="form-left-column">
            <div className="form-card">
              <div className="form-section" style={{ marginBottom: 0 }}>
                <h3 className="section-title">Datos de {sectionTitles[section]}</h3>
                {renderFields()}
              </div>
            </div>
          </div>

          <div className="form-right-column">
            <div className="form-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="form-section" style={{ marginBottom: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 className="section-title" style={{ marginBottom: 0 }}>{refCfg.header}</h3>
                  <div className="search-wrapper" style={{ width: '180px', height: '32px' }}>
                    <Search size={14} />
                    <input 
                      type="text" 
                      placeholder="Buscar..." 
                      style={{ fontSize: '0.8rem' }} 
                      value={refSearch}
                      onChange={e => setRefSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pagination-container" style={{ marginBottom: '1.5rem', background: 'transparent', padding: '0.5rem 0', border: 'none' }}>
                  <div className="pagination-select-wrapper">
                    <span className="pagination-select-label">Mostrar:</span>
                    <select 
                      className="pagination-select"
                      value={rowsPerPage}
                      onChange={e => setRowsPerPage(+e.target.value)}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  <div className="pagination-controls" style={{ gap: '8px' }}>
                    <button type="button" className="btn-page-nav" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                      <ChevronLeft size={20} />
                    </button>
                    <span style={{ fontSize: '1rem', color: 'var(--text-color)', fontWeight: 600, margin: '0 12px' }}>
                      {currentPage} / {totalPages || 1}
                    </span>
                    <button type="button" className="btn-page-nav" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                <div className="mini-table" style={{ flex: 1 }}>
                  <table className="compact-table">
                    <thead>
                      <tr>
                        {refCfg.cols.map((c, i) => (
                          <th key={i} style={{ width: c.width, textAlign: c.center ? 'center' : 'left' }}>{c.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRef.map((it) => (
                        <tr key={it[refCfg.idKey]}>
                          {refCfg.cols.map((c, i) => (
                            <td key={i} style={{ textAlign: c.center ? 'center' : 'left' }}>
                              {it[c.key] || '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {paginatedRef.length === 0 && (
                        <tr>
                          <td colSpan={refCfg.cols.length} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No hay información de referencia disponible.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Alta;
